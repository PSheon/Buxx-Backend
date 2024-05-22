/**
 * access-log controller
 */

import { factories } from "@strapi/strapi";

import type Koa from "koa";

export default factories.createCoreController(
  "api::access-log.access-log",
  ({ strapi }) => ({
    async findMe(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const { results, pagination } = await strapi
        .service("api::access-log.access-log")
        .find({ ...sanitizedQuery, filters: { user: ctx.state.user.id } });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },
  })
);
