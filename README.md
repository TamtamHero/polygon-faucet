# Matic-ETH faucet server

built upon https://github.com/sponnet/locals-faucetserver.

two lists are maintained: 

`greylist` - an account and the ip is greylisted for `10 ms` (increase for production) as soon as one request is completed.

`blacklist` - an account/ip can be blacklisted indefinitely.

# installing

```
cd matic-faucets
npm install
cd static
npm install
yarn build
cd ..
```

## Configuring the faucet API

create a file `.secret` and enter the seed phrase of your wallet

```
node mkwallet.js test > wallet.json
```

You can change `test` to whatever the password is that you want to encrypt your wallet with.

the wallet uses hd path `m/44'/60'/0'/0`

Create a config file ```config.json```

```
{
	"etherscanroot": "https://explorer.testnet2.matic.network/address/",
	"payoutfrequencyinsec": 60,
	"payoutamountinether": 0.1,
	"queuesize": 5,
	"walletpwd": "test",
	"httpport": 3000,
	"web3": {
		"host": "https://testnet2.matic.network"
	}
}
```

Start your faucet:

```
node index.js
```


## Configuring the faucet frontend

edit the file `static/src/config.js` and specify the base URL for your API

```
const config = {
  apiurl: "http://localhost:3000",
  etherscanroot: "https://explorer.testnet2.matic.network"
};

export default config;
```

# API

## Endpoint
```GET https://<FAUCET-URL>/donate/{ethereum address}```

## Request parameters
```ethereum address``` your ethereum address

## Response format
```
{
"paydate": 1461335186,
"address": "0x687422eea2cb73b5d3e242ba5456b782919afc85",
"amount": 1000000000000000000,
"txhash": "0x..."
}
```

* ```paydate``` the unix timestamp when the transaction will be executed. Depends on the current length of the queue
* ```address``` the address where the payment will be done
* ```amount``` the amount in Wei that will be transferred
* ```txhash``` transaction hash : if the queue is empty, you will immediately receive the transaction hash - if the queue is not empty - your request will be queued until paydate and the txhash field will be empty.

## HTTP Return / error codes

* ```200``` : Request OK
* ```400``` : The address is invalid
* ```403``` : The queue is full / you are greylisted / blacklisted.
* ```500``` : Internal faucet error











