import { getAverageByNumberField } from "../../utils/array.js";

class MinuteBar {
  constructor() {
    this.min = 0;
    this.max = 0;
    this.avg = 0;  
  }

  set(tickers = []) {
    if (tickers.length < 1) {
      return;
    }

    this.min = tickers.sort((a, b) => a.price < b.price ? -1 : 1)[0];
    this.max = tickers.sort((a, b) => a.price > b.price ? -1 : 1)[0];
    this.avg = getAverageByNumberField(tickers, 'price');
  }

  get() {
    return this;
  }
}

export default MinuteBar;