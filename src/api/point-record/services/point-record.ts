/**
 * point-record service
 */

import { factories } from "@strapi/strapi";

import { ILogPointRecordType } from "../types/pointRecordTypes";

export default factories.createCoreService(
  "api::point-record.point-record",
  ({ strapi }) => ({
    async logPointRecord(params: ILogPointRecordType) {
      const { type, user, earningExp, earningPoints, receipt } = params;

      await strapi.entityService.create("api::point-record.point-record", {
        data: {
          type,
          user: user.id,
          earningExp,
          earningPoints,
          receipt,
        },
      });

      return strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            exp: user.exp + earningExp,
            points: user.points + earningPoints,
          },
        }
      );
    },
  })
);
