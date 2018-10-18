"use strict";
const got = require("got");

module.exports = async function fetch(url, options = {}) {
  const userAgent = options.agent || "Mozilla/5 (compatible; ArcaneRobot/1.0)";
  return new Promise(async (resolve, reject) => {
    const redirects = [];
    let res = {};
    try {
      const response = await got(url, {
        timeout: {
          socket: 75000,
          connect: 12500,
          request: 17500
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
          throw Error(url);
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
