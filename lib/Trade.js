class BuyTrader {
  algorithm() {

  }
}

class SellTrader {
  algorithm() {
    
  }
}

class TradeDataManager {
  constructor() {
    this.ticker = '';
    this.histories = [];
  }
}

class TradeDataBuilder {
  constructor() {
    const dataManager = new TradeDataManager();
  }

  setTicker(_ticker) {
    dataManager.ticker = _ticker;
    return this;
  }

  pushHistory() {
    return this;
  }

  clearHistory() {

  }
}

class TraderFacade {
  constructor() {
    this.buyer = new BuyTrader();
    this.seller = new SellTrader();
  }


}

export default TraderFacade;