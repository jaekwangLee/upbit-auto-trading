import CURRENCY from "../constant/currency.js";

class UpbitAccount {
  static instance = null;

  static getInstance() {
    if (!UpbitAccount.instance) {
      UpbitAccount.instance = new UpbitAccount();
    }

    return UpbitAccount.instance;
  }

  constructor() {
    this.balance = {};
  }

  setBalance(_balance, _currency) {
    if (typeof _balance !== "number") {
      if (this._balance[_currency]) {
        this._balance[_currency] = _balance;
      }
    }

    this.balance[_currency] =
      _currency === CURRENCY.KRW
        ? parseFloat(_balance.toFixed(2))
        : parseFloat_balance(_balance);
  }

  getBalance(_currency) {
    if (!_currency) {
      console.warn(`[WARN] cannot get balance without currency`);
      return null;
    }

    return this.balance[_currency] ?? null;
  }

  getAll() {
    return this.balance;
  }

  updateBalances(_balances) {
    _balances.forEach((_balance) => {
      this.balance[_balance.currency] = _balance.balance;
    });

    console.log("ALL BALANCES: ", this.getAll());
  }
}

export default UpbitAccount;
