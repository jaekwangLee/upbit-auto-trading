/** @format */

import {ORDER_TYPE, MOVING_AVERAGE_MINUTE} from '../../constant/trading.js';

import {reduceArrayWithSameKey} from '../../utils/array.js';
import {dConsole, Logger} from '../../utils/log.js';
import {calculateMovingAverage} from '../../utils/trade.js';

import {fetchCurrentTickerAPI, sellOrderUpbitCoinAPI} from '../../api/upbit/order.js';

import OrderHistoryFormatter from '../Formatter/Order.js';
import {Observer} from '../Observer.js';
import {ORDER_PRICE_RULE} from '../../constant/currency.js';

class SellTrader extends Observer {
	coinTradeManager = null;

	async update(dataManager) {
		try {
			this.coinTradeManager = dataManager;

			const coins = await this.coinTradeManager.getAllCoinWithCurrentPrice();
			if (!coins.length) {
				dConsole('[Sell Trader] 보유한 코인이 없습니다.');
				return;
			}

			const currentCandleData = this.coinTradeManager.getAllCandles();
			const profitMarkets = this.getSellMarkets(coins, currentCandleData);

			await this.coinTradeManager.showAllAsset();

			const assets = this.getAssetStatus(coins, currentCandleData);
			const logs = assets.map(
				(asset, index) => `(${index + 1}) ${asset.market}
구매가 : ${asset.bought.toLocaleString()}원 >>> 현재가${asset.price.toLocaleString()}원
MA 방향성 : ${asset.five > asset.ten ? '상승' : '하락'} (${asset.five.toLocaleString()} | ${asset.ten.toLocaleString()})
현재수익률 : ${asset.currValueProfitRate.toFixed(3)}%
보유금액 : ${(asset.volume * asset.price).toFixed(2)}원
손절대상 : ${asset.isOverLoss ? 'O' : 'X'}
익절대상 : ${asset.isOverGreed ? 'O' : 'X'}
익절/손절 대상 (이평이탈) : ${asset.five < asset.ten && asset.price < asset.bought ? 'O' : 'X'}`,
			);

			dConsole(`[Sell Trader] 판매 분석결과`, ...logs);

			if (!profitMarkets || profitMarkets.length === 0) {
				dConsole(`[Sell Trader] 보유한 코인 중 판매할 코인이 아직 없습니다.`);
				return;
			}

			this.run(profitMarkets).then((history) => {
				profitMarkets.forEach((market) => {
					Logger.push({type: Logger.PUSH_TYPE.SELL, message: `매도를 알립니다.\n종목: ${market.ticker}\n금액: ${market.trade_price}`});
				});

				const soldAssets = this.getAssetStatus(profitMarkets, currentCandleData);
				soldAssets.forEach((asset) => {
					Logger.push({
						type: asset.price < asset.bought ? Logger.PUSH_TYPE.BAD_TRADE : Logger.PUSH_TYPE.NICE_TRADE,
						message: `매매를 알립니다.\n종목: ${asset.market}\n매수: ${asset.bought}\n매도: ${asset.price}\n수익률: ${asset.currValueProfitRate.toFixed(3)}%`,
					});
				});
			});
		} catch (e) {
			dConsole('Failed to update in SellTrader', e);
		}
	}

	/**
	 * 이전 5분의 종가가 20분 평균선 위에 있다면 팔지 않는것으로
	 * 현재가가 이전 5분의 평균가격 밑으로 떨어지면 판매
	 */
	getSellMarkets(markets, candleData) {
		return markets.filter((market) => {
			if (market.volume * market.price < ORDER_PRICE_RULE.MIN) {
				return false;
			}

			// NOTE: 손절 및 익절
			const profitRate = this.coinTradeManager.checkProfitRate(market.trade_price, market.price);
			if (profitRate.isOverGreed || profitRate.isOverLoss) {
				return true;
			}

			const candles = candleData[market.ticker];
			if (!candles || candles.length === 0) {
				return false;
			}

			const fiveMinutesMovingAverage = calculateMovingAverage(candles, MOVING_AVERAGE_MINUTE.FIVE);
			const tenMinuteMovingAverage = calculateMovingAverage(candles, MOVING_AVERAGE_MINUTE.TEN);

			if (isNaN(fiveMinutesMovingAverage) || isNaN(tenMinuteMovingAverage)) {
				return false;
			}

			// NOTE: 손절/익절은 이평선 기준으로만 진행
			return fiveMinutesMovingAverage < tenMinuteMovingAverage && market.trade_price < market.price;
		});
	}

	getAssetStatus(markets, candleData) {
		return markets.map((market) => {
			const candles = candleData[market.ticker];
			if (!candles || candles.length === 0) {
				dConsole(`[Sell Trader] 티커 불일치 - ${market.ticker}`);
				return {
					isOverLoss: null,
					isOverGreed: null,
					market: null,
					five: null,
					ten: null,
					currValueProfitRate: null,
					currAverageProfitRate: null,
					bought: null,
					price: null,
					volume: 0,
				};
			}

			const {isOverGreed, isOverLoss} = this.coinTradeManager.checkProfitRate(market.trade_price, market.price);
			const fiveMinutesMovingAverage = calculateMovingAverage(candles, MOVING_AVERAGE_MINUTE.FIVE);
			const tenMinuteMovingAverage = calculateMovingAverage(candles, MOVING_AVERAGE_MINUTE.TEN);

			if (isNaN(fiveMinutesMovingAverage) || isNaN(tenMinuteMovingAverage)) {
				dConsole(`[Sell Trader] 이평선 잘못된 수 - ${market.ticker}`);
				return {
					isOverLoss: null,
					isOverGreed: null,
					market: null,
					five: null,
					ten: null,
					currValueProfitRate: null,
					currAverageProfitRate: null,
					bought: null,
					price: null,
					volume: 0,
				};
			}

			return {
				isOverLoss,
				isOverGreed,
				market: market.ticker,
				five: fiveMinutesMovingAverage,
				ten: tenMinuteMovingAverage,
				currValueProfitRate: this.coinTradeManager.getProfitRate(market.trade_price, market.price),
				bought: Number(market.price),
				price: Number(market.trade_price),
				volume: Number(market.volume),
			};
		});
	}

	async run(markets = []) {
		try {
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
		} catch (e) {
			dConsole('Failed to run in SellTrader', e);
			return null;
		}
	}

	async getCurrentPrices(markets) {
		try {
			const {data} = await fetchCurrentTickerAPI(markets);
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
			const response = await sellOrderUpbitCoinAPI(ticker, {
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
