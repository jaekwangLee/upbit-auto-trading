class Coefficient {
  static PER_VALUE = 0.1;
  
  static PER_RATE = 0.0001;

  static instance = null;

  static getInstance = () => {
    if (this.instance) {
      return this.instance;
    }

    Coefficient.instance = new Coefficient();
    return Coefficient.instance;
  }

  constructor() {
    // 가산치 기본값
    this.weight = 0;

    // 가산치 증감 비율 - 오래된 데이터에 대한 가산치, 크면 오래된 데이터의 가치가 크고, 작으면 오래된 데이터의 가치가 작음
    this.per_weight_rate = 0; 

    // 손절률
    this.max_loss_rate = 0;

    // 익절률
    this.max_greed_rate = 0;
  }

  changeWeight(isUp = true) {
    if (isUp) {
      this.weight += Coefficient.PER_VALUE;
    } else {
      this.weight -= Coefficient.PER_VALUE;
    }
  }

  changeRate(isUp = true) {
    if (isUp) {
      this.per_weight_rate += Coefficient.PER_RATE;
    } else {
      this.per_weight_rate -= Coefficient.PER_RATE;
    }
  }
}