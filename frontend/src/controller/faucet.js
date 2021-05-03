import axios from "axios";
import config from "react-global-configuration";

async function claimFaucet(account){
    let apiUrl = config.get("apiurl");
    return await axios
    .post(apiUrl,{
        network: "rpc-mainnet",
        token: 'matic',
        account: account[0]
      })
    .then(response => {
        if (response.status === 200) {
        return config.get("explorer") + "/tx/" + response.data.hash;
        }
    });
}

export default claimFaucet;
