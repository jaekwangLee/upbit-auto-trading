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
    this.ticker = null;
    this.dataManager = null;
    this.tickerIntervalId = null;
    this.tradeIntervalId = null;
    this.tradeStateIntervalId = null;
  }

  build(tickers) {
    this.ticker = this.buyer.selectBestTickers(tickers);
    this.dataManager = new TradeDataManager(this.ticker);
    return this;
  }

  // TODO: worker -> observer 구조로 변경
  runTickerDataCollector() {
    const getTicker = async (ticker) => {
      try {
        const { data } = await fetchCurrentTicker(ticker);
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("[Data Collector] no responed for ticker");
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
        this.dataManager.pushHistory(ticker);
      }
    }, TICKER_REQUEST_TIMING);

    return this;
  }

  runTradeWorker() {
    this.tradeIntervalId = setInterval(async () => {
      const movingAverage = this.dataManager.getMovingAverageValueByMinute(
        TRADE_AVERAGE_VALUE_TIMING
      );
      const currValue = this.dataManager.getCurrentValue();
      const balance = await this.dataManager.getBalance(CURRENCY.KRW);

      // Buy Trader
      this.buyer
        .run(movingAverage, currValue.price, balance, this.ticker)
        .then((history) => {
          if (history) {
            const orderReason = `[Buy Trader Macro] ${this.ticker} -> MovingAverage: ${movingAverage} & CurrentValue: ${currValue.price}`;
            void this.dataManager.pushOrderHistory(history, orderReason);
          }
        });

      // Sell Trader
      const coins = await this.dataManager.getAllCoins();
      void this.seller.run(coins).then((history) => {
        if (history) {
          const orderReason = `[Sell Trader Macro] ${this.ticker} -> value: ${history.requestPrice}`;
          void this.dataManager.pushOrderHistory(history, orderReason);
        }
      });
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

export default TraderFacade;
