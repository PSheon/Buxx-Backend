/**
 * wallet router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::wallet.wallet");

const customRouter = (defaultRouter, customRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return defaultRouter.prefix;
    },
    get routes() {
      if (!routes) routes = customRoutes.concat(defaultRouter.routes);
      return routes;
    },
  };
};

const customRoutes = [
  {
    method: "GET",
    path: "/wallets/me",
    handler: "wallet.findMe",
  },
  {
    method: "GET",
    path: "/wallets/nonce",
    handler: "wallet.getNonce",
  },
  {
    method: "POST",
    path: "/wallets/verify",
    handler: "wallet.verifyWallet",
  },
];

export default customRouter(defaultRouter, customRoutes);
