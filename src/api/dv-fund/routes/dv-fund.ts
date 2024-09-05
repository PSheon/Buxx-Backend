/**
 * dv-fund router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::dv-fund.dv-fund");

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
    method: "POST",
    path: "/dv-fund/deposit-sign-hash/:packageId",
    handler: "dv-fund.depositSignHash",
  },
  {
    method: "POST",
    path: "/dv-fund/claim-sign-hash",
    handler: "dv-fund.claimSignHash",
  },
];

export default customRouter(defaultRouter, customRoutes);
