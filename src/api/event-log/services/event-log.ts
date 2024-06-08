/**
 * event-log service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::event-log.event-log",
  ({ strapi }) => ({})
);
