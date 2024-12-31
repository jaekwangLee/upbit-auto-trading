/** @format */

const PREFER_COIN_MARKET = Object.freeze({
	BIT: 'KRW-BTC',
	DOGE: 'KRW-DOGE',
	ETH: 'KRW-ETH',
	RIPPLE: 'KRW-XRP',
	ARK: 'KRW-ARK',
	STELALUMEN: 'KRW-XLM',
	// FIRMACHAIN: 'KRW-FCT2',
	// BTT: 'KRW-BTT',
	// POWR: 'KRW-POWR',
	// BLUR: 'KRW-BLUR',
});

const MARKET_STATUS = Object.freeze({
	NORMAL: 'NONE',
	WARNING: 'CAUTION',
});

const ORDER_STATUS = Object.freeze({
	WAIT: 'WAIT', // 체결 대기
	WATCH: 'WATCH', // 예약주문 대기
});

export {PREFER_COIN_MARKET, MARKET_STATUS, ORDER_STATUS};
