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
    maxWidth: '100px'
  },
  {
    name: 'Matic ETH',
    selector: 'payoutEth',
    maxWidth: '100px'
  },
  {
    name: 'Test ERC20',
    selector: 'payoutTestErc20',
    maxWidth: '100px',
    wrap: true
  },
  {
    name: 'TEST ERC20 Token Address',
    selector: 'testErc20Address'
  }
];

class FaucetTokenInfo extends Component {
  // Adds a class constructor that assigns the initial state values:
  constructor() {
    super();
    this.state = {
      faucettokeninfo: null,
      networks: null
    };
  }
  // This is called when an instance of a component is being created and inserted into the DOM.
  componentWillMount() {
    axios
      .get(config.get("apiurl") + "/tokenInfo")
      .then(response => {
        this.setState({ 
          faucettokeninfo: response.data.tokenInfo 
        });
        localStorage.setItem("faucettokeninfo", response.data.tokenInfo);
      })
      // Catch any error here
      .catch(error => {
        console.log(error);
      });
  }

  componentDidMount() {
    if (!navigator.onLine) {
      try {
        // let f = JSON.parse(localStorage.getItem("faucettokeninfo"));
        // this.setState({ faucettokeninfo: f });
      } catch (e) {
        //
      }
    }
  }

  render() {
    if (!this.state.faucettokeninfo) return null;
    return (
      <DataTable
        title="Token Payout Status"
        columns={columns}
        data={this.state.faucettokeninfo}
        dense
      />
    );
  }
}

export default FaucetTokenInfo;
