/** @format */

import CURRENCY from "../../constant/currency.js";
import {
  TICKER_REQUEST_TIMING,
  TRADE_AVERAGE_VALUE_TIMING,
  TRADE_REQUEST_TIMING,
} from "../../constant/trading.js";

import { fetchCurrentTicker } from "../../api/upbit/order.js";

import TickerDataFormatter from "../Formatter/Ticker.js";
import TradeDataManager from "./DataManager.js";
import BuyTrader from "./Buyer.js";
import SellTrader from "./Seller.js";

class TraderFacade {
  constructor() {
    this.buyer = new BuyTrader();
    this.seller = new SellTrader();
    this.dataManager = null;
    this.ticker = null;
    this.tickerIntervalId = null;
    this.tradeIntervalId = null;
  }

  addTickerHistory(data) {
    this.dataManager.pushHistory(data);
    console.log(
      `collected "${this.ticker}" count: `,
      this.dataManager.getHistories().length
    );
    return this;
  }

  inializeTickerHistory() {
    this.dataManager.clearHistory();
    return this;
  }

  setTickerByPerferTickers(tickers) {
    this.ticker = this.buyer.selectBestTickers(tickers);
    return this;
  }

  setDataManager() {
    if (!this.ticker) {
      console.warn("Cannot find ticker");
      return this;
    }

    this.dataManager = new TradeDataManager(this.ticker);
    return this;
  }

  runTickerDataCollector() {
    const getTicker = async (ticker) => {
      try {
        const { data } = await fetchCurrentTicker(ticker);
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("no responed for ticker");
        }

        return new TickerDataFormatter(data[0]);
      } catch (error) {
        console.warn(`[WARN] get ticker ${ticker} failed: ${error}`);
        return null;
      }
    };

    this.tickerIntervalId = setInterval(async () => {
      const ticker = await getTicker(this.ticker);
      if (ticker) {
        this.addTickerHistory(ticker);
      }
    }, TICKER_REQUEST_TIMING);

    return this;
  }

  destroyDataCollector() {
    clearTimeout(this.tickerIntervalId);
  }

  runTradeWorker() {
    this.tradeIntervalId = setInterval(async () => {
      const movingAverage = this.dataManager.getMovingAverageValueByMinute(
        TRADE_AVERAGE_VALUE_TIMING
      );
      const currValue = this.dataManager.getCurrentValue();
      const balance = await this.dataManager.getBalance(CURRENCY.KRW);

      // Buy Trader
      this.buyer.run(movingAverage, currValue.price, balance, this.ticker);

      // Sell Trader
    }, TRADE_REQUEST_TIMING);
  }

  destroyTrader() {
    clearInterval(this.tradeIntervalId);
  }
}

export default TraderFacade;
