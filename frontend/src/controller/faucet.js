import axios from "axios";
import config from "react-global-configuration";

async function claimFaucet(account, captcha){
    let apiUrl = config.get("apiurl");

    return await axios
    .post(apiUrl,{
        network: "rpc-mainnet",
        token: 'matic',
        account: account[0],
        captcha: captcha
      })
    .then(response => {
        if (response.status === 200) {
        return config.get("explorer") + "/tx/" + response.data.hash;
        }
    });
}

export default claimFaucet;
