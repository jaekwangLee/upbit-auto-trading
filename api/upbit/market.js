/** @format */

import { REST_API_METHOD } from "../../constant/network.js";

import { upbitInstance, requestAPI } from "../instance.js";

const fetchAllMarkets = () => {
  return requestAPI(upbitInstance, "/market/all", REST_API_METHOD.GET, {});
};

const fetchCandle = (ticker, unit = 1) => {
  return requestAPI(upbitInstance, `/candles/minutes/${unit}`, REST_API_METHOD.GET, {
    params: {
      market: ticker,
      count: 60 / unit,
    }
  });
}

export { fetchAllMarkets, fetchCandle };
