/** @format */

import { ORDER_TYPE } from "../constant/trading.js";

const convertOrderTypeForDB = (type) => {
  return type === ORDER_TYPE ? 1 : 0;
};

export { convertOrderTypeForDB };
