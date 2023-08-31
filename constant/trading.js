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

const TICKER_REQUEST_TIMING = 10 * MILLISECONDS; // 10s

const TRADE_REQUEST_TIMING = 6 * TICKER_REQUEST_TIMING; // 1m

const TRADE_AVERAGE_VALUE_TIMING = 5 * TRADE_REQUEST_TIMING; // 5m

const STOP_GREED_RATE = 0.006; // 업비트 수수료인 0.5%이상의 수익을 냈을때 매도

const STOP_LOSS_RATE = 0.006; // 손절 타이밍

const MIN_BUY_AVENUE_RATE = 0; // TRADE_AVERAGE_VALUE_TIMING 평균보다 조금이라도 작으면 매수\

// 이전 5분의 종가가 20분 평균선 위에 있다면 팔지 않는것으로

// 이전 5분의 종가가 20분 평균선 밑으로 내려왔다면 사지 않는것으로

// 이전 5분의 종가가 20분 평균선 위에 있을때 + 이전 5분의 평균 가격보다 현재가가 저렴하다면 매수

// 현재가가 이전 5분의 평균가격 밑으로 떨어지면 판매

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
