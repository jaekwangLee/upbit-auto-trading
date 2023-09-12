import CURRENCY from "../../constant/currency.js";
import { getTickerWithCurrency } from "../../utils/price.js";

class Asset {
  constructor(asset) {
    this.ticker = asset.currency === CURRENCY.KRW ? asset.currency : getTickerWithCurrency(asset.currency, asset.unit_currency);
    this.volume = this.balance;
    this.price = this.avg_buy_price;
  }
}

export default Asset;