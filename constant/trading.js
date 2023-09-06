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

const CURRENT_TRADE_MODE = TRADE_MODE.UNSAFE;

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
	CURRENT_TRADE_MODE,
};
