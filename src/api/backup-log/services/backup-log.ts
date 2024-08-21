/**
 * backup-log service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::backup-log.backup-log",
  ({ strapi }) => ({})
);
