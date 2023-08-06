/** @format */

import { TICKER_REQUEST_TIMING } from "../../constant/trading.js";
import CURRENCY from "../../constant/currency.js";

import { checkLessThanTime } from "../../utils/date.js";

import UpbitAccount from "../Account.js";

class TradeDataManager {
  constructor(ticker) {
    this.ticker = ticker;
    this.tickerHistories = [];
    this.orderHistories = [];
    this.account = UpbitAccount.getInstance();
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

  pushOrderHistory(data) {
    this.orderHistories.push(data);
    return this;
  }

  clearOrderHistory() {
    this.orderHistories = this.orderHistories.slice(0, 0);
    return this;
  }

  async getBalance(currency = CURRENCY.KRW) {
    const balance = await this.account.getBalance(currency);
    return balance * 0.98;
  }
}

export default TradeDataManager;
