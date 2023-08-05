import {
  ORDER_TYPE,
  TRADING_SYSTEM_MAX_RECOVERY,
  TRADING_SYSTEM_RECOVERY_PERIOD,
} from "./constant/trading.js";
import { PREFER_COIN_MARKET } from "./constant/market.js";

import TickerDataFormatter from "./lib/Formatter/Ticker.js";
import OrderHistoryFormatter from "./lib/Formatter/Order.js";
import UpbitAccount from "./lib/Account.js";
import Trader from "./lib/Trade/index.js";

import { fetchAllAccount } from "./api/upbit/account.js";
import {
  buyOrderUpbitCoin,
  fetchCurrentTicker,
  sellOrderUpbitCoin,
} from "./api/upbit/order.js";

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

const getPreferMarketTickerList = async () => {
  const preferMarkets = Object.values(PREFER_COIN_MARKET).join(", ");
  console.log("preferMarkets", preferMarkets);
  try {
    const { data } = await fetchCurrentTicker(preferMarkets);
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("no responed for ticker");
    }

    return data.map((_ticker) => new TickerDataFormatter(_ticker));
  } catch (error) {
    console.warn(
      `[WARN] get prefer market ticker ${preferMarkets} failed: ${error}`
    );
    return null;
  }
};

const orderCoin = async (type, ticker, volume) => {
  try {
    const { data } =
      type === ORDER_TYPE.BID
        ? await buyOrderUpbitCoin(ticker, { volume })
        : await sellOrderUpbitCoin(ticker, { volume });

    return new OrderHistoryFormatter(data, type);
  } catch (error) {
    console.warn(
      `[WARN] failed order - ${type} "${ticker}": ${volume}... ${error}`
    );
    return null;
  }
};

const runAutoTradingSystem = async () => {
  const trader = new Trader();

  try {
    const balances = await getAllAccount();
    account.updateBalances(balances);

    // TODO
    // 이후에 tikcers를 새로 받아오고 전환하는 기능도 추가해야함.
    // 한 종목만 파지말고 매매패턴 한번 돌린 후에는 종목으로 갈아타도록

    const tickers = await getPreferMarketTickerList();

    trader
      .setTickerByPerferTickers(tickers)
      .setDataManager()
      .runTickerDataCollector()
      .runTradeWorker();
  } catch (error) {
    console.error(`[ERROR] trading system is gone, error: ${error}`);

    if (currRecoveryCount < TRADING_SYSTEM_MAX_RECOVERY) {
      currRecoveryCount++;
      setTimeout(runAutoTradingSystem, TRADING_SYSTEM_RECOVERY_PERIOD);
    } else {
      trader.destroyDataCollector();
      trader.destroyTrader();
    }
  }
};

export { runAutoTradingSystem };
