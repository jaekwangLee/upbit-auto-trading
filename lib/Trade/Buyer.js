/** @format */

import { MIN_AVENUE_RATE, ORDER_TYPE } from "../../constant/trading.js";

import { buyOrderUpbitCoin } from "../../api/upbit/order.js";

import OrderHistoryFormatter from "../Formatter/Order.js";
import { getMaxVolume, getOrderPossiblePrice } from "../../utils/price.js";

class BuyTrader {
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
      throw "No Money What to do...";
    }

    const orderResult = await this.order(ticker, orderPrice, volume);
    if (!orderResult) {
      return null;
    }

    console.log(
      `[BUY] ticker: ${ticker} | price: ${currentValue}...`,
      orderResult
    );
  }

  async order(ticker, price, volume) {
    try {
      const { data } = await buyOrderUpbitCoin(ticker, { price, volume });
      console.log("order result: ", data);
      if (!data) {
        throw new Error("[WARN] failed order buy coin");
      }

      return new OrderHistoryFormatter(data, ORDER_TYPE.BID);
    } catch (error) {
      console.log(error);
      console.warn(`[WARN] failed buy "${ticker}": ${volume}... ${error}`);
      return null;
    }
  }

  checkReasonablePrice(averageValue, currentValue) {
    if (averageValue * (1 - MIN_AVENUE_RATE) > currentValue) {
      console.log(
        `${currentValue}₩ is reasonable price as "${
          averageValue * (1 - MIN_AVENUE_RATE)
        }₩"`
      );
      return true;
    } else {
      console.log(
        `Current price is expensive: avg-${averageValue} | curr-${currentValue}`
      );
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
