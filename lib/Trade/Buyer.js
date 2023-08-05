import { buyOrderUpbitCoin } from "../../api/upbit/order.js";
import OrderHistoryFormatter from "../Formatter/Order.js";

class BuyTrader {
  async order(ticker, volume) {
    try {
      const { data } = await buyOrderUpbitCoin(ticker, { volume });
      return new OrderHistoryFormatter(data, TRADE);
    } catch (error) {
      console.warn(`[WARN] failed buy "${ticker}": ${volume}... ${error}`);
      return null;
    }
  };

  checkReasonablePrice(averageValue, currentValue) {
    if (averageValue > currentValue) {
      return true;
    } else {
      console.log(`Current price is expensive: avg-${averageValue} | curr-${currentValue}`);
      return false;
    }
  }

  selectBestTickers(tickers) {
    if (tickers.length === 0) {
      return null;
    }

    const sortedTickers = this.#sortByChangeRate(tickers);
    return sortedTickers[0].market;
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
