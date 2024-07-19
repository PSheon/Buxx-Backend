/**
 * daily-check-record service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::daily-check-record.daily-check-record",
  ({ strapi }) => ({
    async updateUserReferralLevel(userId: number) {
      const knex = strapi.db.connection;
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

      const meReferralStatistics = await knex
        .select(
          knex.raw(
            `
            CASE
              WHEN rank = ? THEN 'rank_down_line_1'
              WHEN rank = ? THEN 'rank_down_line_2'
              WHEN rank = ? THEN 'rank_down_line_3'
              ELSE 'rank_team'
            END AS rank_group
            `,
            [userRank + 1, userRank + 2, userRank + 3]
          )
        )
        .whereLike("path", `${userPath}%`)
        .andWhere("rank", ">", userRank)
        .groupBy("rank_group")
        .sum({
          total_staked_value: "staked_value",
          total_claimed_rewards: "claimed_rewards",
        })
        .count({ total_members: "*" })
        .from("referrals");

      const userStatistics = meReferralStatistics.reduce(
        (acc, curr) => {
          if (curr.rank_group === "rank_down_line_1") {
            return {
              ...acc,
              rankDownLine1: {
                totalStakedValue: curr.total_staked_value,
                totalClaimedRewards: curr.total_claimed_rewards,
                totalMembers: curr.total_members,
              },
            };
          } else if (curr.rank_group === "rank_down_line_2") {
            return {
              ...acc,
              rankDownLine2: {
                totalStakedValue: curr.total_staked_value,
                totalClaimedRewards: curr.total_claimed_rewards,
                totalMembers: curr.total_members,
              },
            };
          } else if (curr.rank_group === "rank_down_line_3") {
            return {
              ...acc,
              rankDownLine3: {
                totalStakedValue: curr.total_staked_value,
                totalClaimedRewards: curr.total_claimed_rewards,
                totalMembers: curr.total_members,
              },
            };
          } else if (curr.rank_group === "rank_team") {
            return {
              ...acc,
              rankTeams: {
                totalStakedValue: curr.total_staked_value,
                totalClaimedRewards: curr.total_claimed_rewards,
                totalMembers: curr.total_members,
              },
            };
          } else {
            return acc;
          }
        },
        {
          meStakedValue: userReferral.stakedValue,
          rankDownLine1: {
            totalStakedValue: 0,
            totalClaimedRewards: 0,
            totalMembers: 0,
          },
          rankDownLine2: {
            totalStakedValue: 0,
            totalClaimedRewards: 0,
            totalMembers: 0,
          },
          rankDownLine3: {
            totalStakedValue: 0,
            totalClaimedRewards: 0,
            totalMembers: 0,
          },
          rankTeams: {
            totalStakedValue: 0,
            totalClaimedRewards: 0,
            totalMembers: 0,
          },
        }
      );

      if (
        userDataEntity.exp > 8_000 &&
        userStatistics.rankDownLine1.totalMembers >= 12 &&
        userStatistics.meStakedValue >= 6_000 &&
        userStatistics.rankDownLine1.totalStakedValue >= 25_000 &&
        userStatistics.rankTeams.totalStakedValue >= 1_000_000 &&
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
            userId: userDataEntity.id,
            level: 9,
            exp: 0,
            points: 0,
          },
        });
      } else if (
        userDataEntity.exp > 5_000 &&
        userStatistics.rankDownLine1.totalMembers >= 8 &&
        userStatistics.meStakedValue >= 4_000 &&
        userStatistics.rankDownLine1.totalStakedValue >= 15_000 &&
        userStatistics.rankTeams.totalStakedValue >= 350_000 &&
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
            userId: userDataEntity.id,
            level: 8,
            exp: 0,
            points: 0,
          },
        });
      } else if (
        userDataEntity.exp > 3_500 &&
        userStatistics.rankDownLine1.totalMembers >= 5 &&
        userStatistics.meStakedValue >= 2_500 &&
        userStatistics.rankDownLine1.totalStakedValue >= 9_000 &&
        userStatistics.rankTeams.totalStakedValue >= 100_000 &&
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
            userId: userDataEntity.id,
            level: 7,
            exp: 0,
            points: 0,
          },
        });
      } else if (
        userDataEntity.exp > 2_500 &&
        userStatistics.rankDownLine1.totalMembers >= 3 &&
        userStatistics.meStakedValue >= 1_500 &&
        userStatistics.rankDownLine1.totalStakedValue >= 3_000 &&
        userStatistics.rankTeams.totalStakedValue >= 30_000 &&
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
            userId: userDataEntity.id,
            level: 6,
            exp: 0,
            points: 0,
          },
        });
      } else if (
        userDataEntity.exp > 1_800 &&
        userStatistics.rankDownLine1.totalMembers >= 2 &&
        userStatistics.meStakedValue >= 1_000 &&
        userStatistics.rankDownLine1.totalStakedValue >= 500 &&
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
            userId: userDataEntity.id,
            level: 5,
            exp: 0,
            points: 0,
          },
        });
      } else if (
        userDataEntity.exp > 1_250 &&
        userStatistics.rankDownLine1.totalMembers >= 1 &&
        userStatistics.meStakedValue >= 500 &&
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
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

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "ReferralLevelUp",
          user: userDataEntity,
          earningExp: 0,
          earningPoints: 0,
          receipt: {
            task: "Referral Level Up",
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
