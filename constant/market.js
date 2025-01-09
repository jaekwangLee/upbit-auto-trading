/** @format */

const MARKET_STATUS = Object.freeze({
	NORMAL: 'NONE',
	WARNING: 'CAUTION',
});

const ORDER_STATUS = Object.freeze({
	WAIT: 'WAIT', // 체결 대기
	WATCH: 'WATCH', // 예약주문 대기
});

export {MARKET_STATUS, ORDER_STATUS};
