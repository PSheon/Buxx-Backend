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

    async findMeStatistics(ctx: Koa.Context) {
      const meTotalReferrals = await strapi.entityService.count(
        "api::referral.referral",
        {
          filters: {
            referrer: ctx.state.user.id,
            isActive: true,
          },
        }
      );

      const meTotalCompletedTasks = await strapi.entityService.count(
        "api::point-record.point-record",
        {
          filters: {
            user: ctx.state.user.id,
            type: "CompleteTask",
          },
        }
      );

      ctx.send({
        totalReferrals: meTotalReferrals,
        totalCompletedTasks: meTotalCompletedTasks,
      });
    },
  })
);
