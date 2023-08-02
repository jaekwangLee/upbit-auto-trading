class TradeDataManager {
  constructor(ticker) {
    this.ticker = ticker;
    this.histories = [];
  }

  pushHistory(data) {
    this.histories.push(data);
    return this;
  }

  clearHistory() {
    this.histories = this.histories.slice(0, 0);
    return this;
  }
}

export default TradeDataManager