import React, { Component } from "react";
import "./FaucetRequest.css";
import Web3 from "web3";
import config from "react-global-configuration";
import axios from "axios";

const FaucetERC20 = require('./FaucetERC20')
const contractAddress = '0x2405692f026e787ff432b88547010acd7cc9894a'
let faucetERC20Contract;

class FaucetRequestMain extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      targetAccount: "", 
      selectedNetwork: "",
      selectedToken: "testErc20",
      requestrunning: false,
      // faucetERC20Contract: null
    };
    this.networkChange = this.networkChange.bind(this);
    this.tokenChange = this.tokenChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
  }
  tokenChange(e) {
    this.setState({
      selectedToken: e.currentTarget.value
    })
  }
  networkChange(e) {
    this.setState ({
      selectedNetwork: e.currentTarget.value
    })
  }
  handleChange(event) {
    this.setState({ targetAccount: event.target.value });
  }

  clearMessages(event) {
    this.setState({ faucetresponse: null, fauceterror: null });
  }

  handleSubmit(event) {
    this.clearMessages();
    if (this.state.selectedNetwork === 'ethereum') {  
      faucetERC20Contract = new this.web3.eth.Contract (FaucetERC20.abi, contractAddress)
      try{
        this.web3.eth.getGasPrice().then((_gasPrice) => {
          faucetERC20Contract.methods.getTokens(this.state.targetAccount).estimateGas({
            from: this.state.targetAccount,
            gasPrice: _gasPrice
          }).then((estimatedGas) => {
            faucetERC20Contract.methods.getTokens(this.state.targetAccount).send({
              from: this.state.targetAccount,
              gas: estimatedGas
            }).on('receipt', (receipt) => {
              this.setState({
                faucetresponse: {
                  txhash: receipt.transactionHash,
                  etherscanlink: config.get([this.state.selectedNetwork]) + '/tx/' + receipt.transactionHash
                }
              })
            }).on('error', (receipt) => {
              this.setState({
                fauceterror: {
                  message: 'Transaction Error'
                }
              })
            })
          })
        })
      } catch (err) {
        this.setState({
          fauceterror: {
            message: 'Transaction Error'
          }
        })
      }
    } else {
      if (Web3.utils.isAddress(this.state.targetAccount)) {
        this.setState({ requestrunning: true });

        let apiUrl = config.get("apiurl") +"/"+ this.state.selectedNetwork + "/" + this.state.selectedToken + "/" + this.state.targetAccount;
        axios
          .get(apiUrl)
          .then(response => {
            this.setState({ requestrunning: false });
            if (response.status === 200) {
              this.setState({
                faucetresponse: {
                  txhash: response.data.hash,
                  // console.log()
                  etherscanlink:
                    config.get([this.state.selectedNetwork]) + "/tx/" + response.data.hash
                }
              });
              return;
            }
          })
          // Catch any error here
          .catch(error => {
            this.setState({ requestrunning: false });
            if (!error || !error.response) {
              this.setState({
                fauceterror: {
                  message: 'Error connecting to the API: ' + error.message,
                }
              });
              return;
            }
            if (error.response.status === 500) {
              if (error.response.data.err.duration) {
                let t = Math.ceil(error.response.data.err.duration / 1000);
                this.setState({
                  fauceterror: {
                    message: error.response.data.message,
                    duration: error.response.data.duration,
                    timespan: t
                  }
                });
              } else {
                this.setState({
                  fauceterror: {
                    message: 'Transaction error'
                  }
                })
              }
            return;
            }
          });
      } else {
        this.setState({ fauceterror: { message: "invalid address" } });
      }
    }
    event.preventDefault();
  }

  componentDidMount() {
    window.addEventListener("load", () => {
      // See if there is a pubkey on the URL
      let urlTail = window.location.search.substring(1);
      if (Web3.utils.isAddress(urlTail)){
        this.setState({ targetAccount: urlTail });
        return;
      }

      // If web3 is not injected (modern browsers)...
      if (typeof window.web3 === "undefined") {
        // Listen for provider injection
        window.addEventListener("message", ({ data }) => {
          if (data && data.type && data.type === "ETHEREUM_PROVIDER_SUCCESS") {
            this.web3 = new Web3(window.ethereum);
          }
        });
        // Request provider
        window.postMessage({ type: "ETHEREUM_PROVIDER_REQUEST" }, "*");
      }
      // If web3 is injected (legacy browsers)...
      else {
        this.web3 = new Web3(window.web3.currentProvider);
        this.web3.eth
          .getAccounts()
          .then(accounts => {
            if (accounts && accounts[0]) {
              this.setState({ targetAccount: accounts[0] });
            }
          })
          .catch(() => {});
      }
    });
  }

  render() {
    return (
      <div className="">
        <section className="section">
          <div className="container bottompadding">
          <h3>Get tokens on Main Chain</h3>
          <hr></hr>
          <div class="columns">
            <div class = "column is-one-quarter">
              <span>Select Token:</span>
            </div>
            <div class = "column is-auto">
            <input type="radio"
                   value="testErc20"
                   checked={this.state.selectedToken === "testErc20"}
                   onChange={this.tokenChange}/>&nbsp;Test Token
          </div>
          </div>
          <div class = "columns">
            <div class = "column is-one-quarter">
              <span>Select Network</span>
            </div>
            <div class = "column is-auto">
            <div class = "columns">
            <div class = "column is-3">
            <input type="radio"
                   value="ropsten"
                   checked={this.state.selectedNetwork === "ropsten"}
                   onChange={this.networkChange} />&nbsp;Ropsten
            </div>
            <div class = "column is-3">
            <input type="radio"
                   value="ethereum"
                   checked={this.state.selectedNetwork === "ethereum"}
                   onChange={this.networkChange}/>&nbsp;Ethereum
            </div>
            </div>
            </div>
          </div>
            <form onSubmit={this.handleSubmit}>
              <div className="field">
                <label className="label">
                  Enter your Ropsten account address
                </label>
                <div className="control">
                  <input
                    className="input is-info"
                    type="text"
                    placeholder="Enter your testnet account address"
                    value={this.state.selectedNetwork === 'ethereum'? 'Please enable Metamask and select `Main Ethereum Network`.' : this.state.targetAccount}
                    onChange={this.handleChange}
                    disabled = {this.state.selectedNetwork === 'ethereum'}
                  />
                </div>
                
              </div>
              <hr></hr>
              <div className="field is-grouped">
              
                <div className="control">
                {this.state.selectedNetwork === 'ethereum' ? 
                  <div>
                    <p>You will receive 10 TEST tokens on Ethereum Mainnet</p>
                  </div>
                 :  <p />
                  }
                  <button
                    disabled={this.state.requestrunning}
                    className="button is-link"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
          {this.state.requestrunning}

          <div className="container">
            {this.state.faucetresponse ? (
              <div>
                <hr />
              <article
                className="message is-success"
                onClick={this.clearMessages}
              >
                <div className="message-body">
                  <p>Tokens sent to {this.state.targetAccount}.</p>
                  <p>
                    Transaction hash{" "}
                    <a
                      target="_new"
                      href={this.state.faucetresponse.etherscanlink}
                    >
                      {this.state.faucetresponse.txhash}
                    </a>
                  </p>
                </div>
              </article>
              </div>
            ) : (
              <p />
            )}
            {this.state.fauceterror ? (
              <div>
                <hr />
              <article
                className="message is-danger"
                onClick={this.clearMessages}
              >
                <div className="message-body">
                <b>{this.state.fauceterror.message}</b><br/>
                  {this.state.fauceterror.timespan ? (
                    <span>
                      You are greylisted for another{" "}
                      {this.state.fauceterror.timespan} seconds.
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
              </article>
              </div>
            ) : (
              <p />
            )}
          </div>
        </section>
      </div>
    );
  }
}

export default FaucetRequestMain;
