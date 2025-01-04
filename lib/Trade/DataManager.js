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
			const coins = await this.getAllCoins();
			if (!coins || coins.length === 0) {
				return [];
			}

			const tickers = coins.map((coin) => coin.ticker).join(', ');
			const {data: tickerData} = await fetchCurrentTickerAPI(tickers);
			if (!tickerData || tickerData.length === 0) {
				return [];
			}

			const coinsWithCurrentValue = reduceArrayWithSameKey(
				tickerData,
				coins.map((coin) => ({...coin, market: coin.ticker})),
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

	insertBuyHistory(order) {
		// return new Promise((resolve, reject) => {
		// 	try {
		// 		const dataset = {
		// 			buyPrice: order.requestPrice,
		// 			sellPrice: 0,
		// 			ticker: order.ticker,
		// 			state: 1,
		// 			isEarn: 0,
		// 			buyTimestamp: new Date().toString(),
		// 			sellTimestamp: '',
		// 		};
		// 		const params = Object.values(dataset);
		// 		const query = `
		// 			INSERT
		// 			INTO trades (buyPrice, sellPrice, ticker, state, isEarn, buyTimestamp, sellTimestamp)
		// 			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
		// 		this.db.run(query, params, (err) => {
		// 			if (err) {
		// 				reject(err);
		// 			} else {
		// 				resolve();
		// 			}
		// 		});
		// 	} catch (error) {
		// 		dConsole(`[Data Manager] 매수 후 DB 기록 실패 ${error}`);
		// 		reject(error);
		// 	}
		// });
	}

	getBoughtTickerRecentHistory(ticker) {
		// return new Promise((resolve, reject) => {
		// 	try {
		// 		const query = `
		// 			SELECT ticker, buyPrice,
		// 			FROM trade
		// 			WHERE ticker=?, state=1
		// 		`;
		// 		this.db.run(query, [ticker], (err, rows) => {
		// 			if (err) {
		// 				reject(err);
		// 			} else {
		// 				const row = rows[0];
		// 				if (row) {
		// 					resolve(row);
		// 				} else {
		// 					resolve(null);
		// 				}
		// 			}
		// 		});
		// 	} catch (error) {
		// 		dConsole(`[Data Manager] 구매 상태인 (매도안한) 티커 조회 실패 ${error}`);
		// 		reject(error);
		// 	}
		// });
	}

	updateSellHistory(order) {
		// return new Promise(async (resolve, reject) => {
		// 	try {
		// 		const boughtHistory = await this.getBoughtTickerRecentHistory(order.ticker);
		// 		const isEarn = !!boughtHistory.buyPrice && boughtHistory < order.requestPrice;
		// 		const dataset = {
		// 			set_price: order.requestPrice,
		// 			set_state: 2,
		// 			set_isEarn: isEarn,
		// 			set_sellTimestamp: new Date().toString(),
		// 			where_ticker: order.tickr,
		// 			where_state: 1,
		// 		};
		// 		const params = Object.values(dataset);
		// 		const query = `
		// 			UPDATE trades
		// 			SET sellPrice=?, state=?, isEarn=?, sellTimestamp=?
		// 			WHERE ticker=?, state=?
		// 		`;
		// 		this.db.run(query, params, (err) => {
		// 			if (err) {
		// 				reject(err);
		// 			} else {
		// 				resolve();
		// 			}
		// 		});
		// 	} catch (error) {
		// 		dConsole(`[Data Manager] 매도 후 DB 기록 실패 ${error}`);
		// 		reject(error);
		// 	}
		// });
	}
}

export default TradeDataManager;
