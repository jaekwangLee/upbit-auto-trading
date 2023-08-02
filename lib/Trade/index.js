import BuyTrader from "./Buyer.js";
import TradeDataManager from "./DataManager.js";
import SellTrader from "./Seller.js";

class TraderFacade {
  constructor() {
    this.buyer = new BuyTrader();
    this.seller = new SellTrader();
    this.dataManager = null;
    this.ticker = null;
  }

  addTickerHistory(data) {
    this.dataManager.pushHistory(data);
    return this;
  }

  inializeTickerHistory() {
    this.dataManager.clearHistory();
    return this;
  }

  setTickerByPerferTickers(tickers) {
      this.ticker = this.buyer.selectBestTickers(tickers);
      return this;
  }

  setDataManager() {
    if (!this.ticker) {
      console.warn('Cannot find ticker');
      return;
    }

    this.dataManager = new TradeDataManager(this.ticker);
    return this;
  }
}

export default TraderFacade;