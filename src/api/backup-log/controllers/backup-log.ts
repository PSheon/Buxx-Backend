/**
 * backup-log controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::backup-log.backup-log",
  ({ strapi }) => ({})
);
