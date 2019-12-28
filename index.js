var express = require('express')
var app = express();

const mkdirp = require("mkdirp");
var Web3 = require("web3");
var config = require("./config.json");
var cors = require("cors");
const level = require("level");

mkdirp.sync(require("os").homedir() + "/.ethfaucetssl/queue");
mkdirp.sync(require("os").homedir() + "/.ethfaucetssl/exceptions");
const dbQueue = level(require("os").homedir() + "/.ethfaucetssl/queue");
const dbExceptions = level(
  require("os").homedir() + "/.ethfaucetssl/exceptions"
);
const greylistduration = 10;
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
    // var ethbalance = -1;

    getFaucetBalance().then((r) => {
        res.status(200).json({
        payoutfreq: config.payoutfrequencyinsec,
        balances: r
        })
    })
})
// app.get("/testnet2/testerc20/:address")
app.get("/testnet2/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet2.tokens.maticeth.payoutamountinether
    var network = 0

    // transfer funds
    console.log('transferring',amount, 'Matic ETH to', address)

    transferEth(address, amount, network).then((r) => {
        res.status(200).json({
            hash: r
        });
    })
})

app.get("/testnet3/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet3.tokens.maticeth.payoutamountinether
    var network = 1

    // transfer funds
    console.log('transferring',amount, 'Matic ETH to', address)

    transferEth(address, amount, network).then((r) => {
        res.status(200).json({
            hash: r
        });
    })
})

app.get("/alpha/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet3.tokens.maticeth.payoutamountinether
    var network = 2

    // transfer funds
    console.log('transferring',amount, 'Matic ETH to', address)

    transferEth(address, amount, network).then((r) => {
        res.status(200).json({
            hash: r
        });
    })
})

app.get("/beta2/maticeth/:address", function(req, res) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("client IP=", ip);

    var address = req.params.address
    var amount = config.networks.testnet3.tokens.maticeth.payoutamountinether
    var network = 3

    // transfer funds
    console.log('transferring',amount, 'Matic ETH to', address)

    transferEth(address, amount, network).then((r) => {
        res.status(200).json({
            hash: r
        });
    })
})

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