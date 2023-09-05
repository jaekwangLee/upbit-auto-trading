/** @format */

import {
  CURRENT_TRADE_MODE,
  TICKER_REQUEST_TIMING,
  TRADE_MODE,
  TRADE_REQUEST_TIMING,
} from "../../constant/trading.js";
import { MARKET_STATUS, PREFER_COIN_MARKET } from "../../constant/market.js";

import TradeDataManager from "./DataManager.js";
import BuyTrader from "./Buyer.js";
import SellTrader from "./Seller.js";
import { Subject } from "../Observer.js";
import { dConsole, dConsoleError, dConsoleWarn } from "../../utils/log.js";
import { fetchCandle, fetchAllMarkets } from "../../api/upbit/market.js";
import MinuteBar from "../Formatter/MinuteBar.js";

class TraderManager extends Subject {
  constructor() {
    super();

    this.buyer = new BuyTrader();
    this.seller = new SellTrader();
    this.dataManager = new TradeDataManager();
    this.tickerIntervalId = null;
    this.tradeIntervalId = null;
    this.tradeStateIntervalId = null;
    this.observers = [];
  }

  build() {
    this.registerObserver(this.buyer)
        .registerObserver(this.seller);

    return this;
  }

  runTickerDataCollector() {
    const getCandles = async () => {
      try {
        const isSafeMode = CURRENT_TRADE_MODE === TRADE_MODE.SAFE;
        const tickers = isSafeMode ? this.fetchPreferMarketCandles() : await this.fetchWarningMarketTickers();
        const promises = await Promise.all(tickers.map((ticker) => fetchCandle(ticker, 1)));

        return promises.map(({ data }) => {
          const tick = data[0];
          return { 
            ticker: tick?.market, 
            candles: data.map((candle) => new MinuteBar(candle))
          };
        });
      } catch(error) {
        dConsoleWarn(`[Data Collector] 캔들 정보 조회 실패 ${error}`);
        return [];
      }
    };

    this.tickerIntervalId = setInterval(async () => {
      const candles = await getCandles();
      if (candles.length > 0) {
        candles.forEach((candleData) => {
          this.dataManager.setCandles(candleData.ticker, candleData.candles)
        });
      }
    }, TICKER_REQUEST_TIMING);

    return this;
  }

  async fetchWarningMarketTickers() {
    try {
      const { data } = await fetchAllMarkets();
      if (!data || data.length === 0) {
        return [];
      }

      const tickers = data.filter((marketData) => marketData.market_warning === MARKET_STATUS.WARNING)
                          .map((marketData) => marketData.market);

      return tickers;
    } catch(error) {
      dConsoleError(`[Data Collector] 유의! 마켓 조회 실패: ${error}`);
      return [];
    }
  }

  fetchPreferMarketCandles() {
    return Object.values(PREFER_COIN_MARKET);
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
