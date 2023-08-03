import { MOVING_AVERAGE_MINUTE } from "../../constant/trading";

class TradeDataManager {
  constructor(ticker) {
    this.ticker = ticker;
    this.tickerHistories = [];
    this.orderHistories = [];
  }

  getMovingAverageValueByMinute() {
    const fiveMinuteAverageValue = this.tickerHistories.filter((ticker) => {
      return checkLessThanTime(ticker.timestamp, 60 * 5);
    });

    
    return { five: 0, twenty: 0, sixty: 0 };
  }

  pushHistory(data) {
    this.tickerHistories.push(data);
    return this;
  }

  clearHistory() {
    this.tickerHistories = this.tickerHistories.slice(0, 0);
    return this;
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

export default TradeDataManager