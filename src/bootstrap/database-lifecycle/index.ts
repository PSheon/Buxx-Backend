/**
 * Database Lifecycle Bootstrap
 */

import { errors } from "@strapi/utils";

/* Errors types */
const { ApplicationError } = errors;

export const databaseLifecycleBootstrap = (strapi) => {
  strapi.db.lifecycles.subscribe({
    models: ["plugin::users-permissions.user"],

    async afterCreate(event) {
      const { result } = event;

      const user = result;

      // ** Create Notification entity
      try {
        await strapi
          .service("api::notification.notification")
          .createWelcomeNotification({
            notifier: user,
          });
      } catch (error) {
        throw new ApplicationError(
          `Create notification failed. [${error.message}]`
        );
      }
    },
  });
};
