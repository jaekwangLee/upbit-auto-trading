/** @format */

import { REST_API_METHOD } from "../../constant/network.js";

import { upbitInstance, requestAPI } from "../instance.js";

const fetchAllMarkets = () => {
  return requestAPI(upbitInstance, "/market/all", REST_API_METHOD.GET, {});
};

export { fetchAllMarkets };
