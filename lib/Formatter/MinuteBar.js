class MinuteBar {
  constructor(candle) {
    const {
      low_price,
      high_price,
      opening_price,
      trade_price,
      timestamp,
    } = candle;

    this.min = low_price;
    this.max = high_price;
    this.avg = low_price + high_price / 2;
    this.first = opening_price;
    this.end = trade_price;
    this.timestamp = new Date(timestamp);
  }
}

export default MinuteBar;