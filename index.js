var express = require('express')
var app = express();

var Web3 = require("web3");
var config = require("./config.json");
var cors = require("cors");

const mkdirp = require("mkdirp");
const level = require("level");

mkdirp.sync(require("os").homedir() + "/.maticfaucet/exceptions");

const dbExceptions = level(
  require("os").homedir() + "/.maticfaucet/exceptions"
);

const greylistduration = config.greylistdurationinsec * 1000; // time in ms

// check for valid Eth address
function isAddress(address) {
    return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

// strip any spaces and add 0x
function fixaddress(address) {
    // Strip all spaces
    address = address.replace(" ", "");
    // Address lowercase
    address = address.toLowerCase();
    //console.log("Fix address", address);
    if (!strStartsWith(address, "0x")) {
      return "0x" + address;
    }
    return address;
}

// helper
function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

let web3Objects = [];

for (let network in config.networks) {
    console.log(network)
    let currentNetwork = config.networks[network]
    console.log(currentNetwork.rpc)
    console.log('connecting to', network)
    web3 = new Web3 (currentNetwork.rpc)
    console.log('adding key')
    web3.eth.accounts.wallet.add (currentNetwork.privateKey)
    console.log('wallet addr=', web3.eth.accounts.wallet[0].address)
    web3Objects.push(web3)
    console.log('---')
}

function getBalance(web3) {
    return (web3.eth.getBalance(web3.eth.accounts.wallet[0].address))
}

async function getFaucetBalance() {
    let balances = [];
    for (let obj in web3Objects) {
        let web3 = web3Objects[obj]
        const r = await getBalance(web3)
        balances.push({
            "network": web3.currentProvider.host,
            "account": web3.eth.accounts.wallet[0].address,
            "balance": web3.utils.fromWei(r, 'ether')
        });
    }
    return balances
}
// getFaucetBalance()

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

function getException(address) {
    return new Promise((resolve, reject) => {
        dbExceptions.get(address, function(err, value) {
            if (err) {
                if (err.notFound) {
                    return resolve();
                }
                return reject(err)
            }
            value = JSON.parse(value);
            resolve(value);
        })
    })
}

function setException(address, reason){
    console.log("adding", address, "to greylist")
    return new Promise((resolve, reject) => {
        dbExceptions.put(
            address, 
            JSON.stringify({
                created: Date.now(),
                reason: reason, 
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

function cleanupException() {
    var stream = dbExceptions.createReadStream({
        keys: true,
        values: true
    }).on("data", item => {
        const value = JSON.parse(item.value);
        if(value.reason === "greylist") {
            if(value.created < Date.now() - greylistduration) {
                dbExceptions.del(item.key, err => {
                    console.log("removed ", item.key, "from greylist.");
                })
            }
        }
    })
}

// exception monitor
setInterval(() => {
    cleanupException();
}, config.checkfreqinsec * 1000);

app.get("/testnet2/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet2.tokens.maticeth.payoutamountinether
    var network = 0

    if (!isAddress(fixaddress(address))) {
        // invalid addr
        console.log("INVALID ADDR. 400")
        return res.status(400).json({
            msg: "invalid address."
        })
    }
    
    startTransfer(address, ip, amount, network).then((r) => {
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

app.get("/testnet3/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet3.tokens.maticeth.payoutamountinether
    var network = 1

    if (!isAddress(fixaddress(address))) {
        // invalid addr
        console.log("INVALID ADDR. 400")
        return res.status(400).json({
            msg: "invalid address."
        })
    }
    
    startTransfer(address, ip, amount, network).then((r) => {
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

app.get("/alpha/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet3.tokens.maticeth.payoutamountinether
    var network = 2

    if (!isAddress(fixaddress(address))) {
        // invalid addr
        console.log("INVALID ADDR. 400")
        return res.status(400).json({
            msg: "invalid address."
        })
    }
    
    startTransfer(address, ip, amount, network).then((r) => {
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

app.get("/beta2/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet3.tokens.maticeth.payoutamountinether
    var network = 3

    if (!isAddress(fixaddress(address))) {
        // invalid addr
        console.log("INVALID ADDR. 400")
        return res.status(400).json({
            msg: "invalid address."
        })
    }
    
    startTransfer(address, ip, amount, network).then((r) => {
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

function startTransfer(address, ip, amount, network) {
    return new Promise ((resolve, reject) => {
        Promise.all([getException(address), getException(ip)]).then(
            ([addressException, ipException]) => {
                var exception = addressException || ipException;
    
                if (exception) {
                    console.log(exception.address, "is on the greylist");
                    var values = {
                        address: exception.address,
                        message: "you are greylisted",
                        duration: (exception.created + greylistduration) - Date.now()
                    }
                    reject(values);
                } else {
                    // transfer funds
                    console.log('transferring',amount, 'Matic ETH to', address)
                    transferEth(address, amount, network).then((r) => {
                        Promise.all([setException(ip, 'greylist'), setException(address, 'greylist')]).then(() => {
                            resolve(r)
                        })
                    }).catch(e => {
                        reject(e)
                    })
                }
            }
        )
    })
}

async function transferEth(_to, _amount, network) {
    console.log('---start tx---')
    let web3
    web3 = web3Objects[network]
    let _from = web3.eth.accounts.wallet[0].address

    let _gasPrice = await web3.eth.getGasPrice();
    
    console.log("gasprice is ", _gasPrice);
    
    console.log('transferring on',web3.currentProvider.host)

    var amt = _amount * 1e18;

    var options = {
        from: _from,
        to: _to,
        value: amt,
        gas: 314150,
        gasPrice: _gasPrice
    }

    console.log ('transferring', amt, 'wei from', _from, 'to', _to);

    console.log(options);

    const result = await web3.eth.sendTransaction(options);
    console.log('transfer successful!', result.transactionHash)
    console.log('---end tx---')
    return result.transactionHash;
}