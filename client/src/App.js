// Import React and Component
import React, { Component } from "react";
import "bulma/css/bulma.css";
import "./App.css";
import FaucetInfo from "./FaucetInfo/FaucetInfo";
import FaucetTokenInfo from "./FaucetInfo/FaucetTokenInfo";
import FaucetRequest from "./FaucetRequest/FaucetRequest";
import FaucetRequestMain from "./FaucetRequest/FaucetRequestMain";
import config from "react-global-configuration";
import configuration from "./config.json";

config.set(configuration);

class App extends Component {
  render() {
    return (
      <div>
        <section className="hero is-light">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">MATIC Faucet</h1>
            </div>
          </div>
        </section>
        
          <div className="container">
            <div class = "columns">
              <div class = "column">
                <FaucetRequest />
              </div>
              <div class = "column">
                <FaucetRequestMain />
              </div>
            </div>
            <div className = "columns">
              <div className = "column">
                <FaucetInfo />
              </div>
              <div className = "column">
                <FaucetTokenInfo />
              </div>
            </div>
          </div>
       
      </div>
    );
  }
}

export default App;
