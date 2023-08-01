import {
  TRADING_SYSTEM_MAX_RECOVERY,
  TRADING_SYSTEM_RECOVERY_PERIOD,
} from "./constant/trading.js";
import { PREFER_COIN_MARKET } from "./constant/market.js";

import UpbitAccount from "./lib/Account.js";
import { TickerDataFormatter } from "./lib/Ticker.js";

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

const getCurrentTicker = async (_markets) => {
  try {
    const { data } = await fetchCurrentTicker(_markets);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("no responed for ticker");
    }

    return data.map((_ticker) => new TickerDataFormatter(_ticker));
  } catch (error) {
    console.warn(`[WARN] get current ticker ${_markets.join(', ')} failed: ${error}`);
    return null;
  }
};

const runAutoTradingSystem = async () => {
  try {
    const balances = await getAllAccount();
    account.updateBalances(balances);

    const tickers = await getCurrentTicker(Object.values(PREFER_COIN_MARKET).join(', '));
  } catch (error) {
    console.error(`[ERROR] trading system is gone, error: ${error}`);

    if (currRecoveryCount < TRADING_SYSTEM_MAX_RECOVERY) {
      setTimeout(runAutoTradingSystem, TRADING_SYSTEM_RECOVERY_PERIOD);
    }
  }
};

export { runAutoTradingSystem };
