/**
 * notification router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter(
  "api::notification.notification"
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
    path: "/notifications/me/:id",
    handler: "notification.findMeOne",
  },
  {
    method: "GET",
    path: "/notifications/me",
    handler: "notification.findMe",
  },
  {
    method: "PUT",
    path: "/notifications/me/:id",
    handler: "notification.updateMeOne",
  },
];

export default customRouter(defaultRouter, customRoutes);
