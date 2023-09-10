/** @format */

const MILLISECONDS = 1000;
const MINUTE = 60 * MILLISECONDS;

const TRADING_SYSTEM_MAX_RECOVERY = 5;
const TRADING_SYSTEM_RECOVERY_PERIOD = MINUTE * MILLISECONDS;

const COIN_PRICE_CHANGE_DIRECTION = Object.freeze({
	UP: 'UP',
	DOWN: 'DOWN',
	EVEN: 'EVEN',
});

const ORDER_PRICE_TYPE = Object.freeze({
	LIMIT: 'limit',
	PRICE: 'price',
	MARKET: 'market',
});

const ORDER_TYPE = Object.freeze({
	BID: 'bid',
	ASK: 'ask',
});

const MOVING_AVERAGE_MINUTE = Object.freeze({
	FIVE: 5,
	TWENTY: 20,
	SIXTY: 60,
});

const TICKER_REQUEST_TIMING = 5 * MILLISECONDS; // 10s

const TRADE_REQUEST_TIMING = TICKER_REQUEST_TIMING + MILLISECONDS; // 1m + 데이터 조회 및 거래 시차 설정

const TRADE_AVERAGE_VALUE_TIMING = 5 * TRADE_REQUEST_TIMING; // 5m

const TRADE_MODE = Object.freeze({
	SAFE: 'SAFE',
	UNSAFE: 'UNSAFE',
});

const NASDAQ_DANGER_CHANGE_RATE = -1.68;

const DEFAULT_WEIGHT = 0; // 1; // 기준 가산치 ( 클수록  첫 데이터의 중요도가 높아짐 )
const PER_WEIGHT_RATE = 0; // -0.00078; // 가산치 증가 비율 ( 클수록 먼 데이터의 가치하락 폭이 증가함 )
const MAX_LOSS_RATE = 0.25;
const MAX_GREED_RATE = 0.28;

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
	TRADE_MODE,
	DEFAULT_WEIGHT,
	PER_WEIGHT_RATE,
	MAX_LOSS_RATE,
	MAX_GREED_RATE,
	NASDAQ_DANGER_CHANGE_RATE,
};
