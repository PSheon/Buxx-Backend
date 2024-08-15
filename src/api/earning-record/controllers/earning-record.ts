/**
 * earning-record controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

const { NotFoundError } = utils.errors;

import type Koa from "koa";

export default factories.createCoreController(
  "api::earning-record.earning-record",
  ({ strapi }) => ({
    async findMe(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const enhancedFilters = Object.assign(sanitizedQuery.filters || {}, {
        user: ctx.state.user.id,
      });

      const { results, pagination } = await strapi
        .service("api::earning-record.earning-record")
        .find({ ...sanitizedQuery, filters: enhancedFilters });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },

    async findMeStatistics(ctx: Koa.Context) {
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

      const meReferralStatistics = await strapi
        .service("api::referral.referral")
        .getUserReferralStatistics({
          basePath: mePath,
          baseRank: meRank,
        });

      ctx.send(meReferralStatistics);
    },
  })
);
