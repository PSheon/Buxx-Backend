/**
 * Clear Task Log
 */

import { Strapi } from "@strapi/strapi";

import subDays from "date-fns/subDays";

export const clearTaskLogTask = async ({ strapi }: { strapi: Strapi }) => {
  const { count } = await strapi.db.query("api::task-log.task-log").deleteMany({
    where: {
      action: {
        $in: ["SyncEventLog", "ClearTaskLog"],
      },
      trigger: "CronJob",
      status: "Fulfilled",
      createdAt: {
        $lte: subDays(new Date(), 3).toISOString(),
      },
    },
  });

  await strapi.entityService.create("api::task-log.task-log", {
    data: {
      action: "ClearTaskLog",
      trigger: "CronJob",
      message: "Clear task log success",
      detail: {
        deleteCount: count,
      },
      status: "Fulfilled",
    },
  });
};
