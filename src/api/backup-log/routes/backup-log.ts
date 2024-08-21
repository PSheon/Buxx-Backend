/**
 * backup-log router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::backup-log.backup-log");

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

const customRoutes = [];

export default customRouter(defaultRouter, customRoutes);
