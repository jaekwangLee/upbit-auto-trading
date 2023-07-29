import axios from "axios";

import { CONTENT_TYPE } from "../constant/network.js";

const upbitInstance = axios.create({
  baseURL: "https://api.upbit.com/v1",
  timeout: 30000,
});

const request = (instance, url, method, { params, data, headers = {} }) => {
  try {
    const headerConfig = {
      "Content-Type": headers["Content-Type"] || CONTENT_TYPE.APPLICATION_JSON,
    };

    if (headers["Authorization"]) {
      headerConfig["Authorization"] = headers["Authorization"];
    }

    return instance[method](url, {
      params: params ?? {},
      data: data ?? {},
      headers: headerConfig,
    });
  } catch (error) {
    console.warn(
      `[WARN] network request failed url: ${url}, message: ${error}`
    );
    return error;
  }
};

export { upbitInstance, request };
