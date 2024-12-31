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

// 가장 최근의 1분 봉은 틱 단위로 계속 업데이트되어 변동성이 너무 심함. 매수가에 그대로 매도하는 경우가 발생
const MOVING_AVERAGE_MINUTE_BUY_BASE_TIME = 1;
const MOVING_AVERAGE_MINUTE_SELL_BASE_TIME = 3;

const MOVING_AVERAGE_MINUTE = Object.freeze({
	FIVE: 5,
	TWENTY: 20,
	SIXTY: 60,
});

const TICKER_REQUEST_TIMING = 30 * MILLISECONDS;

const TRADE_REQUEST_TIMING = 35 * MILLISECONDS;

const TRADE_MODE = Object.freeze({
	SAFE: 'SAFE',
	UNSAFE: 'UNSAFE',
});

const NASDAQ_DANGER_CHANGE_RATE = -1.68;

const DEFAULT_WEIGHT = 0; // 1; // 기준 가산치 ( 클수록  첫 데이터의 중요도가 높아짐 )
const PER_WEIGHT_RATE = 0.0012; // -0.00078; // 가산치 증감 비율 ( 작을수록 먼 데이터의 가치하락 폭이 증가함 / 클수록 먼 데이터의 가치상승 폭이 증가함 )
const MAX_LOSS_RATE = 0.5;
const MAX_GREED_RATE = 2;

const MAX_ONCE_BUY_VALUE = 10000;

export {
	MOVING_AVERAGE_MINUTE_BUY_BASE_TIME,
	MOVING_AVERAGE_MINUTE_SELL_BASE_TIME,
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
	TRADE_MODE,
	DEFAULT_WEIGHT,
	PER_WEIGHT_RATE,
	MAX_LOSS_RATE,
	MAX_GREED_RATE,
	NASDAQ_DANGER_CHANGE_RATE,
	MAX_ONCE_BUY_VALUE,
};
