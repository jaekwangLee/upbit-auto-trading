/** @format */

import CURRENCY from '../constant/currency.js';

import {fetchAllAccount} from '../api/upbit/account.js';

import Asset from './Formatter/Asset.js';

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

	async getAllAccount() {
		try {
			const {data} = await fetchAllAccount();
			return data.map((_balance) => new Asset(_balance));
		} catch (error) {
			console.warn(`[WARN] get all account balance failed: ${error}`);
			return [];
		}
	}

	checkHasTicker(_ticker) {
		try {
			return !!this.balance[_ticker];
		} catch (e) {
			return false;
		}
	}

	setBalance(_balance, _currency) {
		if (typeof _balance !== 'number') {
			if (this.balance[_currency]) {
				this.balance[_currency] = _balance;
			}
		}

		this.balance[_currency] = _currency === CURRENCY.KRW ? parseFloat(_balance.toFixed(2)) : parseFloat_balance(_balance);
	}

	async getBalance(_currency) {
		if (!_currency) {
			console.warn(`[WARN] cannot get balance without currency`);
			return null;
		}

		await this.renewBalances();
		return this.balance[_currency].volume ?? 0;
	}

	getAll() {
		return this.balance;
	}

	async renewBalances() {
		const balances = await this.getAllAccount();

		this.balance = {};

		balances.forEach((_balance) => {
			this.balance[_balance.ticker] = _balance;
		});

		console.log('curr balance: ', this.balance);
	}
}

export default UpbitAccount;
