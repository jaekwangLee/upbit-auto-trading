import { REST_API_METHOD } from "../constant/network.js"
import { nasdaqInstance, requestAPI } from "./instance.js"

const fetchNasdaqStatus = () => {
  return requestAPI(nasdaqInstance, '/quote/SPX/info', REST_API_METHOD.GET, {
    params: {
      assetclass: 'index'
    }
  });
};

export { fetchNasdaqStatus };