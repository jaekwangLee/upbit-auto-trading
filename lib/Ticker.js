import { convertChangePriceDirectionUnit } from "../utils/price.js";

class TickerDataFormatter {
  constructor(_data) {
    this.market = _data.market;
    this.tradeDate = new Date(_data.trade_timestamp);
    this.changeDirection = convertChangePriceDirectionUnit(_data.change);
    this.price = _data.trade_price;
    this.changePrice = _data.change_price;
    this.changeRate = _data.change_rate;
    this.changePriceHasDirection = _data.signed_change_price;
    this.changeRateHasDirection = _data.signed_change_rate;
    this.oneYearHighestPrice = _data.highest_52_week_price;
    this.oneYearLowestPrice = _data.lowest_52_week_price;

  }
}

export {
  TickerDataFormatter,
}