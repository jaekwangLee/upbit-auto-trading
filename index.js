import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { runAutoTradingSystem } from "./macro.js";

class App {
  constructor() {
    this.app = express();
  }

  #appServerListener() {
    console.log(
      `server is listening on port ${process.env.PORT}, for api. No releated trading macro`
    );
  }

  run() {
    this.app.listen(process.env.PORT, this.#appServerListener);
  }
}

const app = new App();
app.run();

runAutoTradingSystem();
