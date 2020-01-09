# Matic-ETH faucet server

built upon: https://github.com/sponnet/locals-faucetserver

supports matic-eth and test-erc20 token transfers to (pay out amount `1` maticEth and `2` test erc20 tokens) beta2, alpha, testnet2, testnet3, ropsten and eth-mainnet

- payout frequency: 120 seconds
- server check frequency: 10 seconds

(configured in `server/config.json`)

address and ip are 'greylisted' right after a successful transaction - for 60 seconds. greylists are reset every 10 seconds.

![screenshot](screen.png)

# installing

```
$ git clone https://github.com/nglglhtr/matic-faucet
$ cd matic-faucet && cd server && npm install
$ cd .. && cd client && npm install
$ cd ..
```

## Configuring the faucet API

edit ```config.json``` in the `server/` directory and add private keys to the accounts for each network.

Start your faucet:

```
node index.js
```

## Configuring the faucet frontend

edit the file `client/src/config.js` and specify the base URL for your API. Run `npm run start`

# API

## Endpoints

### ```GET https://<FAUCET-URL>/info```

#### Response
```
{
	checkfreqinsec: ...,
	greylistdurationinsec: ...,
	balances: [
		{
			"network": ...,
			"account": ...,
			"balanceEth": ...,
			"balanceTestErc20": ...
		},
		...
	]
}
```

### ```GET https://<FAUCET-URL>/tokenInfo```

#### Response 

```
{
	"tokenInfo":[
		{
			"network": ...,
			"payoutEth": ...,
			"payoutTestErc20": ...,
			"testErc20Address": ...
		},
		...
	]
}
```

### ```GET https://<FAUCET-URL>/{network name}/{token}/{ethereum address}```

#### Request parameters

- #### Network Name
|name|RPC|
|---|---|
|`testnet2`|`https://testnet2.matic.network`|
|`testnetv3`|`https://testnetv3.matic.network`|
|`alpha.ethereum`|`https://alpha.ethereum.matic.network`|
|`betav2`|`https://betav2.matic.network`|
|`ropsten`|`infura node url`|

- #### token
|name|token|
|---|---|
|`maticeth`|the native coin on these testnets|
|`testErc20`|TEST token - can be used to deposit/withdraw from Matic networks|


- #### ethereum address
your ethereum address


#### Response format
Status code: 200
```
{ 
	hash: 0x2323... 
}
```
Status code: 500
```
{
	err: {
		...
	}
}
```
* `hash` transaction hash 

## Example Usage

`curl http://localhost:3000/ropsten/testErc20/0x96C42C56fdb78294F96B0cFa33c92bed7D75F96a`


## HTTP Return / error codes

* `200` : Request OK
* `400` : Invalid address
* `500` : error (greylisted/ tx error)
