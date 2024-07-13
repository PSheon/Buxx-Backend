/**
 * point-record controller
 */

import { factories } from "@strapi/strapi";

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

    /* NOTE: Fill function here,  */
    async findMeStatistics(ctx: Koa.Context) {
      const meDirectReferrals = await strapi.entityService.count(
        "api::referral.referral",
        {
          filters: {
            referrer: ctx.state.user.id,
            isActive: true,
          },
        }
      );

      const meTotalReferrals = await strapi.entityService.count(
        "api::referral.referral",
        {
          filters: {
            level: {
              $gt: ctx.state.user.referralLevel,
            },
            path: {
              $containsi: `_${ctx.state.user.id}_`,
            },
            isActive: true,
          },
        }
      );

      /* TODO: Staking statistics */
      /* TODO: Direct Referral Staking statistics */
      /* TODO: Second Generation Referral Staking statistics */

      ctx.send({
        directReferrals: meDirectReferrals,
        totalReferrals: meTotalReferrals,
      });
    },
  })
);
