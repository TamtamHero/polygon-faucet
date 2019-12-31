const Web3 = require('web3')
const web3 = new Web3('https://testnet2.matic.network')
let amount = 1
console.log('hey', web3.utils.toWei(amount.toString(),'ether'))
// let amt = web3.utils.toWei(amount, 'ether')