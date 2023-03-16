# DEPRECATED - Polygon mainnet faucet server/frontend

~~App available at https://matic.supply~~ APP DEPRECATED

built upon: [locals-faucetserver](https://github.com/sponnet/locals-faucetserver) and [matic-faucet](https://github.com/nglglhtr/matic-faucet)

supports MATIC transfers on Polygon mainnet

- payout frequency: 120 seconds
- server check frequency: 10 seconds
- max amount on account to be able to claim: 0.005 MATIC (same as payout)

(configured in `server/config.json`)

address and ip are 'greylisted' right after a successful transaction - for 60 seconds. greylists are reset every 10 seconds.

![screenshot](screen.png)

# installing

```
$ git clone https://github.com/tamtamhero/matic-faucet
$ cd matic-faucet && cd server && npm install
$ cd .. && cd frontend && npm install
$ cd ..
```

## Configuring the faucet API

edit ```config.json``` in the `server/` directory and add private keys to the accounts for each network.

Start your faucet:

```
node index.js
```

## Configuring the faucet frontend

edit the file `frontend/src/config.js` and specify the base URL for your API. Run `npm run start`

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

### ```POST https://<FAUCET-URL>```
```
{
	network: "rpc-mainnet",
	token: "matic",
	account: "0xCC2161DB3200EEF7E37E21542dA2F0179fB9c59A"
}
```

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
