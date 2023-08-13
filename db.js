/** @format */

import sqlite3 from "sqlite3";

class Database {
  static instance = null;

  constructor(path) {
    if (!Database.instance) {
      this.db = new sqlite3.Database(path, (err) => {
        if (err) {
          console.error("Database connection error:", err.message);
        } else {
          console.log("Connected to the database.");
          this.#initialize();
        }
      });
    }

    return Database.instance;
  }

  #initialize() {
    this.#useForeignKey()
      .#createUserTable()
      .#createTradeTable()
      .#createBidTable()
      .#createAsktable()
      .#createBalanceTable();
  }

  #useForeignKey() {
    try {
      this.db.run("PRAGMA foreign_keys = ON");
    } catch (error) {
      console.warn(`[WARN] DB table run - foreignkey: `, error);
    }

    return this;
  }

  #createUserTable() {
    try {
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
                  userIdx INTEGER PRIMARY KEY,
                  id TEXT NOT NULL,

                  registered_at TEXT
                )`);
    } catch (error) {
      console.warn(`[WARN] DB table run - user: `, error);
    }

    return this;
  }

  #createTradeTable() {
    try {
      this.db.run(`CREATE TABLE IF NOT EXISTS trades (
                  tradeIdx INTEGER PRIMARY KEY,
                  userIdx INTEGER,
                  bidIdx INTEGER DEFAULT 0,
                  askIdx INTEGER DEFAULT 0,
                  type INTEGER CHECK (type IN (0, 1)),

                  FOREIGN KEY (userIdx) REFERENCES users(userIdx),
                  FOREIGN KEY (bidIdx) REFERENCES bids(bidIdx),
                  FOREIGN KEY (askIdx) REFERENCES asks(askIdx)
                )`);
    } catch (error) {
      console.warn(`[WARN] DB table run - trade: `, error);
    }

    return this;
  }

  #createBidTable() {
    try {
      this.db.run(`CREATE TABLE IF NOT EXISTS bids (
              bidIdx INTEGER PRIMARY KEY,
              uuid TEXT NOT NULL,
              ticker TEXT NOT NULL,
              price NUMERIC NOT NULL DEFAULT 0,
              volume NUMERIC NOT NULL DEFAULT 0,
              timestamp TEXT
          )`);
    } catch (error) {
      console.warn(`[WARN] DB table run - bids`, error);
    }

    return this;
  }

  #createAsktable() {
    try {
      this.db.run(`CREATE TABLE IF NOT EXISTS asks (
                  askIdx INTEGER PRIMARY KEY,
                  uuid TEXT NOT NULL,
                  ticker TEXT NOT NULL,
                  price NUMERIC NOT NULL DEFAULT 0,
                  volume NUMERIC NOT NULL DEFAULT 0,
                  timestamp TEXT
              )`);
    } catch (error) {
      console.warn(`[WARN] DB table run - asks`, error);
    }

    return this;
  }

  #createBalanceTable() {
    try {
      this.db.run(`CREATE TABLE IF NOT EXISTS balances (
                  userIdx INTEGER,
                  ticker TEXT,
                  price INTEGER DEFAULT 0,
                  volume INTEGER DEFAULT 0,
                  timestamp TEXT,

                  PRIMARY KEY (userIdx, ticker),
                  FOREIGN KEY (userIdx) REFERENCES users(userIdx)
              )`);
    } catch (error) {
      console.warn(`[WARN] DB table run - balances`, error);
    }

    return this;
  }

  getDB() {
    return this.db;
  }
}

export default Database;
