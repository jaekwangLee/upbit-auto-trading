/** @format */

import { ORDER_TYPE, TICKER_REQUEST_TIMING } from "../../constant/trading.js";
import CURRENCY from "../../constant/currency.js";

import { checkLessThanTime } from "../../utils/date.js";
import { convertOrderTypeForDB } from "../../utils/trade.js";
import Datbase from "../../db.js";

import UpbitAccount from "../Account.js";

class TradeDataManager {
  constructor(ticker) {
    this.ticker = ticker;
    this.tickerHistories = [];
    this.orderHistories = [];
    this.account = UpbitAccount.getInstance();
    this.db = new Datbase(process.env.DATABASE).getDB();
  }

  getMovingAverageValueByMinute(minute) {
    const averageValues = this.tickerHistories.filter((ticker) => {
      return checkLessThanTime(ticker.timestamp, 60 * minute);
    });

    const isReadySetData =
      averageValues.length >= minute / TICKER_REQUEST_TIMING;

    if (!isReadySetData) {
      return { ready: false, value: 0 };
    }

    const averageValue = (
      averageValues.reduce((acc, ticker) => ticker.price + acc, 0) /
      averageValues.length
    ).toFixed(3);

    return { ready: true, value: parseFloat(averageValue) };
  }

  getCurrentValue() {
    if (this.tickerHistories.length === 0) {
      return null;
    }

    return this.tickerHistories[this.tickerHistories.length - 1];
  }

  getHistories() {
    return this.tickerHistories;
  }

  pushHistory(data) {
    this.tickerHistories.push(data);
    return this;
  }

  clearHistory() {
    this.tickerHistories = this.tickerHistories.slice(0, 0);
    return this;
  }

  getOrderHistories() {
    return this.orderHistories;
  }

  async pushOrderHistory(data, orderReason) {
    this.orderHistories.push(data);
    const { orderId, orderType } = data;

    try {
      const insertResult = await this.#insertData(data);
      if (!insertResult || insertResult instanceof Error) {
        return;
      }

      const findResult =
        orderType === ORDER_TYPE.BID
          ? await this.#findBid(orderId)
          : await this.#findAsk(orderId);

      if (!findResult || insertResult instanceof Error) {
        return;
      }

      const id =
        orderType === ORDER_TYPE.BID ? findResult.bidIdx : findResult.askIdx;
      const type = convertOrderTypeForDB(orderType);
      await this.#insertTrade(id, type, orderReason);
    } catch (error) {
      console.log(`[ERROR] push order history failed: ${error}`);
      return error;
    }
  }

  clearOrderHistory() {
    this.orderHistories = this.orderHistories.slice(0, 0);
    return this;
  }

  async getBalance(currency = CURRENCY.KRW) {
    const balance = await this.account.getBalance(currency);
    return balance * 0.98;
  }

  async getAllCoins() {
    const balance = await this.account.getAllAccount();
    return balance.filter((coin) => coin.currency !== CURRENCY.KRW);
  }

  #findBid(orderId) {
    return new Promise((resolve, reject) => {
      try {
        const query = `SELECT bidIdx FROM bids WHERE uuid = ?`;

        this.db.get(query, [orderId], (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(row);
        });
      } catch (error) {
        console.log(`[ERROR] find bid from bids failed: ${error}`);
        reject(error);
      }
    });
  }

  #findAsk(orderId) {
    return new Promise((resolve, reject) => {
      try {
        const query = `SELECT askIdx FROM asks WHERE uuid = ?`;

        this.db.get(query, [orderId], (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(row);
        });
      } catch (error) {
        console.log(`[ERROR] find ask from asks failed: ${error}`);
        reject(error);
      }
    });
  }

  #insertData(orderData) {
    return new Promise((resolve, reject) => {
      try {
        const { orderId, orderType, ticker, requestPrice, requestVolume } =
          orderData;
        const table = orderType === ORDER_TYPE.BID ? "bids" : "asks";
        const query = `INSERT INTO ${table} (uuid, ticker, price, volume) VALUES (?, ?, ?, ?)`;
        const data = [orderId, ticker, requestPrice, requestVolume];

        this.db.run(query, data, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(true);
        });
      } catch (error) {
        console.log(`[ERROR] insert bid/ask data failed: ${error}`);
        reject(error);
      }
    });
  }

  #insertTrade(id, type, reason) {
    return new Promise((resolve, reject) => {
      try {
        const query =
          type === 1
            ? `INSERT INTO trades (bidIdx, type, reason) VALUES (?, ?, ?)`
            : `INSERT INTO trades (askIdx, type, reason) VALUES (?, ?, ?)`;

        this.db.run(query, [id, type, reason], (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(true);
        });
      } catch (error) {
        console.log(`[ERROR] insert trade from trades failed: ${error}`);
        reject(error);
      }
    });
  }
}

export default TradeDataManager;
