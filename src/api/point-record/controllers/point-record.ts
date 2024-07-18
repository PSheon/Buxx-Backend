/**
 * point-record controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

const { NotFoundError } = utils.errors;

import type Koa from "koa";

export default factories.createCoreController(
  "api::point-record.point-record",
  ({ strapi }) => ({
    async findMe(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const enhancedFilters = Object.assign(sanitizedQuery.filters || {}, {
        user: ctx.state.user.id,
      });

      const { results, pagination } = await strapi
        .service("api::point-record.point-record")
        .find({ ...sanitizedQuery, filters: enhancedFilters });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },

    async findMeStatistics(ctx: Koa.Context) {
      const knex = strapi.db.connection;
      const mePath = ctx.state.user.referralPath;
      const meRank = ctx.state.user.referralRank;

      const referralEntities = await strapi.entityService.findMany(
        "api::referral.referral",
        {
          filters: {
            user: {
              id: ctx.state.user.id,
            },
          },
        }
      );
      if (referralEntities.length === 0) {
        throw new NotFoundError("You're not in the referral program.");
      }

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
            [meRank + 1, meRank + 2, meRank + 3]
          )
        )
        .whereLike("path", `${mePath}%`)
        .andWhere("rank", ">", meRank)
        .groupBy("rank_group")
        .sum({
          total_staked_value: "staked_value",
          total_claimed_rewards: "claimed_rewards",
        })
        .count({ total_members: "*" })
        .from("referrals");

      const meStatistics = meReferralStatistics.reduce(
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
          meStakedValue: referralEntities[0].stakedValue,
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

      ctx.send(meStatistics);
    },
  })
);
