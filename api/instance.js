/** @format */

import axios from "axios";
import request from "request";

import { CONTENT_TYPE, REST_API_METHOD } from "../constant/network.js";

const BASE_UPBIT_URL = "https://api.upbit.com/v1";

const upbitInstance = axios.create({
  baseURL: "https://api.upbit.com/v1",
  timeout: 30000,
});

const requestAPI = (
  instance,
  url,
  method,
  { params = {}, data = {}, headers = {} }
) => {
  try {
    const headerConfig = {
      "Content-Type": headers["Content-Type"] || CONTENT_TYPE.APPLICATION_JSON,
      Authorization: headers.Authorization ?? "",
    };

    if (method === REST_API_METHOD.GET) {
      return instance[method](url, { params, headers: headerConfig });
    } else {
      return instance[method](url, JSON.stringify(data), {
        headers: headerConfig,
      });
    }
  } catch (error) {
    console.warn(
      `[WARN] network request failed url: ${url}, message: ${error}`
    );
    return error;
  }
};

const upbitRequest = (url, method, { params, data, headers = {} }) => {
  try {
    const headerConfig = {
      "Content-Type": headers["Content-Type"] || CONTENT_TYPE.APPLICATION_JSON,
      Authorization: headers.Authorization ?? "",
    };

    const options = {
      method,
      url: `${BASE_UPBIT_URL}${url}`,
      headers: headerConfig,
    };

    if (method === REST_API_METHOD.GET && params) {
      options.qs = params;
    } else if (method !== REST_API_METHOD.GET && data) {
      options.json = data;
    }

    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("[RES] ", res);

        resolve(body);
      });
    });
  } catch (error) {
    console.warn(
      `[WARN] network request failed url: ${url}, message: ${error}`
    );
    return error;
  }
};

export { upbitInstance, requestAPI, upbitRequest };
