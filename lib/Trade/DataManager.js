import { MILLISECONDS, TICKER_REQUEST_TIMING } from "../../constant/trading.js";

import { checkLessThanTime } from "../../utils/date.js";

class TradeDataManager {
  constructor(ticker) {
    this.ticker = ticker;
    this.tickerHistories = [];
    this.orderHistories = [];
  }

  getMovingAverageValueByMinute(minute) {
    const averageValues = this.tickerHistories.filter((ticker) => {
      return checkLessThanTime(ticker.timestamp, 60 * minute);
    });

    const isReadySetData =
      averageValues.length >= (minute * MILLISECONDS) / TICKER_REQUEST_TIMING;

    if (!isReadySetData) {
      return { ready: false, value: 0 };
    }

    const averageValue = (
      averageValues.reduce((acc, ticker) => ticker.price + acc, 0) /
      averageValues.length
    ).toFixed(3);

    return { ready: true, value: parseFloat(averageValue) };
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
}

export default TradeDataManager;
