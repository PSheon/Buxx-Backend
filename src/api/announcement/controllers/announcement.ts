/**
 * announcement controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { isObject } from "lodash/fp";

import { parseBody } from "../utils";

const { ValidationError } = utils.errors;

import type Koa from "koa";

export default factories.createCoreController(
  "api::announcement.announcement",
  ({ strapi }) => ({
    async create(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = await this.sanitizeInput(body.data, ctx);

      const entity = await strapi
        .service("api::announcement.announcement")
        .create({
          ...sanitizedQuery,
          data: sanitizedInputData,
          files: "files" in body ? body.files : undefined,
        });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      await strapi.service("api::activity-log.activity-log").logActivity({
        action: "Create",
        refContentType: "Announcement",
        refId: entity.id,
        message: "Created announcement successfully.",
        payload: sanitizedInputData,
        status: "Fulfilled",
        user: ctx.state.user,
      });

      return this.transformResponse(sanitizedEntity);
    },

    async update(ctx: Koa.Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        await strapi.service("api::activity-log.activity-log").logActivity({
          action: "Update",
          refContentType: "Announcement",
          refId: id,
          message: 'Missing "data" payload in the request body',
          payload: {},
          status: "Rejected",
          user: ctx.state.user,
        });

        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = await this.sanitizeInput(body.data, ctx);

      const entity = await strapi
        .service("api::announcement.announcement")
        .update(id, {
          ...sanitizedQuery,
          data: sanitizedInputData,
          files: "files" in body ? body.files : undefined,
        });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      try {
        await strapi.service("api::activity-log.activity-log").logActivity({
          action: "Update",
          refContentType: "Announcement",
          refId: id,
          message: "Updated announcement successfully.",
          payload: sanitizedInputData,
          status: "Fulfilled",
          user: ctx.state.user,
        });
      } catch (err) {
        console.log(
          "🚀 ~ src/api/announcement/controllers/announcement.ts:104 > err",
          err
        );
      }

      return this.transformResponse(sanitizedEntity);
    },
  })
);
