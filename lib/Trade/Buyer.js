/** @format */

import { MOVING_AVERAGE_MINUTE, ORDER_TYPE } from "../../constant/trading.js";
import CURRENCY, { ORDER_PRICE_RULE } from "../../constant/currency.js";

import { buyOrderUpbitCoin } from "../../api/upbit/order.js";

import { dConsole } from "../../utils/log.js";
import { getAverageByNumberField } from '../../utils/array.js';
import { getMaxVolume, getOrderPossiblePrice } from "../../utils/price.js";

import OrderHistoryFormatter from "../Formatter/Order.js";
import { Observer } from "../Observer.js";
import { PREFER_COIN_MARKET } from "../../constant/market.js";

class BuyTrader extends Observer {
  async update(dataManager) {
    const markets = this.getAttractiveMarkets(dataManager.getAllCandles());
    console.log('list: ', Object.values(PREFER_COIN_MARKET))
    console.log('m:', markets)

    return;
    const myBalance = await dataManager.getBalance(CURRENCY.KRW);
    this.run(currValue, myBalance, dataManager.ticker)
        .then((history) => {
          if (history) {
            const orderReason = `[Buy Trader Macro] 거래완료 - 호가: ${currValue.price}`;
            void dataManager.pushOrderHistory(history, orderReason);
          }
        });
  }

  getAttractiveMarkets = (candleData) => {
    const attractiveMarkets = [];
    for (const [market, candles] of Object.entries(candleData)) {
      const fiveMinuteCandles = candles.slice(0, MOVING_AVERAGE_MINUTE.FIVE);
      const twentyMinuteCandles = candles.slice(0, MOVING_AVERAGE_MINUTE.TWENTY);

      if (getAverageByNumberField(fiveMinuteCandles, 'min') > getAverageByNumberField(twentyMinuteCandles, 'min')) {
        attractiveMarkets.push(market);
      }
    }

    return attractiveMarkets;
  }

  async run(currentValue, balance, ticker) {
    const orderPrice = getOrderPossiblePrice(currentValue);
    const volume = getMaxVolume(orderPrice, balance);

    dConsole(`[Buy Trader] 거래 준비 완료 - 거래가능금액: ${orderPrice} | 현재가: ${currentValue} | 거래량: ${volume}`);

    if (orderPrice > balance) {
      dConsole(`[Buy Trader] 잔액부족 (order: ${orderPrice} / balance: ${balance})`);
      return;
    }

    if (orderPrice * volume < ORDER_PRICE_RULE.MIN) {
      dConsole(`[Buy Trader] 최소주문금액 미만 현금 보유 (거래총액: ${orderPrice * volume} / 최소주문금액: ${ORDER_PRICE_RULE.MIN})`);
      return;
    }

    const orderResult = await this.order(ticker, orderPrice, volume);
    if (!orderResult) {
      return null;
    }

    dConsole(`[Buy Trader] 주문완료 - 티커: ${ticker} | 현재가: ${currentValue}...`, orderResult);

    return orderResult;
  }

  async order(ticker, price, volume) {
    try {
      const response = await buyOrderUpbitCoin(ticker, { price, volume });
      if (!response) {
        throw new Error("[Buy Trader] 코인 매수 실패");
      }

      return new OrderHistoryFormatter(response, ORDER_TYPE.BID);
    } catch (error) {
      console.warn(`[Buy Trader] 오류발생 - 매수 실패 "${ticker}": ${volume}... ${error}`);
      return null;
    }
  }

  selectBestTickers(tickers) {
    if (tickers.length === 0) {
      return null;
    }

    const sortedTickers = this.#sortByChangeRate(tickers);
    return sortedTickers[0].market;
  }

  #sortByChangeRate(tickers) {
    const COEFFICIENT_DIFF_RATE = 0.3;
    return tickers.sort((a, b) => {
      if (Math.abs(a.changeRate - b.changeRate) >= COEFFICIENT_DIFF_RATE) {
        return -1;
      } else if (
        Math.abs(a.changeRate - b.changeRate) < COEFFICIENT_DIFF_RATE
      ) {
        return 1;
      } else {
        if (a.changeRateHasDirection > b.changeRateHasDirection) {
          return -1;
        } else if (a.changeRateHasDirection < b.changeRateHasDirection) {
          return 1;
        }

        return 0;
      }
    });
  }
}

export default BuyTrader;
