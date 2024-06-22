/**
 * daily-check-record router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter(
  "api::daily-check-record.daily-check-record"
);

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
    path: "/daily-check-records/me",
    handler: "daily-check-record.findMe",
  },
  {
    method: "POST",
    path: "/daily-check-records/check",
    handler: "daily-check-record.check",
  },
];

export default customRouter(defaultRouter, customRoutes);
