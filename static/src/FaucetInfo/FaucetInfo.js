import React, { Component } from "react";
import "./FaucetInfo.css";
import axios from "axios";
import config from "react-global-configuration";
import { JsonToTable } from "react-json-to-table";

class FaucetInfo extends Component {
  // Adds a class constructor that assigns the initial state values:
  constructor() {
    super();
    this.state = {
      faucetinfo: null
    };
  }
  // This is called when an instance of a component is being created and inserted into the DOM.
  componentWillMount() {
    axios
      .get(config.get("apiurl") + "/info")
      .then(response => {
        this.setState({ faucetinfo: response.data });
        localStorage.setItem("faucetinfo", response.data);
      })
      // Catch any error here
      .catch(error => {
        console.log(error);
      });
  }

  componentDidMount() {
    if (!navigator.onLine) {
      try {
        let f = JSON.parse(localStorage.getItem("faucetinfo"));
        this.setState({ faucetinfo: f });
      } catch (e) {
        //
      }
    }
  }

  // The render method contains the JSX code which will be compiled to HTML.
  render() {
    if (!this.state.faucetinfo) return null;
    return (
      <section className="section">
        <div className="content has-text-centered has-text-weight-light">
          <p>
            MATIC-ETH faucet. Select network and enter your address.
            <br />
            Faucet Status:
            <JsonToTable json= {this.state.faucetinfo.balances} />
          </p>
          <p>
            Example command line: wget {config.get("apiurl")}
            /donate/&lt;your ethereum address&gt; <br />
            <a
              target="_new"
              href="#"
            >
              API docs
            </a>
          </p>
        </div>
      </section>
    );
  }
}

export default FaucetInfo;
