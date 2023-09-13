import CURRENCY from "../../constant/currency.js";
import { getTickerWithCurrency } from "../../utils/price.js";

class Asset {
  constructor(asset) {
    this.volume = asset.balance;
    this.price = asset.avg_buy_price;
    this.ticker = asset.currency === CURRENCY.KRW ? asset.currency : getTickerWithCurrency(asset.currency, asset.unit_currency);
  }
}

export default Asset;