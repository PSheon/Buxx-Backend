/**
 * dv-fund controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { isObject } from "lodash/fp";
import EthCrypto from "eth-crypto";
import Web3 from "web3";

import {
  validateDepositSignHashBody,
  validateClaimSignHashBody,
} from "./validation/dv-fund";

import { parseBody } from "../utils";

import type Koa from "koa";

const { ValidationError, NotFoundError } = utils.errors;

type DepositSignHashInput = {
  contractAddress: string;
  user: string;
  amount: string;
  interestRate: string;
  principalDelayDays: string;
  durationDays: string;
};
type ClaimSignHashInput = {
  contractAddress: string;
  user: string;
};

export default factories.createCoreController(
  "api::dv-fund.dv-fund",
  ({ strapi }) => ({
    /* TODO: fill here later */
    async depositSignHash(ctx: Koa.Context) {
      const { packageId } = ctx.params;
      await this.validateQuery(ctx);
      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = (await this.sanitizeInput(
        body.data,
        ctx
      )) as DepositSignHashInput;
      await validateDepositSignHashBody(sanitizedInputData, ctx);

      const dvFundEntity = await strapi.entityService.findOne(
        "api::dv-fund.dv-fund",
        1,
        { populate: ["vault", "defaultPackages"] }
      );
      const packageEntity = await strapi.entityService.findOne(
        "api::package.package",
        packageId,
        { populate: ["slots"] }
      );

      if (!dvFundEntity) {
        throw new NotFoundError("DV Fund entity not found");
      }
      if (
        !dvFundEntity.vault ||
        !dvFundEntity.vault.contractRootSignerPrivateKey
      ) {
        throw new NotFoundError("DV Fund settings are not completed");
      }
      if (!packageEntity) {
        throw new NotFoundError("Package entity not found");
      }
      if (!packageEntity.slots || packageEntity.slots.length === 0) {
        throw new NotFoundError("Package slots are not completed");
      }

      const messageHash = Web3.utils.soliditySha3(
        { type: "address", value: sanitizedInputData.contractAddress },
        { type: "address", value: sanitizedInputData.user },
        { type: "uint256", value: sanitizedInputData.amount },
        { type: "uint256", value: sanitizedInputData.interestRate },
        { type: "uint256", value: sanitizedInputData.principalDelayDays },
        { type: "uint256", value: sanitizedInputData.durationDays }
      ) as string;
      const signature = EthCrypto.sign(
        dvFundEntity.vault.contractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({ hash: signature });
    },

    /* TODO: fill here later */
    async claimSignHash(ctx: Koa.Context) {
      await this.validateQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = (await this.sanitizeInput(
        body.data,
        ctx
      )) as ClaimSignHashInput;
      await validateClaimSignHashBody(sanitizedInputData, ctx);

      const entity = await strapi
        .service("api::dv-fund.dv-fund")
        .findOne(1, { populate: ["vault"] });

      if (!entity) {
        throw new NotFoundError("DV Fund entity not found");
      }
      if (!entity.vault || !entity.vault.contractRootSignerPrivateKey) {
        throw new NotFoundError("DV Fund settings are not completed");
      }

      const messageHash = Web3.utils.soliditySha3(
        { type: "address", value: sanitizedInputData.contractAddress },
        { type: "address", value: sanitizedInputData.user }
      ) as string;
      const signature = EthCrypto.sign(
        entity.vault.contractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({ hash: signature });
    },
  })
);
