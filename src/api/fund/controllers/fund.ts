/**
 * fund controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { isObject } from "lodash/fp";
import EthCrypto from "eth-crypto";
import Web3 from "web3";

import { validateSignHashBody } from "./validation/fund";

import { parseBody } from "../utils";

import type Koa from "koa";

const { ValidationError, NotFoundError } = utils.errors;

export default factories.createCoreController(
  "api::fund.fund",
  ({ strapi }) => ({
    async create(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = await this.sanitizeInput(body.data, ctx);

      const entity = await strapi.service("api::fund.fund").create({
        ...sanitizedQuery,
        data: sanitizedInputData,
        files: "files" in body ? body.files : undefined,
      });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      await strapi.service("api::activity-log.activity-log").logActivity({
        action: "Create",
        refContentType: "Fund",
        refId: entity.id,
        message: "Created fund successfully.",
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
          refContentType: "Fund",
          refId: id,
          message: 'Missing "data" payload in the request body',
          payload: {},
          status: "Rejected",
          user: ctx.state.user,
        });

        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = await this.sanitizeInput(body.data, ctx);

      const entity = await strapi.service("api::fund.fund").update(id, {
        ...sanitizedQuery,
        data: sanitizedInputData,
        files: "files" in body ? body.files : undefined,
      });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      await strapi.service("api::activity-log.activity-log").logActivity({
        action: "Update",
        refContentType: "Fund",
        refId: id,
        message: "Updated fund successfully.",
        payload: sanitizedInputData,
        status: "Fulfilled",
        user: ctx.state.user,
      });

      return this.transformResponse(sanitizedEntity);
    },

    async signHash(ctx: Koa.Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = (await this.sanitizeInput(body.data, ctx)) as {
        contractName: string;
        minterAddress: string;
        slotId: string;
        value: string;
      };

      await validateSignHashBody(sanitizedInputData, ctx);

      const entity = await strapi.service("api::fund.fund").findOne(id);

      if (!entity) {
        throw new NotFoundError("Fund entity not found");
      }
      if (
        !entity.fundSFTContractRootSignerAddress ||
        !entity.fundSFTContractRootSignerPrivateKey
      ) {
        throw new NotFoundError("Fund settings are not completed");
      }

      const messageHash = Web3.utils.soliditySha3(
        { type: "string", value: sanitizedInputData.contractName },
        { type: "address", value: sanitizedInputData.minterAddress },
        { type: "uint256", value: sanitizedInputData.slotId },
        { type: "uint256", value: sanitizedInputData.value }
      ) as string;
      const signature = EthCrypto.sign(
        entity.fundSFTContractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({ hash: signature });
    },
  })
);
