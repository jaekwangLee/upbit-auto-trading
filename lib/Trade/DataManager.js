/** @format */

import {MAX_GREED_RATE, MAX_LOSS_RATE} from '../../constant/trading.js';
import CURRENCY from '../../constant/currency.js';

import {dConsole, dConsoleError} from '../../utils/log.js';
import {reduceArrayWithSameKey} from '../../utils/array.js';

import Datbase from '../../db.js';

import UpbitAccount from '../Account.js';
import {fetchCurrentTickerAPI} from '../../api/upbit/order.js';
import {fetchNasdaqStatus} from '../../api/nasdaq.js';

class TradeDataManager {
	constructor() {
		this.candles = {}; // MinuteCandle를 모음

		this.coins = [];

		this.account = UpbitAccount.getInstance();
		this.db = new Datbase(process.env.DATABASE).getDB();
	}

	clearTickers() {
		this.tickerHistories = this.tickerHistories.slice(0, 0);
		return this;
	}

	setCandles(ticker, candles = []) {
		this.candles[ticker] = candles;
	}

	hasCoins() {
		return this.coins;
	}

	getAllCandles() {
		return this.candles;
	}

	getCandles(ticker) {
		return this.candles[ticker];
	}

	getProfitRate(currentPrice, boughtPrice) {
		return (1 - boughtPrice / currentPrice) * 100;
	}

	checkProfitRate(currentPrice, boughtPrice) {
		const profitRate = this.getProfitRate(currentPrice, boughtPrice);
		return {
			isUp: profitRate > 0,
			isDown: profitRate < 0,
			isOverGreed: profitRate > MAX_GREED_RATE,
			isOverLoss: profitRate * -1 > MAX_LOSS_RATE,
		};
	}

	getNasdaqChangeRate = async () => {
		try {
			const {
				data: {data},
			} = await fetchNasdaqStatus();
			const {
				primaryData: {percentageChange},
			} = data;

			return Number(percentageChange.replace('%', ''));
		} catch (error) {
			return 0;
		}
	};

	async getAllCoinWithCurrentPrice() {
		try {
			this.coins = await this.getAllCoins();
			if (!this.coins || this.coins.length === 0) {
				return [];
			}

			const tickers = this.coins.map((coin) => coin.ticker).join(', ');
			const {data: tickerData} = await fetchCurrentTickerAPI(tickers);
			if (!tickerData || tickerData.length === 0) {
				return [];
			}

			const coinsWithCurrentValue = reduceArrayWithSameKey(
				tickerData,
				this.coins.map((coin) => ({...coin, market: coin.ticker})),
				'market',
			);

			return coinsWithCurrentValue;
		} catch (error) {
			dConsoleError(`[Data Manager] 자산목록에 현가를 반영해 가져오는데 실패`);
			return [];
		}
	}

	async showAllAsset() {
		try {
			const coins = await this.getAllCoinWithCurrentPrice();
			const allAssets = coins.map((coin, index) => {
				const trade = Number(coin.trade_price);
				const buy = Number(coin.price);
				const total = (Number(buy) * Number(coin.volume)).toFixed(2);
				return `(${index + 1}) ${coin.ticker}\n현재가 : ${trade.toLocaleString()}원\n구매가 : ${buy.toLocaleString()}원\n구매총액 : ${total}원\n`;
			});

			dConsole(`[Data Manager] 보유 자산 목록`, ...allAssets);
		} catch (error) {
			dConsoleError(`[Data Manager] 자산목록 보여주기 실패`);
		}
	}

	async getBalance(currency = CURRENCY.KRW) {
		const balance = await this.account.getBalance(currency);
		return balance * 0.98;
	}

	async getAllCoins() {
		const balance = await this.account.getAllAccount();
		return balance.filter((coin) => coin.ticker !== CURRENCY.KRW);
	}
}

export default TradeDataManager;
