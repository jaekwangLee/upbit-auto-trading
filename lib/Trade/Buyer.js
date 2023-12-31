/** @format */

import {MOVING_AVERAGE_MINUTE, MOVING_AVERAGE_MINUTE_BUY_BASE_TIME, ORDER_TYPE} from '../../constant/trading.js';
import CURRENCY, {ORDER_PRICE_RULE} from '../../constant/currency.js';

import {buyOrderUpbitCoin, fetchCurrentTicker} from '../../api/upbit/order.js';

import {dConsole} from '../../utils/log.js';
import {getAverageWithWeight} from '../../utils/array.js';
import {getMaxVolume, getOrderPossiblePrice} from '../../utils/price.js';
import {digitNum} from '../../utils/number.js';

import {Observer} from '../Observer.js';

import OrderHistoryFormatter from '../Formatter/Order.js';
import TickerDataFormatter from '../Formatter/Ticker.js';

class BuyTrader extends Observer {
	async update(dataManager) {
		const attractiveMarkets = this.#getAttractiveMarkets(dataManager.getAllCandles());
		const bestMarket = this.#getBestMarket(attractiveMarkets);
		if (!bestMarket) {
			dConsole(`[Buy Trader] 살만한 종목이 없습니다.`);
			return;
		}

		const {data} = await fetchCurrentTicker(bestMarket.market);
		if (!data || data.length === 0) {
			return;
		}

		const ticker = new TickerDataFormatter(data[0]);
		const myBalance = await dataManager.getBalance(CURRENCY.KRW);
		this.#run(ticker.price, myBalance, bestMarket.market).then((history) => {
			if (history) {
				dataManager.insertBuyHistory(history);
			}
		});
	}

	// 5분 평균선이 20분 이평선 위 있는 종목
	#getAttractiveMarkets(candleData) {
		const attractiveMarkets = [];
		for (const [market, candles] of Object.entries(candleData)) {
			const fiveMinuteCandles = candles.slice(MOVING_AVERAGE_MINUTE_BUY_BASE_TIME, MOVING_AVERAGE_MINUTE_BUY_BASE_TIME + MOVING_AVERAGE_MINUTE.FIVE);
			const twentyMinuteCandles = candles.slice(MOVING_AVERAGE_MINUTE_BUY_BASE_TIME, MOVING_AVERAGE_MINUTE_BUY_BASE_TIME + MOVING_AVERAGE_MINUTE.TWENTY);
			const fiveMinuteAverageLine = getAverageWithWeight(fiveMinuteCandles, 'end');
			const twentyMinuteAverageLine = getAverageWithWeight(twentyMinuteCandles, 'end');

			if (fiveMinuteAverageLine > twentyMinuteAverageLine) {
				attractiveMarkets.push({
					market,
					max: Math.max(...twentyMinuteCandles.map((candle) => candle.max)),
					min: Math.min(...twentyMinuteCandles.map((candle) => candle.min)),
					fiveAverageLine: fiveMinuteAverageLine,
					twentyAverageLine: twentyMinuteAverageLine,
				});
			}
		}

		return attractiveMarkets;
	}

	// 매력적인 종목 중에서 가장 상승 가능성이 높은 것
	#getBestMarket(attractiveCandleData = []) {
		if (attractiveCandleData.length === 0) {
			return null;
		}

		const bestMarket = attractiveCandleData.sort((a, b) => (a.min / a.max > b.min / b.max ? 1 : -1))[0];
		const attractiveMarektsState = attractiveCandleData.map(
			(data, index) => `(${index + 1}) ${data.market}: 5평(${digitNum(data.fiveAverageLine, 2)}) | 20평(${digitNum(data.twentyAverageLine, 2)}) | 최고가(${digitNum(data.max, 2)}) | 최저가(${digitNum(data.min, 2)})\n`,
		);

		dConsole(`[Buy Trader] 살만한 종목\n${attractiveMarektsState}\n그 중 최선의 선택: ${bestMarket.market}`);
		return bestMarket;
	}

	async #run(currentValue, balance, ticker) {
		const orderPrice = getOrderPossiblePrice(currentValue);
		const volume = getMaxVolume(orderPrice, balance);

		if (orderPrice <= 0) {
			return;
		}

		// 잔액부족
		if (orderPrice > balance) {
			const leftBalance = balance.toFixed(2);
			dConsole(`[Buy Trader] 구매할만한 종목(${ticker})이 있지만, 보유 현금이 없습니다.\n(잔액: 약 ${leftBalance})`);
			return;
		}

		if (orderPrice * volume < ORDER_PRICE_RULE.MIN) {
			dConsole(`[Buy Trader] ${ticker} 최소주문금액 미만 현금 보유\n(거래총액: ${orderPrice * volume} / 최소주문금액: ${ORDER_PRICE_RULE.MIN})`);
			return;
		}

		const orderResult = await this.#order(ticker, orderPrice, volume);
		if (!orderResult) {
			return null;
		}

		dConsole(`[Buy Trader] 주문완료 - 티커: ${ticker} | 현재가: ${currentValue}...`, orderResult);

		return orderResult;
	}

	async #order(ticker, price, volume) {
		try {
			const response = await buyOrderUpbitCoin(ticker, {price, volume});
			if (!response) {
				throw new Error('[Buy Trader] 코인 매수 실패');
			}

			return new OrderHistoryFormatter(response, ORDER_TYPE.BID);
		} catch (error) {
			console.warn(`[Buy Trader] 오류발생 - 매수 실패 "${ticker}": ${volume}... ${error}`);
			return null;
		}
	}
}

export default BuyTrader;
