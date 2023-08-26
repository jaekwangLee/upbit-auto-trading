/** @format */

import CURRENCY, { ORDER_BOOK_TICK } from "../constant/currency.js";
import { COIN_PRICE_CHANGE_DIRECTION } from "../constant/trading.js";

const convertChangePriceDirectionUnit = (unit) => {
  switch (unit) {
    case "RISE":
      return COIN_PRICE_CHANGE_DIRECTION.UP;
    case "FALL":
      return COIN_PRICE_CHANGE_DIRECTION.DOWN;
    case "EVEN":
    default:
      return COIN_PRICE_CHANGE_DIRECTION.EVEN;
  }
};

const getOrderPossiblePrice = (tickerPrice) => {
  const scaleTick = getOrderBookScaleTickByPriceRange(tickerPrice);
  return tickerPrice - (tickerPrice % scaleTick);
};

const getMaxVolume = (orderPrice, balance) => {
  return balance / orderPrice;
};

const getOrderBookScaleTickByPriceRange = (tickerPrice) => {
  if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_TEN) {
    return 0.01;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_HUNDRED) {
    return 0.1;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_THOUSAND) {
    return 1;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_TEN_THOUSAND) {
    return 5;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_HUNDRED_THOUSAND) {
    return 10;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_FIFTY_THOUSAND) {
    return 50;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_MILLION) {
    return 100;
  } else if (tickerPrice <= ORDER_BOOK_TICK.UNTIL_TWO_MILLION) {
    return 500;
  } else if (tickerPrice <= ORDER_BOOK_TICK.FROM_TWO_MILIION) {
    return 1000;
  } else {
    return 1;
  }
};

const getTickerWithCurrency = (ticker, currency = CURRENCY.KRW) => {
  return `${currency}-${ticker}`;
}

const getTickerWithoutCurrency = (ticker) => {
  const tickerIndex = ticker.indexOf('-');
  if (tickerIndex >= 0) {
    ticker = ticker.slice(tickerIndex + 1);
  }

  return ticker;
}

export { convertChangePriceDirectionUnit, getOrderPossiblePrice, getMaxVolume, getTickerWithCurrency, getTickerWithoutCurrency };
