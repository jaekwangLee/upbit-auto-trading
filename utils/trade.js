/** @format */

import {ORDER_TYPE} from '../constant/trading.js';

import {getAverage} from './value.js';

const convertOrderTypeForDB = (type) => {
	return type === ORDER_TYPE ? 1 : 0;
};

/**
 *
 * @param {MinuteCandle[]} candles
 * @param {number} times
 * @returns {number}
 */
const calculateMovingAverage = (candles, times) => {
	const prices = candles.slice(0, times).map((candle) => candle.end);
	const movingAverage = prices.length > 0 ? getAverage(prices) : NaN;
	return movingAverage;
};

export {convertOrderTypeForDB, calculateMovingAverage};
