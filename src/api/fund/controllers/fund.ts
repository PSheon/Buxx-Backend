/**
 * fund controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { isObject } from "lodash/fp";
import EthCrypto from "eth-crypto";
import Web3 from "web3";
import { addDays, getUnixTime } from "date-fns";

import {
  validateSFTSignHashBody,
  validateVaultSignHashBody,
} from "./validation/fund";

import {
  parseBody,
  getExpectInterestBalanceString,
  getPeriodBonusAPY,
  getLevelBonusAPY,
} from "../utils";

import type Koa from "koa";

const { ValidationError, NotFoundError } = utils.errors;

type SFTSignHashInput = {
  contractName: string;
  minterAddress: string;
  slotId: string;
  value: string;
};
type VaultSignHashInput = {
  contractName: string;
  stakerAddress: string;
  tokenId: string;
  packageId: string;
  balance: string;
  periodInDays: number;
  apy: number;
};

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

    async sftSignHash(ctx: Koa.Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = (await this.sanitizeInput(
        body.data,
        ctx
      )) as SFTSignHashInput;

      await validateSFTSignHashBody(sanitizedInputData, ctx);

      const entity = await strapi
        .service("api::fund.fund")
        .findOne(id, { populate: ["sft"] });

      if (!entity) {
        throw new NotFoundError("Fund entity not found");
      }
      if (!entity.sft || !entity.sft.contractRootSignerPrivateKey) {
        throw new NotFoundError("Fund settings are not completed");
      }

      const messageHash = Web3.utils.soliditySha3(
        { type: "string", value: sanitizedInputData.contractName },
        { type: "address", value: sanitizedInputData.minterAddress },
        { type: "uint256", value: sanitizedInputData.slotId },
        { type: "uint256", value: sanitizedInputData.value }
      ) as string;
      const signature = EthCrypto.sign(
        entity.sft.contractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({ hash: signature });
    },

    async vaultSignHash(ctx: Koa.Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);

      const body = parseBody(ctx);

      if (!isObject(body.data)) {
        throw new ValidationError('Missing "data" payload in the request body');
      }

      const sanitizedInputData = (await this.sanitizeInput(
        body.data,
        ctx
      )) as VaultSignHashInput;
      await validateVaultSignHashBody(sanitizedInputData, ctx);

      const fundEntity = await strapi
        .service("api::fund.fund")
        .findOne(id, { populate: ["vault"] });

      if (!fundEntity) {
        throw new NotFoundError("Vault entity not found");
      }
      if (!fundEntity.vault || !fundEntity.vault.contractRootSignerPrivateKey) {
        throw new NotFoundError("Vault settings are not completed");
      }

      const packageEntity = await strapi
        .service("api::package.package")
        .findOne(sanitizedInputData.packageId, {
          populate: ["slots"],
        });
      if (!packageEntity) {
        throw new NotFoundError("Package entity not found");
      }
      const baseAPY =
        packageEntity.slots.find((slot) => slot.propertyName === "APY")
          ?.value ?? 0;
      const periodBonusAPY = getPeriodBonusAPY(sanitizedInputData.periodInDays);
      const levelBonusAPY = getLevelBonusAPY(ctx.state.user.exp);
      const totalAPY = Number(baseAPY) + periodBonusAPY + levelBonusAPY;

      if (totalAPY !== sanitizedInputData.apy) {
        throw new ValidationError("Invalid APY value");
      }

      const unlockDateUnixTime = getUnixTime(
        addDays(new Date(), sanitizedInputData.periodInDays)
      );
      const expectInterestString = getExpectInterestBalanceString(
        BigInt(sanitizedInputData.balance),
        sanitizedInputData.apy,
        sanitizedInputData.periodInDays
      );

      const messageHash = Web3.utils.soliditySha3(
        { type: "string", value: sanitizedInputData.contractName },
        { type: "address", value: sanitizedInputData.stakerAddress },
        { type: "uint256", value: sanitizedInputData.tokenId },
        { type: "uint256", value: sanitizedInputData.balance },
        { type: "uint48", value: unlockDateUnixTime },
        { type: "uint256", value: expectInterestString }
      ) as string;
      const signature = EthCrypto.sign(
        fundEntity.vault.contractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({
        hash: signature,
        unlockTime: unlockDateUnixTime,
        interest: expectInterestString,
      });
    },
  })
);
