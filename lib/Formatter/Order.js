class OrderHistoryFormatter {
  constructor(data, type) {
    this.orderId = data.uuid;
    this.orderType = type;
    this.ticker = data.market;
    this.requestPrice = parseFloat(data.price);
    this.requestTotalPrice = parseFloat(data.locked);
    this.requestVolume = parseFloat(data.volume);
    this.timestamp = new Date(data.created_at);
    
    this.state = data.state;
    this.remainingVolume = parseFloat(data.remaining_volume);
    this.executedVolume = parseFloat(data.executed_volume);
  }
}

export default OrderHistoryFormatter;
