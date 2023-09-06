/** @format */

import {MINUTE, MOVING_AVERAGE_MINUTE, ORDER_TYPE, TICKER_REQUEST_TIMING} from '../../constant/trading.js';
import CURRENCY from '../../constant/currency.js';

import {dConsole} from '../../utils/log.js';
import {convertOrderTypeForDB} from '../../utils/trade.js';

import Datbase from '../../db.js';

import UpbitAccount from '../Account.js';
import {fetchCurrentTicker} from '../../api/upbit/order.js';
import {reduceArrayWithSameKey} from '../../utils/array.js';

class TradeDataManager {
	static MaxDataHistory = (MINUTE * MOVING_AVERAGE_MINUTE.SIXTY) / TICKER_REQUEST_TIMING;

	constructor() {
		this.candles = {}; // MinuteBar를 모음

		this.orderHistories = [];
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

	getOrderHistories() {
		return this.orderHistories;
	}

	async showAllAsset() {
		try {
			const coins = await this.getAllCoins();
			if (!coins || coins.length === 0) {
				return;
			}

			const tickers = coins.map((coin) => coin.ticker).join(', ');
			const {data: tickerData} = await fetchCurrentTicker(tickers);
			if (!tickerData || tickerData.length === 0) {
				return;
			}

			const coinsWithCurrentValue = reduceArrayWithSameKey(
				tickerData,
				coins.map((coin) => ({...coin, market: coin.ticker})),
				'market',
			);

			const allAssets = coinsWithCurrentValue
				.map((coin, index) => {
					const total = (Number(coin.price) * Number(coin.volume)).toFixed(2);
					return `(${index + 1}) ${coin.ticker}: 현재가(${coin.trade_price}원) 구매가(${coin.price}원) 구매총액(${total}원)`;
				})
				.join('\n');
			dConsole(`[Data Manager] 보유 자산 목록\n${allAssets}`);
		} catch (error) {
			dConsoleError(`[Data Manager] 자산목록 보여주기 실패`);
		}
	}

	async pushOrderHistory(data, orderReason) {
		this.orderHistories.push(data);
		const {orderId, orderType} = data;

		try {
			const insertResult = await this.#insertData(data);
			if (!insertResult || insertResult instanceof Error) {
				return;
			}

			const findResult = orderType === ORDER_TYPE.BID ? await this.#findBid(orderId) : await this.#findAsk(orderId);

			if (!findResult || insertResult instanceof Error) {
				return;
			}

			const id = orderType === ORDER_TYPE.BID ? findResult.bidIdx : findResult.askIdx;
			const type = convertOrderTypeForDB(orderType);
			await this.#insertTrade(id, type, orderReason);
		} catch (error) {
			dConsole(`[Data Manager] push order history failed: ${error}`);
			return error;
		}
	}

	clearOrderHistory() {
		this.orderHistories = this.orderHistories.slice(0, 0);
		return this;
	}

	async getBalance(currency = CURRENCY.KRW) {
		const balance = await this.account.getBalance(currency);
		return balance * 0.98;
	}

	async getAllCoins() {
		const balance = await this.account.getAllAccount();
		return balance.filter((coin) => coin.ticker !== CURRENCY.KRW);
	}

	#findBid(orderId) {
		return new Promise((resolve, reject) => {
			try {
				const query = `SELECT bidIdx FROM bids WHERE uuid = ?`;

				this.db.get(query, [orderId], (err, row) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(row);
				});
			} catch (error) {
				dConsole(`[Data Manager] find bid from bids failed: ${error}`);
				reject(error);
			}
		});
	}

	#findAsk(orderId) {
		return new Promise((resolve, reject) => {
			try {
				const query = `SELECT askIdx FROM asks WHERE uuid = ?`;

				this.db.get(query, [orderId], (err, row) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(row);
				});
			} catch (error) {
				dConsole(`[Data Manager] find ask from asks failed: ${error}`);
				reject(error);
			}
		});
	}

	#insertData(orderData) {
		return new Promise((resolve, reject) => {
			try {
				const {orderId, orderType, ticker, requestPrice, requestVolume} = orderData;
				const table = orderType === ORDER_TYPE.BID ? 'bids' : 'asks';
				const query = `INSERT INTO ${table} (uuid, ticker, price, volume) VALUES (?, ?, ?, ?)`;
				const data = [orderId, ticker, requestPrice, requestVolume];

				this.db.run(query, data, (err) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(true);
				});
			} catch (error) {
				dConsole(`[Data Manager] insert bid/ask data failed: ${error}`);
				reject(error);
			}
		});
	}

	#insertTrade(id, type, reason) {
		return new Promise((resolve, reject) => {
			try {
				const query =
					type === 1
						? `INSERT INTO trades (bidIdx, type, reason) VALUES (?, ?, ?)`
						: `INSERT INTO trades (askIdx, type, reason) VALUES (?, ?, ?)`;

				this.db.run(query, [id, type, reason], (err) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(true);
				});
			} catch (error) {
				dConsole(`[Data Manager] insert trade from trades failed: ${error}`);
				reject(error);
			}
		});
	}
}

export default TradeDataManager;
