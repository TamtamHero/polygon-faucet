var express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data
var cors = require("cors");
var app = express();
app.use(cors());
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded())

const axios = require("axios")

var Web3 = require("web3");
var config = require("./config.json");

const mkdirp = require("mkdirp");
const level = require("level");

mkdirp.sync(require("os").homedir() + "/.maticfaucet/exceptions");

const dbEthExceptions = level(
  require("os").homedir() + "/.maticfaucet/exceptions/eth"
);

const db = {}
db['matic'] = dbEthExceptions

const greylistduration = config.greylistdurationinsec * 1000; // time in ms

// check for valid Eth address
function isAddress(address) {
    return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

// strip any spaces and add 0x
function fixaddress(address) {
    address = address.replace(" ", "");
    address = address.toLowerCase();
    if (!strStartsWith(address, "0x")) {
      return "0x" + address;
    }
    return address;
}

// helper
function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

let web3Objects = {};

for (let network in config.networks) {
    console.log(network)
    let currentNetwork = config.networks[network]
    console.log(currentNetwork.rpc)
    console.log('connecting to', network)
    web3 = new Web3 (currentNetwork.rpc)
    console.log('adding key')
    web3.eth.accounts.wallet.add (currentNetwork.privateKey)
    console.log('wallet addr=', web3.eth.accounts.wallet[0].address)
    web3Objects[network] = web3
    console.log('---')
}

function getEthBalance(web3) {
    return (web3.eth.getBalance(web3.eth.accounts.wallet[0].address))
}

function getAccountBalance(account) {
    let web3 = web3Objects["rpc-mainnet"];
    return (web3.eth.getBalance(account))
}

async function getFaucetBalance() {
    let balances = [];
    for (let obj in web3Objects) {
        let web3 = web3Objects[obj]
        
        let rEth = await getEthBalance(web3)

        balances.push({
            "network": web3.currentProvider.host.replace("https://", "").replace(".matic.network", ""),
            "account": web3.eth.accounts.wallet[0].address,
            "balanceEth": web3.utils.fromWei(rEth, 'ether')
        });
    }
    return balances
}

async function getTokenInfo() {
    let tokenInfo = []

    for (let network in config.networks) {
        let _payoutEth

        tokenInfo.push({
            network: network,
            payoutEth: _payoutEth,
        })
    }
    
    return tokenInfo
}

// start webserver
app.listen(config.httpport, function() {
    console.log('faucet listening on port', config.httpport, '...')
})

app.use(cors());

//frontend app serving directory
// app.use(express.static("static/build"));

app.get('/info', function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);
    getFaucetBalance().then((r) => {
        res.status(200).json({
            checkfreqinsec: config.checkfreqinsec,
            greylistdurationinsec: config.greylistdurationinsec,
            balances: r
        })
    })
})

app.get('/tokenInfo', function (req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);
    getTokenInfo().then((r) => {
        res.status(200).json({
            tokenInfo: r
        })
    })
})

function getException(address, token) {
    return new Promise ((resolve, reject) => {
        db[token].get(address, function(err, value) {
            if (err) {
                if (err.notFound) {
                    return resolve()
                }
                return reject(err)
            }
            value = JSON.parse(value)
            resolve(value)
        })
    })
}

function setException(address, token){
    console.log("adding", address, "to greylist")
    return new Promise((resolve, reject) => {
        db[token].put(
            address, 
            JSON.stringify({
                created: Date.now(),
                reason: 'greylist', 
                address: address
            }),
            function(err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            }
        )
    })
}

function cleanupExceptions(token) {
    var stream = db[token].createReadStream({
        keys: true,
        values: true
    }).on("data", item => {
        const value = JSON.parse(item.value);
        if(value.created < Date.now() - greylistduration) {
            db[token].del(item.key, err => {
                console.log("removed ", item.key, "from greylist.");
            })
        }
    })
}

// exception monitor
setInterval(() => {
    cleanupExceptions('matic')
}, config.checkfreqinsec * 100);

app.post("/", upload.array(), function(req, res) {
    console.log(req.body);
    let captcha = req.body.captcha
    axios
    .post("https://hcaptcha.com/siteverify",{
        secret: config.hcaptchasecret,
        response: captcha
    })
    .then(response => {
        if (response.status === 200) {
            var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            console.log("client IP=", ip);
            let network = req.body.network
            let token = req.body.token
            let address = req.body.account
            let amount = config.networks[network].tokens[token].payoutamount
            if (!isAddress(fixaddress(address))) {
                // invalid addr
                console.log("INVALID ADDR. 400")
                return res.status(400).json({
                    msg: "invalid address."
                })
            }
            startTransfer(ip, address, token, amount, network).then((r) => {
                // successful transaction
                console.log("OK. 200")
                return res.status(200).json({
                    hash: r
                });
            }).catch(e => {
                // either tx error/ greylisted
                console.log("ERROR:500")
                console.log(e)
                // return res.status(500).json({
                //     err: e
                // });
            })
        }
    });
})

async function startTransfer(ip, address, token, amount, network) {
    let addressException = await getException(address, token)
    let ipException = await getException(ip, token)

    let exception = addressException || ipException

    if (exception) {
        console.log(exception.address, "is on the greylist");
        var values = {
            address: exception.address,
            message: "This account has already received funds",
            duration: (exception.created + greylistduration) - Date.now()
        }
        return Promise.reject(values)
    }

    let balanceException = await getAccountBalance(address) > config.networks[network].tokens[token].maxbalance;
    if(balanceException){
        console.log(address, "has a too high balance");
        var values = {
            message: "you already have a sufficient balance to use Polygon network",
        }
        return Promise.reject(values)
    }

    let receipt = await _startTransfer(address, token, amount, network)
    
    await setException(address, token)
    await setException(ip, token)
    
    return receipt
}

async function _startTransfer(address, token, amount, network) {
    if (token === 'matic') return transferEth(address, amount, network)
}

async function transferEth(_to, _amount, network) {
    console.log('---start tx---')
    let web3 = web3Objects[network]
    let _from = web3.eth.accounts.wallet[0].address
    let _gasPrice = await web3.eth.getGasPrice();
    console.log("gasprice is ", _gasPrice);
    let amt = (_amount * Math.pow(10, 18)).toString()
    var options = {
        from: _from,
        to: _to,
        value: amt,
        gas: 314150,
        gasPrice: _gasPrice
    }
    console.log(options);
    let r = await web3.eth.sendTransaction(options)
                  .on('receipt', (receipt) => {
                      console.log('transfer successful!', receipt.transactionHash)
                  })
                  .on('error', (err) => {
                      return Promise.reject(err);
                  })
    console.log('---end tx---')
    return Promise.resolve(r.transactionHash);
}