/**
 * referral service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::referral.referral",
  ({ strapi }) => ({
    async getUserReferralStatistics({ basePath, baseRank }) {
      const knex = strapi.db.connection;

      const userReferralStatistics = await knex
        .select(
          knex.raw(
            `
              CASE
                WHEN rank = ? THEN 'rank_me'
                WHEN rank = ? THEN 'rank_down_line_1'
                WHEN rank = ? THEN 'rank_down_line_2'
                WHEN rank = ? THEN 'rank_down_line_3'
                ELSE 'rank_team'
              END AS rank_group
            `,
            [baseRank, baseRank + 1, baseRank + 2, baseRank + 3]
          )
        )
        .whereLike("path", `${basePath}%`)
        .andWhere("rank", ">=", baseRank)
        .groupBy("rank_group")
        .sum({
          total_staked_value: "staked_value",
        })
        .count({
          total_members: "*",
        })
        .from("referrals");

      const referralStatistics = userReferralStatistics.reduce(
        (acc, curr) => {
          if (curr.rank_group === "rank_me") {
            return {
              ...acc,
              meStakedValue: curr.total_staked_value,
            };
          } else if (curr.rank_group === "rank_down_line_1") {
            return {
              ...acc,
              rankDownLine1: {
                totalStakedValue: curr.total_staked_value,
                totalMembers: curr.total_members,
              },
            };
          } else if (curr.rank_group === "rank_down_line_2") {
            return {
              ...acc,
              rankDownLine2: {
                totalStakedValue: curr.total_staked_value,
                totalMembers: curr.total_members,
              },
            };
          } else if (curr.rank_group === "rank_down_line_3") {
            return {
              ...acc,
              rankDownLine3: {
                totalStakedValue: curr.total_staked_value,
                totalMembers: curr.total_members,
              },
            };
          } else if (curr.rank_group === "rank_team") {
            return {
              ...acc,
              rankTeams: {
                totalStakedValue: curr.total_staked_value,
                totalMembers: curr.total_members,
              },
            };
          } else {
            return acc;
          }
        },
        {
          meStakedValue: 0,
          rankDownLine1: {
            totalStakedValue: 0,
            totalMembers: 0,
          },
          rankDownLine2: {
            totalStakedValue: 0,
            totalMembers: 0,
          },
          rankDownLine3: {
            totalStakedValue: 0,
            totalMembers: 0,
          },
          rankTeams: {
            totalStakedValue: 0,
            totalMembers: 0,
          },
        }
      );

      return referralStatistics;
    },
  })
);
