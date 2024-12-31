/** @format */

import {MAX_ONCE_BUY_VALUE, MOVING_AVERAGE_MINUTE, MOVING_AVERAGE_MINUTE_BUY_BASE_TIME, ORDER_TYPE} from '../../constant/trading.js';
import CURRENCY, {ORDER_PRICE_RULE} from '../../constant/currency.js';

import {buyOrderUpbitCoinAPI, fetchCurrentTickerAPI} from '../../api/upbit/order.js';

import {dConsole} from '../../utils/log.js';
import {getAverage} from '../../utils/value.js';
import {getMaxVolume} from '../../utils/price.js';
import {digitNum} from '../../utils/number.js';

import {Observer} from '../Observer.js';

import OrderHistoryFormatter from '../Formatter/Order.js';
import TickerDataFormatter from '../Formatter/Ticker.js';
import UpbitAccount from '../Account.js';

class BuyTrader extends Observer {
	async update(dataManager) {
		const attractiveMarkets = this.#getAttractiveMarkets(dataManager.getAllCandles());
		const bestMarket = this.#getBestMarket(attractiveMarkets);
		if (!bestMarket) {
			dConsole(`[Buy Trader] 살만한 종목이 없습니다.`);
			return;
		}

		const {data} = await fetchCurrentTickerAPI(bestMarket.market);
		if (!data || data.length === 0) {
			return;
		}

		const fetchedTicker = data[0];

		const isBoughtTicker = UpbitAccount.instance.checkHasTicker(fetchedTicker.market);
		if (isBoughtTicker) {
			dConsole(`[Buy Trader] 이미 보유한 종목입니다`);
			return;
		}

		const ticker = new TickerDataFormatter(fetchedTicker);
		const myBalance = await dataManager.getBalance(CURRENCY.KRW);
		this.#run(ticker.price, Math.min(myBalance, MAX_ONCE_BUY_VALUE), bestMarket.market).then((history) => {
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

			const fiveMinutesMovingAverage = getAverage(fiveMinuteCandles.map((candle) => candle.end));
			const twentyMinutesMovingAverage = getAverage(twentyMinuteCandles.map((candle) => candle.end));

			if (fiveMinutesMovingAverage > twentyMinutesMovingAverage) {
				attractiveMarkets.push({
					market,
					max: Math.max(...twentyMinuteCandles.map((candle) => candle.max)),
					min: Math.min(...twentyMinuteCandles.map((candle) => candle.min)),
					fiveAverageLine: fiveMinutesMovingAverage,
					twentyAverageLine: twentyMinutesMovingAverage,
					diffRate: fiveMinutesMovingAverage / twentyMinutesMovingAverage - 1,
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

		const bestMarket = attractiveCandleData.sort((a, b) => a.diffRate > b.diffRate)[0];
		const attractiveMarektsState = attractiveCandleData.map(
			(data, index) =>
				`(${index + 1}) ${data.market}: 5평(${digitNum(data.fiveAverageLine, 2)}) | 20평(${digitNum(data.twentyAverageLine, 2)}) | 최고가(${digitNum(data.max, 2)}) | 최저가(${digitNum(data.min, 2)} | 상승률(${data.diffRate})\n`,
		);

		dConsole(`[Buy Trader] 살만한 종목\n${attractiveMarektsState}\n그 중 최선의 선택: ${bestMarket.market}`);
		return bestMarket;
	}

	async #run(currentValue, balance, ticker) {
		const volume = getMaxVolume(currentValue, balance);
		const orderPrice = currentValue * volume;

		if (orderPrice <= 0) {
			return;
		}

		// 잔액부족
		if (orderPrice > balance) {
			const leftBalance = balance.toFixed(2);
			dConsole(`[Buy Trader] 구매할만한 종목(${ticker})이 있지만, 보유 현금이 없습니다.\n(잔액: ${leftBalance} | 주문액${orderPrice})`);
			return;
		}

		if (orderPrice < ORDER_PRICE_RULE.MIN) {
			dConsole(`[Buy Trader] ${ticker} 최소주문금액 미만 현금 보유\n(거래총액: ${orderPrice * volume} / 최소주문금액: ${ORDER_PRICE_RULE.MIN})`);
			return;
		}

		const orderResult = await this.#order(ticker, currentValue, volume);
		if (!orderResult) {
			return null;
		}

		dConsole(`[Buy Trader] 주문완료 - 티커: ${ticker} | 현재가: ${currentValue}...`, orderResult);

		return orderResult;
	}

	async #order(ticker, price, volume) {
		try {
			const response = await buyOrderUpbitCoinAPI(ticker, {price, volume});
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
