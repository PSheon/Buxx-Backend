/**
 * notification controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { validateUpdateMeOneBody } from "./validation/notification";

import type Koa from "koa";

const { NotFoundError, UnauthorizedError } = utils.errors;

export default factories.createCoreController(
  "api::notification.notification",
  ({ strapi }) => ({
    async findMeOne(ctx: Koa.Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const entity = await strapi
        .service("api::notification.notification")
        .findOne(id, sanitizedQuery);

      if (!entity) {
        throw new NotFoundError("Notification entity not found");
      }
      if (entity.notifier.id !== ctx.state.user.id) {
        throw new UnauthorizedError(
          "You are not allowed to perform this action"
        );
      }
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      const response = this.transformResponse(sanitizedEntity);

      ctx.send(response);
    },

    async findMe(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const enhancedFilters = Object.assign(sanitizedQuery.filters || {}, {
        notifier: ctx.state.user.id,
      });

      const { results, pagination } = await strapi
        .service("api::notification.notification")
        .find({
          ...sanitizedQuery,
          filters: enhancedFilters,
        });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },

    async updateMeOne(ctx: Koa.Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const body = ctx.request.body;

      await validateUpdateMeOneBody(ctx.query, ctx);

      const entity = await strapi
        .service("api::notification.notification")
        .findOne(id, sanitizedQuery);

      if (!entity) {
        throw new NotFoundError("Notification entity not found");
      }
      if (entity.notifier.id !== ctx.state.user.id) {
        throw new UnauthorizedError(
          "You are not allowed to perform this action"
        );
      }

      const sanitizedInputData = await this.sanitizeInput(body.data, ctx);

      const data = await strapi
        .service("api::notification.notification")
        .update(id, {
          ...sanitizedQuery,
          data: sanitizedInputData,
          files: "files" in body ? body.files : undefined,
        });

      const sanitizedEntity = await this.sanitizeOutput(data, ctx);

      const response = this.transformResponse(sanitizedEntity);

      ctx.send(response);
    },
  })
);
