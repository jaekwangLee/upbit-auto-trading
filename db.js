/** @format */

import sqlite3 from 'sqlite3';

import {dConsole, dConsoleWarn, dConsoleError} from './utils/log.js';

class Database {
	static instance = null;

	constructor(path) {
		if (!Database.instance) {
			this.db = new sqlite3.Database(path, (err) => {
				if (err) {
					dConsoleError('Database connection error:', err.message);
				} else {
					dConsole('Connected to the database.');
					this.#initialize();
					Database.instance = this;
				}
			});
		}

		return Database.instance;
	}

	#initialize() {
		this.#createTradeTalbe().#createCoefficeintTable();
	}

	#createTradeTalbe() {
		try {
			this.db.run(`CREATE TABLE IF NOT EXISTS trade (
        tradeIdx INTEGER PRIMARY KEY,
        buyPrice INTEGER,
        sellPrice INTEGER,
        ticker TEXT,
        state INTEGER,
        isEarn INTEGER,
        buyTimestamp TEXT,
        sellTimestamp TEXT
      )`);
		} catch (error) {
			dConsoleError(`[Database] DB trade table create error : ${error}`);
		}

		return this;
	}

	#createCoefficeintTable() {
		try {
			this.db.run(`CREATE TABLE IF NOT EXISTS coefficient (
        coefficientIdx INTEGER PRIMARY KEY,
        weight INTEGER,
        weightRate INTEGER,
        earnCnt INTEGER,
        lossCnt INTEGER,
        timestamp TEXT
      )`);
		} catch (error) {
			dConsoleError(`[Database] DB coefficient table create error : ${error}`);
		}

		return this;
	}

	getDB() {
		return this.db;
	}
}

export default Database;
