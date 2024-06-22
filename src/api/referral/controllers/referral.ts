/**
 * referral controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { validateJoinReferralBody } from "./validation/referral";

import type Koa from "koa";

const { ApplicationError, NotFoundError } = utils.errors;

export default factories.createCoreController(
  "api::referral.referral",
  ({ strapi }) => ({
    async findMe(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const enhancedFilters = Object.assign(sanitizedQuery.filters || {}, {
        user: ctx.state.user.id,
      });

      const { results, pagination } = await strapi
        .service("api::referral.referral")
        .find({ ...sanitizedQuery, filters: enhancedFilters });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },
    async join(ctx: Koa.Context) {
      const { referralId } = ctx.request.body;

      await validateJoinReferralBody(ctx.request.body);

      const referrerEntities = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: { referralId },
        }
      );
      if (!referrerEntities.length) {
        throw new NotFoundError("Referral not found");
      } else if (referrerEntities[0].id === ctx.state.user.id) {
        throw new NotFoundError("You can't join your own referral");
      }
      const referrer = referrerEntities[0];

      const existedReferralEntities = await strapi.entityService.findMany(
        "api::referral.referral",
        {
          filters: {
            user: ctx.state.user.id,
          },
        }
      );
      if (existedReferralEntities.length) {
        throw new NotFoundError("You already joined a referral");
      }

      try {
        await strapi.entityService.create("api::referral.referral", {
          data: {
            user: ctx.state.user.id,
            referrer: referrer.id,
          },
        });

        await strapi.service("api::referral.referral").logReferral({
          referrer,
          referredId: ctx.state.user.id,
        });

        ctx.send({ ok: true, message: "Join referral successfully" });
      } catch (error) {
        throw new ApplicationError(`Join referral failed. [${error.message}]`);
      }
    },
  })
);
