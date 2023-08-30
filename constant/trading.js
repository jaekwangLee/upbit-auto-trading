/** @format */

const MILLISECONDS = 1000;
const MINUTE = 60 * MILLISECONDS;

const TRADING_SYSTEM_MAX_RECOVERY = 5;
const TRADING_SYSTEM_RECOVERY_PERIOD = MINUTE * MILLISECONDS;

const COIN_PRICE_CHANGE_DIRECTION = Object.freeze({
  UP: "UP",
  DOWN: "DOWN",
  EVEN: "EVEN",
});

const ORDER_PRICE_TYPE = Object.freeze({
  LIMIT: "limit",
  PRICE: "price",
  MARKET: "market",
});

const ORDER_TYPE = Object.freeze({
  BID: "bid",
  ASK: "ask",
});

const MOVING_AVERAGE_MINUTE = Object.freeze({
  FIVE: 5,
  TWENTY: 20,
  SIXTY: 60,
});

const TICKER_REQUEST_TIMING = 2 * MILLISECONDS; // FOR TEST: 2, FOR REAL: 10

const TRADE_REQUEST_TIMING = 6 * TICKER_REQUEST_TIMING;

const TRADE_AVERAGE_VALUE_TIMING = TRADE_REQUEST_TIMING; // 5 * TRADE_REQUEST_TIMING;

const STOP_GREED_RATE = 0.006; // 업비트 수수료인 0.5%이상의 수익을 냈을때 매도

const STOP_LOSS_RATE = 0.006; // 손절 타이밍

const MIN_BUY_AVENUE_RATE = 0; // 아무때나 매수함; STOP_GREED_RATE / 2;

export {
  TRADING_SYSTEM_MAX_RECOVERY,
  TRADING_SYSTEM_RECOVERY_PERIOD,
  COIN_PRICE_CHANGE_DIRECTION,
  ORDER_PRICE_TYPE,
  ORDER_TYPE,
  MOVING_AVERAGE_MINUTE,
  TICKER_REQUEST_TIMING,
  MILLISECONDS,
  MINUTE,
  TRADE_REQUEST_TIMING,
  TRADE_AVERAGE_VALUE_TIMING,
  MIN_BUY_AVENUE_RATE,
  STOP_GREED_RATE,
  STOP_LOSS_RATE,
};
