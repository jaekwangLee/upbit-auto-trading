/** @format */

import axios from "axios";
import request from "request";

import { CONTENT_TYPE, REST_API_METHOD } from "../constant/network.js";

import { dConsole, dConsoleWarn } from "../utils/log.js";

const BASE_UPBIT_URL = "https://api.upbit.com/v1";

const upbitInstance = axios.create({
  baseURL: BASE_UPBIT_URL,
  timeout: 30000,
});

const BASE_NASDAQ_URL = "https://api.nasdaq.com/api";

const nasdaqInstance = axios.create({
  baseURL: BASE_NASDAQ_URL,
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
    };

    if (headers.Authorization) {
      headerConfig['Authorization'] = headers.Authorization;
    }

    if (method === REST_API_METHOD.GET) {
      return instance[method](url, { params, headers: headerConfig });
    } else {
      return instance[method](url, JSON.stringify(data), {
        headers: headerConfig,
      });
    }
  } catch (error) {
    dConsole(`network request failed url: ${url}, message: ${error}`);
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

        dConsole('[ORDER REQUEST RESULT]: ', res.body)

        resolve(res.body);
      });
    });
  } catch (error) {
    dConsoleWarn(`network request failed url: ${url}, message: ${error}`);
    return error;
  }
};

export { upbitInstance, nasdaqInstance, requestAPI, upbitRequest };
