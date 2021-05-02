# Polygon mainnet faucet server/frontend

built upon: https://github.com/sponnet/locals-faucetserver and https://github.com/nglglhtr/matic-faucet

supports MATIC transfers on Polygon mainnet

- payout frequency: 120 seconds
- server check frequency: 10 seconds
- max amount on account to be able to claim: 0.0005 MATIC (same as payout)

(configured in `server/config.json`)

address and ip are 'greylisted' right after a successful transaction - for 60 seconds. greylists are reset every 10 seconds.

![screenshot](screen.png)

# installing

```
$ git clone https://github.com/tamtamhero/matic-faucet
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
|`rpc-mainnet`|`https://rpc-mainnet.matic.network`|

- #### Polygon address
your polygon address

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

`curl http://localhost:3000/rpc-mainnet/matic/0x96C42C56fdb78294F96B0cFa33c92bed7D75F96a`


## HTTP Return / error codes

* `200` : Request OK
* `400` : Invalid address
* `500` : error (greylisted/ tx error)
