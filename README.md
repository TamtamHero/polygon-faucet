# Matic-ETH faucet server

supports matic-eth transfers to (pay out amount `0.1`) beta2, alpha, testnet2 and testnet3
payout frequency: 60 seconds
server check frequency: 10 seconds
(configured in `config.json`)

address and ip are 'greylisted' right after a successful transaction - for 60 seconds. greylists are reset every 10 seconds.

![screenshot](screen.png)

# installing

> Use Node v8.16.2 (`nvm use 8`)

```
cd matic-faucet
npm install
cd static
npm install
yarn build
cd ..
```

## Configuring the faucet API

edit ```config.json``` in the root directory and add private keys to the accounts for each network.

Start your faucet:

```
node index.js
```
head over to `localhost:3000` and test the faucet.

## Configuring the faucet frontend

edit the file `static/src/config.js` and specify the base URL for your API (and run `yarn build`)

# API


## Endpoints

```GET https://<FAUCET-URL>/info```

```GET https://<FAUCET-URL>/{network name}/{token}/{ethereum address}```

## Request parameters

- ### Network Name
|name|network|
|---|---|
|`testnet2`|`https://testnet2.matic.network`|
|`testnet3`|`https://testnetv3.matic.network`|
|`alpha`|`https://alpha.ethereum.matic.network`|
|`beta2`|`https://betav2.matic.network`|

- ### Token
|name|token|
|---|---|
|`maticeth`|the native coin on these testnets|


- ```ethereum address``` your ethereum address


## Response format
```
{ 
	hash: 0x2323... 
}
```
```
{
	err: {
		...
	}
}
```
* `hash` transaction hash 

## HTTP Return / error codes

* `200` : Request OK
* `400` : Invalid address
* `500` : error (greylisted/ tx error)