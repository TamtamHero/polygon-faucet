import axios from "axios";
import config from "react-global-configuration";

async function claimFaucet(account, captcha){
    console.log(captcha)
    let apiUrl = config.get("apiurl") +"/rpc-mainnet/matic/" + account + "/" + captcha;
    console.log("Sending request...")
    return await axios
    .get(apiUrl)
    .then(response => {
        if (response.status === 200) {
        return config.get("explorer") + "/tx/" + response.data.hash;
        }
    });
}

export default claimFaucet;
