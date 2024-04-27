/**
 * activity-log service
 */

import { factories } from "@strapi/strapi";

import { ILogActivityType } from "../types/activityLogTypes";

export default factories.createCoreService(
  "api::activity-log.activity-log",
  ({ strapi }) => ({
    async logActivity(params: ILogActivityType) {
      const {
        status,
        action,
        refContentType,
        refId,
        message,
        payload,
        user,
        isHighlighted = false,
      } = params;

      await strapi.entityService.create("api::activity-log.activity-log", {
        data: {
          status,
          action,
          refContentType,
          refId,
          message,
          payload,
          date: new Date(),
          user: user.id,
          isHighlighted,
        },
      });
    },
  })
);
