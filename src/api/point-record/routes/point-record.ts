/**
 * point-record router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter(
  "api::point-record.point-record"
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
    path: "/point-records/me",
    handler: "point-record.findMe",
  },
  {
    method: "GET",
    path: "/point-records/me/statistics",
    handler: "point-record.findMeStatistics",
  },
];

export default customRouter(defaultRouter, customRoutes);
