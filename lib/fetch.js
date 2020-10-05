'use strict';

import * as got from 'got';

export default async function fetch(url, options = {}) {
  const userAgent =
    options.agent ||
    "Mozilla/5.0 (Windows NT 5.1; rv:33.0) Gecko/20100101 Firefox/33.0";
  return new Promise(async (resolve, reject) => {
    const redirects = [];
    let res = {};
    try {
      const response = await got(url, {
        rejectUnauthorized: false,
        strictSSL: false,
        timeout: {
          socket: 5000,
          connect: 7500,
          request: 10000
        },
        headers: {
          "user-agent": userAgent
        }
      }).on("redirect", (response, nextOptions) => {
        if (nextOptions.host.length == 0) {
          return resolve({
            url: response.url,
            status: 500,
            headers: response.headers,
            content: null
          });
        }
      });

      res = response || res;
    } catch (error) {
      res = {
        requestUrl: error.url || url,
        statusCode: error.code || error.statusCode || "ECONNREFUSED",
        headers: error.headers || {},
        url: error.url || url,
        body: null
      };
    }

    resolve({
      url: res.requestUrl,
      status: res.statusCode,
      headers: res.headers,
      content: res.body
    });
  });
};
