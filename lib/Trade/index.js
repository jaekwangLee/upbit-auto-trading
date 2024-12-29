/** @format */

import {TICKER_REQUEST_TIMING, TRADE_REQUEST_TIMING} from '../../constant/trading.js';
import {PREFER_COIN_MARKET} from '../../constant/market.js';

import {fetchCandle} from '../../api/upbit/market.js';

import {dConsoleWarn} from '../../utils/log.js';

import TradeDataManager from './DataManager.js';
import BuyTrader from './Buyer.js';
import SellTrader from './Seller.js';
import {Subject} from '../Observer.js';
import MinuteCandle from '../Formatter/MinuteCandle.js';

class TraderManager extends Subject {
	constructor() {
		super();

		this.buyer = new BuyTrader();
		this.seller = new SellTrader();
		this.dataManager = new TradeDataManager();
		this.tickerIntervalId = null;
		this.tradeIntervalId = null;
		this.tradeStateIntervalId = null;
		this.observers = [];
	}

	build() {
		this.registerObserver(this.buyer).registerObserver(this.seller);

		return this;
	}

	runTickerDataCollector() {
		const getCandles = async () => {
			try {
				const tickers = this.fetchPreferMarketCandles();
				const promises = await Promise.all(tickers.map((ticker) => fetchCandle(ticker, 1, 20)));

				return promises.map(({data}) => {
					const tick = data[0];
					return {
						ticker: tick?.market,
						candles: data.map((candle) => new MinuteCandle(candle)),
					};
				});
			} catch (error) {
				dConsoleWarn(`[Data Collector] 캔들 정보 조회 실패 ${error}`);
				return [];
			}
		};

		this.tickerIntervalId = setInterval(async () => {
			const candles = await getCandles();
			if (candles.length > 0) {
				candles.forEach((candleData) => {
					this.dataManager.setCandles(candleData.ticker, candleData.candles);
				});
			}
		}, TICKER_REQUEST_TIMING);

		return this;
	}

	fetchPreferMarketCandles() {
		return Object.values(PREFER_COIN_MARKET);
	}

	registerObserver(observer) {
		this.observers.push(observer);
		return this;
	}

	notifyObserver() {
		for (const observer of this.observers) {
			observer.update(this.dataManager);
		}
	}

	runTradeWorker() {
		this.tradeIntervalId = setInterval(() => {
			this.notifyObserver();
		}, TRADE_REQUEST_TIMING);
	}

	runTradeStateWorker() {
		this.tradeStateIntervalId = setInterval(() => {}, TRADE_REQUEST_TIMING);
	}

	destroyWorkers() {
		clearTimeout(this.tickerIntervalId);
		clearInterval(this.tradeIntervalId);
	}
}

export default TraderManager;
