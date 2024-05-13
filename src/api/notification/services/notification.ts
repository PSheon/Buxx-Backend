/**
 * notification service
 */

import { factories } from "@strapi/strapi";

import { getWelcomeNotificationContent } from "../utils/notification";

export default factories.createCoreService(
  "api::notification.notification",
  ({ strapi }) => ({
    async createWelcomeNotification(params) {
      const { notifier } = params;

      await strapi.entityService.create("api::notification.notification", {
        data: {
          notifier: notifier.id,
          category: "System",
          title: `Welcome ${notifier.username}!`,
          content: getWelcomeNotificationContent({ notifier }),
          date: new Date(),
        },
      });
    },
  })
);
