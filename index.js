var express = require('express')
var app = express();

var Web3 = require("web3");
var config = require("./config.json");
var cors = require("cors");

const mkdirp = require("mkdirp");
const level = require("level");

mkdirp.sync(require("os").homedir() + "/.maticfaucet/exceptions");

const dbEthExceptions = level(
  require("os").homedir() + "/.maticfaucet/exceptions/eth"
);
const dbErc20Exceptions = level(
    require("os").homedir() + "/.maticfaucet/exceptions/erc20"
);
// const dbRopstenErc20Exceptions = level(
//     require('os').homedir() + '/.maticfaucet/exceptions/ropstenErc20'
// )

const db = {}
db['maticeth'] = dbEthExceptions
db['testErc20'] = dbErc20Exceptions
// db['ropstenTestErc20'] = dbRopstenErc20Exceptions

const greylistduration = config.greylistdurationinsec * 1000; // time in ms

const testErc20Artifacts = require('./ChildERC20.json')
const testErc20TokenAbi = testErc20Artifacts.abi

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
function getTestErc20Balance(web3) {
    let host = web3.currentProvider.host
    let network = host.replace("https://", "").replace(".matic.network", "").replace(".infura.io/v3/70645f042c3a409599c60f96f6dd9fbc", "")
    let tokenContract = new web3.eth.Contract(testErc20TokenAbi,config.networks[network].tokens.testErc20.tokenAddress)
    return tokenContract.methods.balanceOf(web3.eth.accounts.wallet[0].address).call()
}

async function getFaucetBalance() {
    let balances = [];
    for (let obj in web3Objects) {
        let web3 = web3Objects[obj]
        
        let rEth = await getEthBalance(web3)
        let rTest20 = await getTestErc20Balance(web3)

        balances.push({
            "network": web3.currentProvider.host.replace("https://", "").replace(".matic.network", "").replace(".infura.io/v3/70645f042c3a409599c60f96f6dd9fbc", ""),
            "account": web3.eth.accounts.wallet[0].address,
            "balanceEth": web3.utils.fromWei(rEth, 'ether'),
            "balanceTestErc20": web3.utils.fromWei(rTest20, 'ether') 
        });
    }
    return balances
}

async function getTokenInfo() {
    let tokenInfo = []

    for (let network in config.networks) {
        let _payoutEth
        let _payoutTestErc20
        let _testErc20Address
        
        for (token in config.networks[network].tokens) {
            if(token === 'maticeth') _payoutEth = config.networks[network].tokens[token].payoutamount
            if(token === 'testErc20') {
                _payoutTestErc20 = config.networks[network].tokens[token].payoutamount
                _testErc20Address = config.networks[network].tokens[token].tokenAddress
            }
        }

        tokenInfo.push({
            network: network,
            payoutEth: _payoutEth,
            payoutTestErc20: _payoutTestErc20,
            testErc20Address: _testErc20Address
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
app.use(express.static("static/build"));

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
    cleanupExceptions('maticeth')
    cleanupExceptions('testErc20')
}, config.checkfreqinsec * 100);

app.post("/:network/:token/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);
    let network = req.params.network 
    let token = req.params.token 
    let address = req.params.address 
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
        return res.status(500).json({
            err: e
        });
    })
})

async function startTransfer(ip, address, token, amount, network) {
    let addressException = await getException(address, token)
    let ipException = await getException(ip, token)

    let exception = addressException || ipException
    
    if (exception) {
        console.log(exception.address, "is on the greylist");
        var values = {
            address: exception.address,
            message: "you are greylisted",
            duration: (exception.created + greylistduration) - Date.now()
        }
        return Promise.reject(values)
    }
    
    let receipt = await _startTransfer(address, token, amount, network)
    
    await setException(address, token)
    await setException(ip, token)
    
    return receipt
}

async function _startTransfer(address, token, amount, network) {
    if (token === 'maticeth') return transferEth(address, amount, network)
    if (token === 'testErc20') return transferTestErc20(address, amount, network)
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

async function transferTestErc20(_to, _amount, network) {
    console.log('---start tx---')
    let web3 = web3Objects[network]
    let _from = web3.eth.accounts.wallet[0].address
    let _gasPrice = await web3.eth.getGasPrice()
    console.log('gas price is', _gasPrice)

    let tokenAddress = config.networks[network].tokens.testErc20.tokenAddress
    let tokenContract = new web3.eth.Contract(testErc20TokenAbi, tokenAddress)

    let decimals = await tokenContract.methods.decimals().call()
    let amt = (_amount * Math.pow(10, decimals)).toString()
    let options = {
        from: _from,
        to: _to,
        gas: 314150,
        gasPrice: _gasPrice
    }
    console.log(options);
    let r = await tokenContract.methods.transfer(_to, amt)
                               .send(options)
                               .on('receipt', (receipt) => {
                                   console.log(receipt.transactionHash)
                               })
                               .on('error', (err) => {
                                   return Promise.reject(err)
                               })

    console.log('---end tx---')
    return Promise.resolve(r.transactionHash)
}