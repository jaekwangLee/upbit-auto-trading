class BuyTrader {
  algorithm() {

  }

  selectBestTickers(tickers) {
    return this.#sortByChangeRate(tickers);
  }

  #sortByChangeRate(tickers) {
    return tickers.sort((a, b) => {
      if (a.changeRate > b.changeRate) {
        return -1;
      } else if (a.changeRate < b.changeRate) {
        return 1;
      } else {
        if (a.changeRateHasDirection > b.changeRateHasDirection) {
          return -1;
        } else if (a.changeRateHasDirection < b.changeRateHasDirection) {
          return 1;
        }

        return 0;
      }
    });
  }
}

export default BuyTrader;