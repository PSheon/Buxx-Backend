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
      const { referralCode } = ctx.request.body;

      await validateJoinReferralBody(ctx.request.body);

      const referrerEntities = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            referralRank: {
              $notNull: true,
            },
            referralPath: {
              $notNull: true,
            },
            referralCode,
          },
        }
      );
      if (!referrerEntities.length) {
        throw new NotFoundError("Referral not found");
      } else if (referrerEntities[0].id === ctx.state.user.id) {
        throw new NotFoundError("You can't join your own referral");
      }
      const referrer = referrerEntities[0];

      const existedMeReferralEntities = await strapi.entityService.findMany(
        "api::referral.referral",
        {
          filters: {
            user: ctx.state.user.id,
          },
        }
      );
      if (existedMeReferralEntities.length) {
        throw new NotFoundError("You already joined a referral");
      }

      try {
        // ** Update user's referral rank and path
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          ctx.state.user.id,
          {
            data: {
              referralRank: referrer.referralRank + 1,
              referralPath: `${referrer.referralPath}${ctx.state.user.id}_`,
            },
          }
        );

        // ** Create referral entity
        await strapi.entityService.create("api::referral.referral", {
          data: {
            rank: referrer.referralRank + 1,
            path: `${referrer.referralPath}${ctx.state.user.id}_`,
            user: ctx.state.user.id,
            referrer: referrer.id,
            lastTeamShareSettlementDate: new Date(),
          },
        });

        // ** Referrer earn 500 exp for referring
        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "Referral",
            user: referrer,
            earningExp: 500,
            earningPoints: 0,
            receipt: {
              type: "Referral",
              referrerId: referrer.id,
              userId: ctx.state.user.id,
              exp: 500,
              points: 0,
            },
          });

        // ** User earn 50 exp for joining referral
        await strapi
          .service("api::earning-record.earning-record")
          .logEarningRecord({
            type: "JoinReferral",
            user: ctx.state.user,
            earningExp: 50,
            earningPoints: 0,
            receipt: {
              type: "Join Referral",
              userId: ctx.state.user.id,
              exp: 50,
              points: 0,
            },
          });

        ctx.send({ ok: true, message: "Join referral successfully" });
      } catch (error) {
        throw new ApplicationError(`Join referral failed. [${error.message}]`);
      }
    },
  })
);
