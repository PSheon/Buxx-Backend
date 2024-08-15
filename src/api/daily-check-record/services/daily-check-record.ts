/**
 * daily-check-record service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::daily-check-record.daily-check-record",
  ({ strapi }) => ({
    async updateUserReferralLevel(userId: number) {
      const userDataEntity = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId
      );
      const userReferralEntities = await strapi.entityService.findMany(
        "api::referral.referral",
        {
          filters: {
            user: {
              id: userId,
            },
          },
        }
      );
      if (userReferralEntities.length === 0) {
        return;
      }

      const userReferral = userReferralEntities[0];
      const userPath = userReferral.path;
      const userRank = userReferral.rank;
      const currentLevel = userReferral.level;

      const meReferralStatistics = await strapi
        .service("api::referral.referral")
        .getUserReferralStatistics({
          basePath: userPath,
          baseRank: userRank,
        });

      if (
        userDataEntity.exp > 8_000 &&
        meReferralStatistics.rankDownLine1.totalMembers >= 12 &&
        meReferralStatistics.meStakedValue >= 6_000 &&
        meReferralStatistics.rankDownLine1.totalStakedValue >= 25_000 &&
        meReferralStatistics.rankTeams.totalStakedValue >= 1_000_000 &&
        currentLevel !== 9
      ) {
        /* Check has reached level 9 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 9,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 9,
              exp: 0,
              points: 0,
            },
          });
      } else if (
        userDataEntity.exp > 5_000 &&
        meReferralStatistics.rankDownLine1.totalMembers >= 8 &&
        meReferralStatistics.meStakedValue >= 4_000 &&
        meReferralStatistics.rankDownLine1.totalStakedValue >= 15_000 &&
        meReferralStatistics.rankTeams.totalStakedValue >= 350_000 &&
        currentLevel !== 8
      ) {
        /* Check has reached level 8 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 8,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 8,
              exp: 0,
              points: 0,
            },
          });
      } else if (
        userDataEntity.exp > 3_500 &&
        meReferralStatistics.rankDownLine1.totalMembers >= 5 &&
        meReferralStatistics.meStakedValue >= 2_500 &&
        meReferralStatistics.rankDownLine1.totalStakedValue >= 9_000 &&
        meReferralStatistics.rankTeams.totalStakedValue >= 100_000 &&
        currentLevel !== 7
      ) {
        /* Check has reached level 7 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 7,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 7,
              exp: 0,
              points: 0,
            },
          });
      } else if (
        userDataEntity.exp > 2_500 &&
        meReferralStatistics.rankDownLine1.totalMembers >= 3 &&
        meReferralStatistics.meStakedValue >= 1_500 &&
        meReferralStatistics.rankDownLine1.totalStakedValue >= 3_000 &&
        meReferralStatistics.rankTeams.totalStakedValue >= 30_000 &&
        currentLevel !== 6
      ) {
        /* Check has reached level 6 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 6,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 6,
              exp: 0,
              points: 0,
            },
          });
      } else if (
        userDataEntity.exp > 1_800 &&
        meReferralStatistics.rankDownLine1.totalMembers >= 2 &&
        meReferralStatistics.meStakedValue >= 1_000 &&
        meReferralStatistics.rankDownLine1.totalStakedValue >= 500 &&
        currentLevel !== 5
      ) {
        /* Check has reached level 5 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 5,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 5,
              exp: 0,
              points: 0,
            },
          });
      } else if (
        userDataEntity.exp > 1_250 &&
        meReferralStatistics.rankDownLine1.totalMembers >= 1 &&
        meReferralStatistics.meStakedValue >= 500 &&
        currentLevel !== 4
      ) {
        /* Check has reached level 4 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 4,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 4,
              exp: 0,
              points: 0,
            },
          });
      } else if (userDataEntity.exp > 750 && currentLevel !== 3) {
        /* Check has reached level 3 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 3,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 3,
              exp: 0,
              points: 0,
            },
          });
      } else if (userDataEntity.exp > 300 && currentLevel !== 2) {
        /* Check has reached level 2 */
        await strapi.entityService.update(
          "api::referral.referral",
          userReferral.id,
          {
            data: {
              level: 2,
            },
          }
        );

        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "ReferralLevelUp",
            user: userDataEntity,
            earningExp: 0,
            earningPoints: 0,
            receipt: {
              type: "Referral Level Up",
              userId: userDataEntity.id,
              level: 2,
              exp: 0,
              points: 0,
            },
          });
      }
    },
  })
);
