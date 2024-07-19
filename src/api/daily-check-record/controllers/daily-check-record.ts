/**
 * daily-check-record controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import isAfter from "date-fns/isAfter";
import addDays from "date-fns/addDays";

import type Koa from "koa";

const { ValidationError } = utils.errors;

export default factories.createCoreController(
  "api::daily-check-record.daily-check-record",
  ({ strapi }) => ({
    async findMe(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const enhancedFilters = Object.assign(sanitizedQuery.filters || {}, {
        user: ctx.state.user.id,
      });

      const { results, pagination } = await strapi
        .service("api::daily-check-record.daily-check-record")
        .find({ ...sanitizedQuery, filters: enhancedFilters });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },

    async check(ctx: Koa.Context) {
      const meDailyCheckRecordEntities = await strapi.entityService.findMany(
        "api::daily-check-record.daily-check-record",
        {
          filters: {
            user: ctx.state.user.id,
          },
          sort: ["date:desc"],
        }
      );
      if (meDailyCheckRecordEntities.length === 0) {
        await strapi.entityService.create(
          "api::daily-check-record.daily-check-record",
          {
            data: {
              user: ctx.state.user.id,
              date: new Date(),
            },
          }
        );

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "DailyCheck",
          user: ctx.state.user,
          earningExp: 60,
          earningPoints: 0,
          receipt: {
            task: "Daily Check",
            userId: ctx.state.user.id,
            exp: 60,
            points: 0,
          },
        });

        return ctx.send({ ok: true });
      } else {
        const latestMeDailyCheckRecord = meDailyCheckRecordEntities[0];
        const latestDate = new Date(latestMeDailyCheckRecord.date);

        if (isAfter(new Date(), new Date(addDays(new Date(latestDate), 1)))) {
          await strapi.entityService.create(
            "api::daily-check-record.daily-check-record",
            {
              data: {
                user: ctx.state.user.id,
                date: new Date(),
              },
            }
          );

          await strapi
            .service("api::point-record.point-record")
            .logPointRecord({
              type: "DailyCheck",
              user: ctx.state.user,
              earningExp: 60,
              earningPoints: 0,
              receipt: {
                task: "Daily Check",
                userId: ctx.state.user.id,
                exp: 60,
                points: 0,
              },
            });
        } else {
          throw new ValidationError("Not in the daily-check time");
        }

        await strapi
          .service("api::daily-check-record.daily-check-record")
          .updateUserReferralLevel(ctx.state.user.id);

        return ctx.send({ ok: true });
      }
    },
  })
);
