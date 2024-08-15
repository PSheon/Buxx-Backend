/**
 * earning-record service
 */

import { factories } from "@strapi/strapi";

import { ILogEarningRecordType } from "../types/earningRecordTypes";

export default factories.createCoreService(
  "api::earning-record.earning-record",
  ({ strapi }) => ({
    async logEarningRecord(params: ILogEarningRecordType) {
      const { type, user, earningExp, earningPoints, receipt } = params;

      await strapi.entityService.create("api::earning-record.earning-record", {
        data: {
          type,
          user: user.id,
          earningExp,
          earningPoints,
          receipt,
        },
      });

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            exp: user.exp + earningExp,
            points: user.points + earningPoints,
          },
        }
      );

      return;
    },
  })
);
