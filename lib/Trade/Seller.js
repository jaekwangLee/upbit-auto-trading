/** @format */

import { STOP_LOSS_RATE, STOP_GREED_RATE } from "../../constant/trading.js";

import { fetchCurrentTicker } from "../../api/upbit/order.js";

import TickerDataFormatter from "../Formatter/Ticker.js";

class SellTrader {
  async run(balances) {
    console.log("balances", balances);

    const markets = balances.map((balance) => balance.currency).join(", ");
    if (!markets) {
      return;
    }

    const prices = await this.getCurrentPrices(markets);
    const sellTickers = prices.filter((price) => {});
  }

  async getCurrentPrices(markets) {
    try {
      const { data } = await fetchCurrentTicker(markets);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("no responed for prices");
      }

      return data.map((_ticker) => new TickerDataFormatter(_ticker));
    } catch (error) {
      console.log(`[WARN] get current prices by ${markets}: ${error}`);
      return [];
    }
  }

  checkOverMaxLossPrice(currPrice, boughtPrice) {
    return currPrice < boughtPrice - boughtPrice * STOP_LOSS_RATE;
  }

  checkOverMaxGreedPrice(currPrice, boughtPrice) {
    return currPrice >= boughtPrice + boughtPrice * STOP_GREED_RATE;
  }
}

export default SellTrader;
