/** @format */

import { REST_API_METHOD } from "../../constant/network.js";

import { upbitInstance, requestAPI } from "../instance.js";
import UpbitAuth from "../../lib/UpbitAuth.js";

const fetchAllAccount = () => {
  return requestAPI(upbitInstance, "/accounts", REST_API_METHOD.GET, {
    headers: {
      Authorization: UpbitAuth.getInstance().getAuthToken(),
    },
  });
};

export { fetchAllAccount };
