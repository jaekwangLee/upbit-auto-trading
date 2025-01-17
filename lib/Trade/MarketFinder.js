import {Logger} from '../../utils/log.js';

import Market from '../Formatter/Market.js';

import {fetchAllMarkets} from '../../api/upbit/market.js';
import {fetchCurrentTickerAPI} from '../../api/upbit/order.js';
import TickerDataFormatter from '../Formatter/Ticker.js';
import {COIN_PRICE_CHANGE_DIRECTION} from '../../constant/trading.js';

class MarketFinder {
	static tickers = [];

	static get topTickers() {
		Logger.add(Logger.TYPE.DEFAULT, `[MarketFinder] Top Tickers: ${this.tickers.join(', ')}`);
		return this.tickers;
	}

	static getFilteredCautionMarkets(markets = []) {
		return markets.filter((market) => !market.isAccountSoaring && !market.isGiantGroupHandles && !market.isGlobalGap);
	}

	static async find() {
		try {
			const {data} = await fetchAllMarkets();
			const markets = this.getFilteredCautionMarkets(data.map((market) => new Market(market)));

			const {data: originTickers} = await fetchCurrentTickerAPI(markets.map((market) => market.ticker).join(','));
			const tickers = originTickers.map((ticker) => new TickerDataFormatter(ticker));

			const topTickers = tickers
				.filter((ticker) => ticker.changeDirection === COIN_PRICE_CHANGE_DIRECTION.UP)
				.sort((a, b) => (a.oneDayTradePrice > b.oneDayTradePrice ? -1 : 1))
				.slice(0, 5);
			this.tickers = topTickers.map((ticker) => ticker.market);
		} catch (e) {
			Logger.add('Failed to find markets', e);
		}
	}
}

export default MarketFinder;
