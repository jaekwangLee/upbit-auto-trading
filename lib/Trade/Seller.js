/** @format */

import { STOP_LOSS_RATE, STOP_GREED_RATE, ORDER_TYPE } from "../../constant/trading.js";

import { reduceArrayWithSameKey } from "../../utils/array.js";

import { fetchCurrentTicker, sellOrderUpbitCoin } from "../../api/upbit/order.js";

import OrderHistoryFormatter from "../Formatter/Order.js";

class SellTrader {
  async run(balances) {
    const markets = balances.map((balance) => balance.ticker).join(", ");
    if (!markets) {
      console.log('[Sell Trader] Has no balances');
      return;
    }

    
    const prices = await this.getCurrentPrices(markets);
    console.log(`[Sell Trader] prices: ${JSON.stringify(prices)}`);
    console.log(`[Sell Trader] balances: ${JSON.stringify(balances)}`)
    console.log(`[Sell Trader] reduced: ${JSON.stringify(reduceArrayWithSameKey(balances, prices, 'ticker'))}`);

    const sellTickers = reduceArrayWithSameKey(balances, prices, 'ticker').filter((ticker) => {
      console.log('tccc: ', ticker)
      return this.#checkOverMaxGreedPrice(ticker.currentPrice, ticker.price) || this.#checkOverMaxLossPrice(ticker.currentPrice, ticker.price);
    });
    if (sellTickers.length === 0) {
      console.log('[Sell Trader] no reasonable price tickers ...');
      return;
    }
    console.log('sellTickers: ', sellTickers);

    const orderResult = await Promise.all(sellTickers.map((market) => this.order(market.ticker, { price: market.currentPrice, volume: market.volume })));
    console.log('orderResult: ', orderResult)
    if (!orderResult) {
      return null;
    }

    return orderResult;
  }

  async getCurrentPrices(markets) {
    try {
      const { data } = await fetchCurrentTicker(markets);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("[Sell Trader] no responed for prices");
      }

      return data.map((ticker) => ({ ticker: ticker.market, currentPrice: ticker.trade_price }));
    } catch (error) {
      console.log(`[Sell Trader] get current prices by ${markets}: ${error}`);
      return [];
    }
  }

  async order(ticker, price, volume) {
    try {
      const response = await sellOrderUpbitCoin(ticker, { price, volume });
      if (!response) {
        throw new Error('[Sell Trader] failed order sell coin');
      }

      return new OrderHistoryFormatter(response, ORDER_TYPE.ASK);
    } catch(error) {
      console.warn(`[Sell Trader] failed sell "${ticker}": ${volume}... ${error}`);
      return null;
    }

  }

  #checkOverMaxLossPrice(currPrice, boughtPrice) {
    return currPrice < boughtPrice - boughtPrice * STOP_LOSS_RATE;
  }

  #checkOverMaxGreedPrice(currPrice, boughtPrice) {
    return currPrice >= boughtPrice + boughtPrice * STOP_GREED_RATE;
  }
}

export default SellTrader;