var lightwallet = require("eth-lightwallet");
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

if (!process.argv[2]) {
	console.log('Usage: ' + process.argv[1] + ' <password>');
	console.log('Creates a new lightwallet with given password');
	process.exit();
}

var hdPath = `m/44'/60'/0'/0`
lightwallet.keystore.deriveKeyFromPassword(process.argv[2], (err, pwDerivedKey) => {
	var keystore = new lightwallet.keystore(mnemonic, pwDerivedKey, hdPath);
	keystore.generateNewAddress(pwDerivedKey,1,hdPath)
	console.log(keystore.serialize());
});
