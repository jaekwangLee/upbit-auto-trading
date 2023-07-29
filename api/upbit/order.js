import { REST_API_METHOD } from "../../constant/network.js";

import { upbitInstance, request } from "../instance.js";

const fetchCurrentTicker = (_market) => {
  return request(upbitInstance, "/ticker", REST_API_METHOD.GET, {
    params: {
      markets: _market,
    },
  });
};

export { fetchCurrentTicker };
