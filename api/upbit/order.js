import { REST_API_METHOD } from "../../constant/network.js";
import { ORDER_PRICE_TYPE, ORDER_TYPE } from "../../constant/trading.js";

import { upbitInstance, request } from "../instance.js";

const fetchCurrentTicker = (markets = []) => {
  return request(upbitInstance, "/ticker", REST_API_METHOD.GET, {
    params: {
      markets: markets,
    },
  });
};

const buyOrderUpbitCoin = (ticker, { price = 0, volume = 0, orderType = ORDER_PRICE_TYPE.MARKET }) => {
  const data = {
    side: ORDER_TYPE.BID,
    market: ticker,
    ord_type: orderType,
  };

  if (price) {
    data.price = price;
  }

  if (volume) {
    data.volume = volume;
  }

  return request(upbitInstance, "/orders", REST_API_METHOD.POST, { data })
}

const sellOrderUpbitCoin = (ticker, { price = 0, volume = 0, orderType = ORDER_PRICE_TYPE.MARKET }) => {
  const data = {
    side: ORDER_TYPE.ASK,
    market: ticker,
    ord_type: orderType,
  };

  if (price) {
    data.price = price;
  }

  if (volume) {
    data.volume = volume;
  }

  return request(upbitInstance, "/orders", REST_API_METHOD.POST, { data })
}

export { fetchCurrentTicker, buyOrderUpbitCoin, sellOrderUpbitCoin };
