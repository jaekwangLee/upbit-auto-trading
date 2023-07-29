import { REST_API_METHOD } from "../../constant/network.js";

import { upbitInstance, request } from "../instance.js";

const fetchAllMarkets = () => {
  return request(upbitInstance, "/market/all", REST_API_METHOD.GET, {});
};

export { fetchAllMarkets };
