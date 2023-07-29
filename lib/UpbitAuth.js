import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import qs from "querystring";

import { encrypt } from "./Crypto.js";

class UpbitAuth {
  static instance = null;

  static getInstance() {
    if (!UpbitAuth.instance) {
      UpbitAuth.instance = new UpbitAuth();
    }

    return UpbitAuth.instance;
  }

  getAuthToken(query) {
    try {
      const payload = {
        access_key: process.env.UPBIT_ACCESS_KEY,
        nonce: uuidv4(),
      };

      if (query) {
        const querystring = qs.queryEncode({ ...query });

        payload["query_hash"] = encrypt(querystring);
        payload["query_hash_alg"] = "SHA512";
      }

      const jwtToken = jwt.sign(payload, process.env.UPBIT_SECRET_KEY);
      const authorizationToken = `Bearer ${jwtToken}`;

      return authorizationToken;
    } catch (error) {
      console.warn(`[WARN] get upbit auth token failed, error: ${error}`);
      return error;
    }
  }
}

export default UpbitAuth;
