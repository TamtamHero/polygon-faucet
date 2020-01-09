import React, { Component } from "react";
import "./FaucetInfo.css";
import axios from "axios";
import config from "react-global-configuration";
import DataTable from 'react-data-table-component';

const columns = [
  {
    name: 'Network',
    selector: 'network',
    sortable: true,
    maxWidth: '50px'
  },
  {
    name: 'Account',
    selector: 'account',
    // maxWidth: '400px',
    // allowOverflow: true,
    wrap: true
  },
  {
    name: 'ETH Balance',
    maxWidth: '100px',
    selector: 'balanceEth'
  }, 
  {
    name: 'TERC20 Balance',
    maxWidth: '100px',
    selector: 'balanceTestErc20'
  }
];

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

  render() {
    if (!this.state.faucetinfo) return null;
    return (
      <DataTable
        title="Faucet Status"
        columns={columns}
        data={this.state.faucetinfo.balances}
        dense
      />
    );
  }
}

export default FaucetInfo;
