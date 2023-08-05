import { ORDER_TYPE } from "../../constant/trading.js";

class OrderHistoryFormatter {
  constructor(data, type) {
    this.orderType = type;
    this.ticker = data.market.id;

    if (this.orderType === ORDER_TYPE.BID) {
      this.fee = data.bid_fee;
      this.unit = data.market.bid?.price_unit;
      this.minPrice = data.market.bid?.min_total; // 최소 매도/매수 금액
      this.maxPrice = data.market.max_total; // 최대 매도/매수 금액
      this.avgPrice = data.bid_account?.avg_buy_price; // 매수평균가
    } else if (this.orderType === ORDER_TYPE.ASK) {
      this.fee = data.ask_fee;
      this.unit = data.market.ask?.price_unit;
      this.minPrice = data.market.ask?.min_total; // 최소 매도/매수 금액
      this.maxPrice = data.market.max_total; // 최대 매도/매수 금액
      this.avgPrice = data.ask_account?.avg_buy_price; // 매도평균가
    }
  }
}

export default OrderHistoryFormatter;
