/** @format */

import {TICKER_REQUEST_TIMING, TRADE_REQUEST_TIMING} from '../../constant/trading.js';
import CURRENCY from '../../constant/currency.js';

import {dConsoleWarn} from '../../utils/log.js';

import {fetchCandle} from '../../api/upbit/market.js';

import TradeDataManager from './DataManager.js';
import BuyTrader from './Buyer.js';
import SellTrader from './Seller.js';
import {Subject} from '../Observer.js';
import MinuteCandle from '../Formatter/MinuteCandle.js';
import MarketFinder from './MarketFinder.js';

class TraderManager extends Subject {
	constructor() {
		super();

		this.buyer = new BuyTrader();
		this.seller = new SellTrader();
		this.marketFinder = null;
		this.dataManager = new TradeDataManager();
		this.tickerIntervalId = null;
		this.tradeIntervalId = null;
		this.tradeStateIntervalId = null;
		this.observers = [];
	}

	setTrader() {
		void this.dataManager.getBalance(CURRENCY.KRW);

		this.registerObserver(this.buyer).registerObserver(this.seller);

		return this;
	}

	setPreferMarketFinder() {
		void MarketFinder.find();

		if (!!this.marketFinder) {
			clearInterval(this.marketFinder);
		}

		this.marketFinder = setInterval(() => {
			void MarketFinder.find();
		}, 30 * 1000);

		return this;
	}

	runTickerDataCollector() {
		const getCandles = async () => {
			try {
				const hasCoinTickers = this.dataManager.hasCoins().map((coin) => coin.ticker);
				const tickers = [...MarketFinder.topTickers, ...hasCoinTickers];
				const promises = await Promise.all(tickers.map((ticker) => fetchCandle(ticker, 1, 30)));

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
