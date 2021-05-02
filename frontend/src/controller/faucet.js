import axios from "axios";
import { toast } from "react-toastify";
import config from "react-global-configuration";

async function claimFaucet(account){
    let apiUrl = config.get("apiurl") +"/rpc-mainnet/matic/" + account;
    return await axios
    .get(apiUrl)
    .then(response => {
        if (response.status === 200) {
        return config.get("explorer") + "/tx/" + response.data.hash;
        }
    });
}

export default claimFaucet;
