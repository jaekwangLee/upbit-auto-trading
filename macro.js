import {
  TRADING_PERIOD,
  TRADING_SYSTEM_MAX_RECOVERY,
  TRADING_SYSTEM_RECOVERY_PERIOD,
} from "./constant/trading.js";
import { PREFER_COIN_MARKET } from "./constant/market.js";

import { convertChangePriceDirectionUnit } from "./utils/price.js";

import UpbitAccount from "./lib/Account.js";
import { fetchAllAccount } from "./api/upbit/account.js";
import { fetchCurrentTicker } from "./api/upbit/order.js";

let currRecoveryCount = 0;
const account = UpbitAccount.getInstance();

const getAllAccount = async () => {
  try {
    const { data } = await fetchAllAccount();
    return data.map((_balance) => ({
      currency: _balance.currency,
      balance: _balance.balance,
    }));
  } catch (error) {
    console.warn(`[WARN] get all account balance failed: ${error}`);
    return [];
  }
};

const getCurrentTicker = async (_market) => {
  try {
    const { data } = await fetchCurrentTicker(_market);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("no responed for ticker");
    }

    const {
      market,
      trade_timestamp,
      trade_price,
      highest_52_week_price,
      lowest_52_week_price,
      change,
      change_price,
      change_rate,
      signed_change_price,
    } = data[0];

    return {
      market,
      tradeDate: new Date(trade_timestamp),
      changeDirection: convertChangePriceDirectionUnit(change),
      price: trade_price,
      changePrice: change_price,
      changeRate: change_rate,
      changePriceHasDirection: signed_change_price,
      oneYearHighestPrice: highest_52_week_price,
      oneYearLowestPrice: lowest_52_week_price,
    };
  } catch (error) {
    console.warn(`[WARN] get current ticker ${_market} failed: ${error}`);
    return null;
  }
};

const runAutoTradingSystem = async () => {
  try {
    const balances = await getAllAccount();
    account.updateBalances(balances);

    const ticker = await getCurrentTicker(PREFER_COIN_MARKET.BITCOIN_KRW);
  } catch (error) {
    console.error(`[ERROR] trading system is gone, error: ${error}`);

    if (currRecoveryCount < TRADING_SYSTEM_MAX_RECOVERY) {
      setTimeout(runAutoTradingSystem, TRADING_SYSTEM_RECOVERY_PERIOD);
    }
  }
};

export { runAutoTradingSystem };
