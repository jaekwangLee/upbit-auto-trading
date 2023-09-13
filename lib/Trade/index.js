/** @format */

import {NASDAQ_DANGER_CHANGE_RATE, TICKER_REQUEST_TIMING, TRADE_MODE, TRADE_REQUEST_TIMING} from '../../constant/trading.js';
import {PREFER_COIN_MARKET} from '../../constant/market.js';

import {fetchCandle, fetchAllMarkets} from '../../api/upbit/market.js';

import {dConsole, dConsoleError, dConsoleWarn} from '../../utils/log.js';

import TradeDataManager from './DataManager.js';
import BuyTrader from './Buyer.js';
import SellTrader from './Seller.js';
import {Subject} from '../Observer.js';
import MinuteCandle from '../Formatter/MinuteCandle.js';
import { fetchCurrentTicker } from '../../api/upbit/order.js';

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
				const nasdaqChangeRate = await this.dataManager.getNasdaqChangeRate();
				const safeMode = nasdaqChangeRate <= NASDAQ_DANGER_CHANGE_RATE ? TRADE_MODE.SAFE : TRADE_MODE.UNSAFE;

				// 이렇게 조회하면 내 종목이 조회안될수가 있음.
				const tickers = safeMode === TRADE_MODE.SAFE ? this.fetchPreferMarketCandles() : await this.fetchTopChangeRateTickers();
				const promises = await Promise.all(tickers.map((ticker) => fetchCandle(ticker, 1)));

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

	async fetchTopChangeRateTickers() {
		try {
			const {data} = await fetchAllMarkets();
			if (!data || data.length === 0) {
				return [];
			}


			const allAssets = await this.dataManager.getAllCoins();
			const hasTickers = allAssets.map((asset) => asset.ticker);
			const searchTickers = data.filter(market => market.market.includes('KRW'))
																.map(market => market.market)
																.join(',');

			const { data: allMarketCurrentPrices } = await fetchCurrentTicker(searchTickers);
			const topTenMarkets = allMarketCurrentPrices.sort((a, b) => {
				if (hasTickers.includes(a.market) && !hasTickers.includes(b.market)) {
					return -1;
				} else if (!hasTickers.includes(a.market) && hasTickers.includes(b.market)) {
					return 1;
				}

				return a.signed_change_rate > b.signed_change_rate ? -1 : 1;
			}).slice(0, 10);

			dConsole(`[Data Collector] top ten markets: ${topTenMarkets.map((market) => market.market).join('|')}`);
			return topTenMarkets.map((market) => market.market);
		} catch(error) {
			dConsoleError(`[Data Collector] 최대 변동폭 마켓 조회 실패: ${error}`);
			return [];
		}
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
