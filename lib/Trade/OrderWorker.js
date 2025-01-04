/** @format */

import {ORDER_STATUS, PREFER_COIN_MARKET} from '../../constant/market';
import {PROMISE_STATE} from '../../constant/network';

import {getOpenedOrderListAPI} from '../../api/upbit/order';

import {Observer} from '../Observer';

// 주문대기 상태 길어지는 케이스 핸들링
class OrderWorker extends Observer {
	async update() {
		try {
			const responses = await Promise.allSettled(PREFER_COIN_MARKET.map((market) => getOpenedOrderListAPI(market, ORDER_STATUS.WAIT)));
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
