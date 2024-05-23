/**
 * fund router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::fund.fund");

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
    path: "/funds/sign-hash/:id",
    handler: "fund.signHash",
  },
];

export default customRouter(defaultRouter, customRoutes);
