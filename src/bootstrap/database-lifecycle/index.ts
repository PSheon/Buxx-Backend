/**
 * Database Lifecycle Bootstrap
 */

import { errors } from "@strapi/utils";

/* Errors types */
const { ApplicationError } = errors;

export const databaseLifecycleBootstrap = (strapi) => {
  // ** Generate referralId
  const generateReferralId = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  strapi.db.lifecycles.subscribe({
    models: ["plugin::users-permissions.user"],

    async beforeCreate(event) {
      const { params } = event;

      params.data.referralId = generateReferralId();
    },
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
