import { REST_API_METHOD } from "../../constant/network.js";

import { upbitInstance, request } from "../instance.js";

const fetchCurrentTicker = (_markets = []) => {
  return request(upbitInstance, "/ticker", REST_API_METHOD.GET, {
    params: {
      markets: _markets,
    },
  });
};

export { fetchCurrentTicker };
