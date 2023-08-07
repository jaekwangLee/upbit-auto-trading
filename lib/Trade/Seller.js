/** @format */

import { fetchCurrentTicker } from "../../api/upbit/order.js";
import TickerDataFormatter from "../Formatter/Ticker.js";

class SellTrader {
  async run(balances) {
    console.log("balances", balances);

    const markets = balances.map((balance) => balance.currency).join(', ');
    if (!markets) {
      return;
    }
    
    const prices = await this.getCurrentPrices(markets);
    console.log('prices: ', prices)
  }

  async getCurrentPrices(markets) {
    try {
      const { data } = await fetchCurrentTicker(markets);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("no responed for prices");
      }
  
      return data.map((_ticker) => new TickerDataFormatter(_ticker));
    } catch(error) {
      console.log(`[WARN] get current prices by ${markets}: ${error}`);
      return [];
    }
  }

  checkReasonablePrice() {}
}

export default SellTrader;
