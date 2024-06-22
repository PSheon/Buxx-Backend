/**
 * referral service
 */

import { factories } from "@strapi/strapi";

import { ILogReferralType } from "../types/referralTypes";

export default factories.createCoreService(
  "api::referral.referral",
  ({ strapi }) => ({
    async logReferral(params: ILogReferralType) {
      const { referrer, referredId } = params;

      await strapi.entityService.create("api::point-record.point-record", {
        data: {
          type: "Referral",
          user: referrer.id,
          earningPoints: 300,
          receipt: {
            referrerId: referrer.id,
            referredId,
            points: 300,
          },
        },
      });

      return strapi.entityService.update(
        "plugin::users-permissions.user",
        referrer.id,
        {
          data: {
            points: referrer.points + 300,
          },
        }
      );
    },
  })
);
