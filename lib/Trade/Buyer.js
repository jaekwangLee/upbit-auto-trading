/** @format */

import { MIN_BUY_AVENUE_RATE, ORDER_TYPE, TRADE_AVERAGE_VALUE_TIMING } from "../../constant/trading.js";
import CURRENCY, { ORDER_PRICE_RULE } from "../../constant/currency.js";

import { buyOrderUpbitCoin } from "../../api/upbit/order.js";

import { dConsole } from "../../utils/log.js";
import { getMaxVolume, getOrderPossiblePrice } from "../../utils/price.js";

import OrderHistoryFormatter from "../Formatter/Order.js";
import { Observer } from "../Observer.js";

class BuyTrader extends Observer {
  async update(dataManager) {
    const movingAverage = dataManager.getMovingAverageValueByMinute(TRADE_AVERAGE_VALUE_TIMING);
    const currValue = dataManager.getCurrentValue();
    const balance = await dataManager.getBalance(CURRENCY.KRW);

    this.run(movingAverage, currValue.price, balance, dataManager.ticker)
        .then((history) => {
          if (history) {
            const orderReason = `[Buy Trader Macro] ${dataManager.ticker} -> MovingAverage: ${movingAverage} & CurrentValue: ${currValue.price}`;
            void dataManager.pushOrderHistory(history, orderReason);
          }
        });
  }

  async run(movingAverageValue, currentValue, balance, ticker) {
    const { ready, value: averageValue } = movingAverageValue;
    if (!ready) {
      return;
    }

    if (!averageValue || !currentValue) {
      return;
    }

    const isGoodPrice = this.checkReasonablePrice(averageValue, currentValue);
    if (!isGoodPrice) {
      return;
    }

    const orderPrice = getOrderPossiblePrice(currentValue);
    const volume = getMaxVolume(orderPrice, balance);

    if (orderPrice > balance) {
      dConsole(`[Buy Trader] No Money What to do... (order: ${orderPrice} / balance: ${balance})`);
      return;
    }

    if (orderPrice * volume < ORDER_PRICE_RULE.MIN) {
      dConsole(`[Buy Trader] No money less than minimum orderable price... (orderTotalPrice: ${orderPrice * volume} / tradeMinimumRulePrice: ${ORDER_PRICE_RULE.MIN})`);
      return;
    }

    const orderResult = await this.order(ticker, orderPrice, volume);
    if (!orderResult) {
      return null;
    }

    dConsole(`[Buy Trader] ticker: ${ticker} | price: ${currentValue}...`, orderResult);

    return orderResult;
  }

  async order(ticker, price, volume) {
    try {
      const response = await buyOrderUpbitCoin(ticker, { price, volume });
      if (!response) {
        throw new Error("[Buy Trader] failed order buy coin");
      }

      return new OrderHistoryFormatter(response, ORDER_TYPE.BID);
    } catch (error) {
      console.warn(`[Buy Trader] failed buy "${ticker}": ${volume}... ${error}`);
      return null;
    }
  }

  checkReasonablePrice(averageValue, currentValue) {
    const reasonablePrice = averageValue * (1 - MIN_BUY_AVENUE_RATE);
    if (reasonablePrice > currentValue) {
      dConsole(`[BUYER] "${currentValue}" is reasonable price as "${averageValue}" | reasonablePrice: ${reasonablePrice}`);
      return true;
    } else {
      dConsole(`[BUYER] Current price is expensive: avgPrice-${averageValue} | currPrice-${currentValue} | reasonablePrice: ${reasonablePrice} `);
      return false;
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
