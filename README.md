# Matic-ETH faucet server

supports matic-eth transfers to (pay out amount `0.1`) beta2, alpha, testnet2 and testnet3

# installing

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


## Endpoint
```GET https://<FAUCET-URL>/<NETWORK-NAME>/<TOKEN>/{ethereum address}```

## Request parameters

### Network Name
|name|network|
|---|---|---|
|`testnet2`|`https://testnet2.matic.network`|
|`testnet3`|`https://testnetv3.matic.network`|
|`alpha`|`https://alpha.ethereum.matic.network`|
|`beta2`|`https://betav2.matic.network`|

### Token
|name|token|
|---|---|
|`maticeth`|the native coin on these testnets|
|`testerc20`|TEST erc20 token|


```ethereum address``` your ethereum address


## Response format
```
{ 
	hash: 0x2323... 
}
```
* ```hash``` transaction hash 

## HTTP Return / error codes

* ```200``` : Request OK











