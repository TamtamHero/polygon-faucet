import Web3 from "web3";

class AccountManager {
  constructor() {
    this.connected = false;
    this.busy = false;
    this.web3Provider = null;
    this.web3 = null;
    this.balance = 0;
  }

  async connect() {
    if (!this.connected) {
      if (window.ethereum) {
        this.web3Provider = window.ethereum;
        try {
          // Request account access
          this.account = await this.web3Provider.request({
            method: "eth_requestAccounts",
            params: [],
          });
        } catch (error) {
          // User denied account access...
          console.error("User denied account access");
        }
        this.web3 = new Web3(this.web3Provider);
        this.connected = true;
        console.log(`connected: ${this.account} ${typeof this.account}`);
        return this.account;
      }
    }
  }

  async getBalance(formatted = true) {
    const decimals = 18;
    this.balance = await this.web3.eth.getBalance(String(this.account));
    let balance_BN = this.web3.utils.toBN(this.balance);
    let decimals_BN = this.web3.utils.toBN(10**decimals);
    let before_comma = balance_BN.div(decimals_BN).toString();
    let after_comma = balance_BN.mod(decimals_BN).toString();
    after_comma = after_comma.padStart(decimals, "0");
    this.formatted_balance = before_comma + "." + after_comma + " MATIC";
    return formatted ? this.formatted_balance : this.balance;
  }

}

export default AccountManager;
