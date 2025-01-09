/** @format */

import {ORDER_STATUS} from '../../constant/market.js';
import {PROMISE_STATE} from '../../constant/network.js';

import {getOpenedOrderListAPI} from '../../api/upbit/order.js';

import {Observer} from '../Observer.js';
import MarketFinder from './MarketFinder.js';

// 주문대기 상태 길어지는 케이스 핸들링
class OrderWorker extends Observer {
	async update() {
		try {
			const topTickers = MarketFinder.topTickers;
			const responses = await Promise.allSettled(topTickers.map((market) => getOpenedOrderListAPI(market, ORDER_STATUS.WAIT)));
			responses.forEach((response) => {
				if (response.status !== PROMISE_STATE.FULFILLED) {
					return;
				}

				const {
					data: {uuid, side: orderType, price, market, createdAt, remaining_volume},
				} = response;

				const tradedAt = new Date(createdAt);
				console.log(tradedAt, createdAt);
			});
		} catch (e) {}
	}

	run() {}
}

export default OrderWorker;
