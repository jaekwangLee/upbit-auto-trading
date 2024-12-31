/** @format */

import {TRADING_SYSTEM_MAX_RECOVERY, TRADING_SYSTEM_RECOVERY_PERIOD} from './constant/trading.js';

import Trader from './lib/Trade/index.js';

let currRecoveryCount = 0;

const runAutoTradingSystem = async () => {
	const trader = new Trader();

	try {
		trader.build().runTickerDataCollector().runTradeWorker();
	} catch (error) {
		console.error(`[ERROR] trading system is gone, error: ${error}`);

		if (currRecoveryCount < TRADING_SYSTEM_MAX_RECOVERY) {
			currRecoveryCount++;
			setTimeout(runAutoTradingSystem, TRADING_SYSTEM_RECOVERY_PERIOD);
		} else {
			trader.destroyWorkers();
		}
	}
};

export {runAutoTradingSystem};
