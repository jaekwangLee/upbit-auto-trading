/** @format */

const MILLISECONDS = 1000;
const MINUTE = 60 * MILLISECONDS;

const TRADING_PERIOD = (MINUTE * MILLISECONDS) / 2;

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

const TICKER_REQUEST_TIMING = 10 * MILLISECONDS;

const TRADE_REQUEST_TIMING = 6 * TICKER_REQUEST_TIMING;

const TRADE_AVERAGE_VALUE_TIMING = TRADE_REQUEST_TIMING; // 5 * TRADE_REQUEST_TIMING;

const MIN_BUY_AVENUE_RATE = 0.003; // 5분이내에 0.03%의 변동이 생겼다면 수익을 낼 수 있는 합리적인 하락이라고 봄

const MIN_SELL_AVENUE_RATE = 0.01; // 업비트 수수료인 0.5%이상의 수익을 냈을때 매도

const MIN_SELL_LOSS_RATE = 0.006; // 손절 타이밍

export {
  TRADING_PERIOD,
  TRADING_SYSTEM_MAX_RECOVERY,
  TRADING_SYSTEM_RECOVERY_PERIOD,
  COIN_PRICE_CHANGE_DIRECTION,
  ORDER_PRICE_TYPE,
  ORDER_TYPE,
  MOVING_AVERAGE_MINUTE,
  TICKER_REQUEST_TIMING,
  MILLISECONDS,
  TRADE_REQUEST_TIMING,
  TRADE_AVERAGE_VALUE_TIMING,
  MIN_BUY_AVENUE_RATE,
  MIN_SELL_AVENUE_RATE,
  MIN_SELL_LOSS_RATE,
};
