/** @format */

import {ORDER_TYPE, MOVING_AVERAGE_MINUTE, MAX_LOSS_RATE, MAX_GREED_RATE} from '../../constant/trading.js';

import {getAverageWithWeight, reduceArrayWithSameKey} from '../../utils/array.js';
import {dConsole} from '../../utils/log.js';

import {fetchCurrentTicker, sellOrderUpbitCoin} from '../../api/upbit/order.js';

import OrderHistoryFormatter from '../Formatter/Order.js';
import {Observer} from '../Observer.js';

class SellTrader extends Observer {
	coinTradeManager = null;

	async update(dataManager) {
		this.coinTradeManager = dataManager;

		const coins = await this.coinTradeManager.getAllCoinWithCurrentPrice();
		const currentCandleData = this.coinTradeManager.getAllCandles();
		const profitMarkets = this.getSellMarkets(coins, currentCandleData);

		await this.coinTradeManager.showAllAsset();

		if (!profitMarkets || profitMarkets.length === 0) {
			const assets = this.getAssetStatus(coins, currentCandleData);
			const logs = assets.map((asset, index) => `\n${index+1} ${asset.market}\n5평선(${asset.five}원) | 20평선(${asset.twenty}원)\n손절대상(${asset.isOverLoss}) | 익절대상(${asset.isOverGreed}))`);
			dConsole(`[Sell Trader] 보유한 코인 중 판매할 코인이 아직 없습니다${logs}`);
		}

		this.run(profitMarkets).then((history) => {
			if (history) {
				const orderReason = `[Sell Trader Macro] ${this.coinTradeManager.ticker} -> value: ${history.requestPrice}`;
				void this.coinTradeManager.pushOrderHistory(history, orderReason);
			}
		});
	}

	/**
	 * 이전 5분의 종가가 20분 평균선 위에 있다면 팔지 않는것으로
	 * 현재가가 이전 5분의 평균가격 밑으로 떨어지면 판매
	 */
	getSellMarkets(markets, candleData) {
		return markets.filter((market) => {
			if (this.coinTradeManager.checkOverLoss(market.trade_price, market.price)) {
				return true;
			}

			if (this.coinTradeManager.checkOverGreed(market.trade_price, market.price)) {
				return true;
			}

			const candles = candleData[market.ticker];
			if (!candles || candles.length === 0) {
				return false;
			}

			const fiveMinuteCandles = candles.slice(0, MOVING_AVERAGE_MINUTE.FIVE);
			const twentyMinuteCandles = candles.slice(0, MOVING_AVERAGE_MINUTE.TWENTY);

			const fiveMinuteAverageLine = getAverageWithWeight(fiveMinuteCandles, 'min');
			const twentyMinuteAverageLine = getAverageWithWeight(twentyMinuteCandles, 'min');

			return this.coinTradeManager.checkOverLoss(fiveMinuteAverageLine, twentyMinuteAverageLine) || this.coinTradeManager.checkOverGreed(fiveMinuteAverageLine, twentyMinuteAverageLine);
		});
	}

	getAssetStatus(markets, candleData) {
		return markets.map((market) => {
			const candles = candleData[market.ticker];
			if (!candles || candles.length === 0) {
				return {sell: false, five: null, twenty: null, price: null};
			}

			let isOverLoss = this.coinTradeManager.checkOverLoss(market.trade_price, market.price);
			let isOverGreed = this.coinTradeManager.checkOverGreed(market.trade_price, market.price);

			const fiveMinuteCandles = candles.slice(0, MOVING_AVERAGE_MINUTE.FIVE);
			const twentyMinuteCandles = candles.slice(0, MOVING_AVERAGE_MINUTE.TWENTY);

			const fiveMinuteAverageLine = getAverageWithWeight(fiveMinuteCandles, 'min');
			const twentyMinuteAverageLine = getAverageWithWeight(twentyMinuteCandles, 'min');

			if (!isOverLoss) {
				isOverLoss = this.coinTradeManager.checkOverLoss(fiveMinuteAverageLine, twentyMinuteAverageLine);
			}

			if (!isOverGreed) {
				isOverGreed = this.coinTradeManager.checkOverGreed(fiveMinuteAverageLine, twentyMinuteAverageLine);
			}

			return {
				isOverLoss,
				isOverGreed,
				market: market.ticker,
				five: fiveMinuteAverageLine.toFixed(2),
				twenty: twentyMinuteAverageLine.toFixed(2),
				price: Number(market.price),
			};
		});
	}

	async run(markets = []) {
		const tickers = markets.map((market) => market.ticker).join(', ');
		if (!tickers) {
			return;
		}

		const prices = await this.getCurrentPrices(tickers);
		const sellTickers = reduceArrayWithSameKey(markets, prices, 'ticker').filter((ticker) => Number(ticker.volume) > 0);

		if (sellTickers.length === 0) {
			dConsole('[Sell Trader] 보유 코인 중, 판매 적합한 코인 목록에 충분한 물량을 가진 코인이 없습니다.');
			return;
		}

		const orderResult = await Promise.all(
			sellTickers.map((market) =>
				this.order(market.ticker, {
					price: market.currentPrice,
					volume: market.volume,
				}),
			),
		);

		dConsole('[Sell Trader] 판매완료: ', orderResult);
		if (!orderResult) {
			return null;
		}

		return orderResult;
	}

	async getCurrentPrices(markets) {
		try {
			const {data} = await fetchCurrentTicker(markets);
			if (!Array.isArray(data) || data.length === 0) {
				throw new Error('[Sell Trader] 코인 목록 - 현재가 조회 실패');
			}

			return data.map((ticker) => ({
				ticker: ticker.market,
				currentPrice: ticker.trade_price,
			}));
		} catch (error) {
			dConsole(`[Sell Trader] 코인 목록 - 현재가 조회 실패 ${markets}: ${error}`);
			return [];
		}
	}

	async order(ticker, {price, volume}) {
		try {
			const response = await sellOrderUpbitCoin(ticker, {
				price,
				volume: Number(volume),
			});
			if (!response) {
				throw new Error('[Sell Trader] 판매 실패');
			}

			return new OrderHistoryFormatter(response, ORDER_TYPE.ASK);
		} catch (error) {
			console.warn(`[Sell Trader] 판매 실패 "${ticker}": ${volume}... ${error}`);
			return null;
		}
	}
}

export default SellTrader;
