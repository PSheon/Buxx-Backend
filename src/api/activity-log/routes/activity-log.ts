/**
 * activity-log router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter(
  "api::activity-log.activity-log"
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
    path: "/activity-logs/me",
    handler: "activity-log.findMe",
  },
];

export default customRouter(defaultRouter, customRoutes);
