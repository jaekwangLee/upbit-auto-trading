class DayCandle {
  constructor(candle) {
    this.changeRate = candle.change_rate;
    this.changePrice = candle.change_price;
    this.max = candle.high_price;
    this.min = candle.low_price;
    this.avg = (candle.low_price + candle.high_price) / 2;;
    this.end = candle.trade_price;
  }
}