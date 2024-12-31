/** @format */

import {REST_API_METHOD} from '../../constant/network.js';
import {ORDER_PRICE_TYPE, ORDER_TYPE} from '../../constant/trading.js';

import {upbitInstance, requestAPI, upbitRequest} from '../instance.js';

import UpbitAuth from '../../lib/UpbitAuth.js';
import {ORDER_STATUS} from '../../constant/market.js';

const fetchCurrentTickerAPI = (markets = '') => {
	return requestAPI(upbitInstance, '/ticker', REST_API_METHOD.GET, {
		params: {
			markets: markets,
		},
	});
};

const buyOrderUpbitCoinAPI = (ticker, {price = 0, volume = 0, orderType = ORDER_PRICE_TYPE.LIMIT}) => {
	const data = {
		market: ticker,
		side: ORDER_TYPE.BID,
		ord_type: orderType,
		price: price.toString(), // 얼마에 살지
		volume: volume.toFixed(8), // 얼마나 살지
	};

	const headers = {
		Authorization: UpbitAuth.getInstance().getAuthToken(data),
	};

	return upbitRequest('/orders', REST_API_METHOD.POST, {data, headers});
};

const sellOrderUpbitCoinAPI = (ticker, {price = 0, volume = 0, orderType = ORDER_PRICE_TYPE.MARKET}) => {
	const data = {
		market: ticker,
		side: ORDER_TYPE.ASK,
		ord_type: orderType,
		price: orderType === ORDER_PRICE_TYPE.MARKET ? null : price.toString(),
		volume: volume.toFixed(8),
	};

	const headers = {
		Authorization: UpbitAuth.getInstance().getAuthToken(data),
	};

	return upbitRequest('/orders', REST_API_METHOD.POST, {data, headers});
};

const getOpenedOrderListAPI = (market = '', state = ORDER_STATUS.WAIT) => {
	const params = {
		state,
	};

	if (!!market) {
		params.market = market;
	}

	const headers = {
		Authorization: UpbitAuth.getInstance().getAuthToken(params),
	};

	return upbitRequest('/orders/open', {params, headers});
};

export {fetchCurrentTickerAPI, buyOrderUpbitCoinAPI, sellOrderUpbitCoinAPI, getOpenedOrderListAPI};
