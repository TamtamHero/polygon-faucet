// Import React and Component
import React, { Component } from "react";
import "bulma/css/bulma.css";
import "./App.css";
import FaucetInfo from "./FaucetInfo/FaucetInfo";
import FaucetRequest from "./FaucetRequest/FaucetRequest";
import config from "react-global-configuration";
import configuration from "./config";

config.set(configuration);

class App extends Component {
  render() {
    return (
      <div>
        <section className="hero is-light">
          <div className="hero-body">
            <div className="container">
              <center>
              <figure class="image is-128x128">
                <img src="./matic-logo-square.svg" />
              </figure>
              </center>
              <h1 className="title">MATIC Faucet</h1>

              <div class = "columns">
                <div class = "column">
                <span class = "label-for-buttons">Choose Network:</span>
                <div class="buttons">
                  <button class="button is-rounded is-focused is-medium is-info is-outlined">Testnet v2</button>
                  <button class="button is-rounded is-medium is-info is-outlined" disabled>Testnet v3</button>
                  <button class="button is-rounded is-medium is-info is-outlined" disabled>Beta v2</button>
                  <button class="button is-rounded is-medium is-info is-outlined" disabled>Alpha</button>
                </div>
                </div>
                <div class = "column">
                <span class = "label-for-buttons">Choose Token:</span>
                <div class="buttons">
                  <button class="button is-rounded is-focused is-medium is-info is-outlined">MATIC-ETH</button>
                  <button class="button is-rounded is-medium is-info is-outlined" disabled>Test (ERC20)</button>
                  <button class="button is-rounded is-medium is-info is-outlined" disabled>Test (ERC721)</button>
                </div>
                </div>
              </div>
              
              
            </div>
          </div>
        </section>
        
          <div className="container">
            <div class = "columns">
              <div class = "column">
              <FaucetRequest />
              </div>
              <div class = "column">
              <FaucetInfo />
              </div>
            </div>
          </div>
       
      </div>
    );
  }
}

export default App;
