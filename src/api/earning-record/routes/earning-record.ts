/**
 * earning-record router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter(
  "api::earning-record.earning-record"
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
    path: "/earning-records/me",
    handler: "earning-record.findMe",
  },
  {
    method: "GET",
    path: "/earning-records/me/statistics",
    handler: "earning-record.findMeStatistics",
  },
];

export default customRouter(defaultRouter, customRoutes);
