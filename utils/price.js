import { COIN_PRICE_CHANGE_DIRECTION } from "../constant/trading";

const convertChangePriceDirectionUnit = (unit) => {
  switch (unit) {
    case "RISE":
      return COIN_PRICE_CHANGE_DIRECTION.UP;
    case "FALL":
      return COIN_PRICE_CHANGE_DIRECTION.DOWN;
    case "EVEN":
    default:
      return COIN_PRICE_CHANGE_DIRECTION.EVEN;
  }
};

export { convertChangePriceDirectionUnit };
