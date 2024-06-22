/**
 * referral router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::referral.referral");

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
    path: "/referrals/me",
    handler: "referral.findMe",
  },
  {
    method: "POST",
    path: "/referrals/join",
    handler: "referral.join",
  },
];

export default customRouter(defaultRouter, customRoutes);
