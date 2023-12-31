/** @format */

const CURRENCY = Object.freeze({
  KRW: "KRW",
});

const ORDER_BOOK_TICK = Object.freeze({
  UNTIL_TEN: 10,
  UNTIL_HUNDRED: 100,
  UNTIL_THOUSAND: 1000,
  UNTIL_TEN_THOUSAND: 10000,
  UNTIL_HUNDRED_THOUSAND: 100000,
  UNTIL_FIFTY_THOUSAND: 500000,
  UNTIL_MILLION: 1000000,
  UNTIL_TWO_MILLION: 2000000,
  FROM_TWO_MILIION: 2000000,
});

const ORDER_PRICE_RULE = Object.freeze({
  MIN: 5000,
  MAX: 1000000000,
});

export { ORDER_BOOK_TICK, ORDER_PRICE_RULE };
export default CURRENCY;
