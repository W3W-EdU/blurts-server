"use strict";

const got = require("got");

const AppConstants = require("./app-constants");


const Basket = {

  async subscribe(email) {
    const params = {
      email,
      newsletters: AppConstants.BASKET_NEWSLETTER,
      validated: true,
      "api-key": AppConstants.BASKET_API_KEY,
      source_url: "monitor.firefox.com",
    };
    const postParams = Object.keys(params).map(k=>[k,params[k]].join("=")).join("&");
    const url = `${AppConstants.BASKET_URL}/news/subscribe/`;
    const reqOptions = {
      method: "POST",
      body: postParams,
    };
    await got(url, reqOptions);
  },

};

module.exports = Basket;
