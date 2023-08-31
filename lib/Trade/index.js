/** @format */

import {
  TICKER_REQUEST_TIMING,
  TRADE_REQUEST_TIMING,
} from "../../constant/trading.js";

import { fetchCurrentTicker } from "../../api/upbit/order.js";

import TickerDataFormatter from "../Formatter/Ticker.js";
import TradeDataManager from "./DataManager.js";
import BuyTrader from "./Buyer.js";
import SellTrader from "./Seller.js";
import { Subject } from "../Observer.js";

class TraderManager extends Subject {
  constructor() {
    super();

    this.buyer = new BuyTrader();
    this.seller = new SellTrader();
    this.ticker = null;
    this.dataManager = null;
    this.tickerIntervalId = null;
    this.tradeIntervalId = null;
    this.tradeStateIntervalId = null;
    this.observers = [];
  }

  build(tickers) {
    this.ticker = this.buyer.selectBestTickers(tickers);
    this.dataManager = new TradeDataManager(this.ticker);
    this.registerObserver(this.buyer)
        .registerObserver(this.seller);

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
        console.warn(`[Data Collector] get ticker ${ticker} failed: ${error}`);
        return null;
      }
    };

    this.tickerIntervalId = setInterval(async () => {
      const ticker = await getTicker(this.ticker);
      if (ticker) {
        this.dataManager.addTicker(ticker);
      }
    }, TICKER_REQUEST_TIMING);

    return this;
  }

  registerObserver(observer) {
    this.observers.push(observer);
    return this;
  }

  notifyObserver() {
    for (const observer of this.observers) {
      observer.update(this.dataManager);
    }
  }

  runTradeWorker() {
    this.tradeIntervalId = setInterval(() => {
      this.notifyObserver();
    }, TRADE_REQUEST_TIMING);
  }

  runTradeStateWorker() {
    this.tradeStateIntervalId = setInterval(() => {}, TRADE_REQUEST_TIMING);
  }

  destroyWorkers() {
    clearTimeout(this.tickerIntervalId);
    clearInterval(this.tradeIntervalId);
  }
}

export default TraderManager;
