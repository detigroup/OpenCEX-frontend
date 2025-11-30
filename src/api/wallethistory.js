import { app } from "../main";

export const WalletHistory = {
  list(limit, offset, filter = {}) {
    let filter_params = new URLSearchParams(filter).toString();
    const resp = app.config.globalProperties.$http
      .get(
        "wallet-history?limit=" +
          limit +
          "&offset=" +
          offset +
          "&" +
          filter_params
      )
      .then((promise) => {
        return promise;
      });
    return resp;
  },
};
