import { convertChangePriceDirectionUnit } from "../../utils/price.js";

class TickerDataFormatter {
  constructor(data) {
    this.market = data.market;
    this.tradeDate = new Date(data.trade_timestamp);
    this.changeDirection = convertChangePriceDirectionUnit(data.change);
    this.price = data.trade_price;
    this.changePrice = data.change_price;
    this.changeRate = data.change_rate;
    this.changePriceHasDirection = data.signed_change_price;
    this.changeRateHasDirection = data.signed_change_rate;
    this.oneYearHighestPrice = data.highest_52_week_price;
    this.oneYearLowestPrice = data.lowest_52_week_price;
    this.timestamp = data.timestamp;
  }
}

export {
  TickerDataFormatter,
}