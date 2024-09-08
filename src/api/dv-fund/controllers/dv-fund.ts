/**
 * dv-fund controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { isObject } from "lodash/fp";
import fromUnixTime from "date-fns/fromUnixTime";
import addHours from "date-fns/addHours";
import getDate from "date-fns/getDate";
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
  sender: string;
  interestRate: number;
  startTime: number;
  principalDelayDays: number;
  durationDays: number;
};
type ClaimSignHashInput = {
  contractAddress: string;
  sender: string;
};

export default factories.createCoreController(
  "api::dv-fund.dv-fund",
  ({ strapi }) => ({
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

      const inputStartDate = fromUnixTime(sanitizedInputData.startTime);
      const dateInUTCPlus8 = addHours(inputStartDate, 8);
      const isFirstDayOfMonth = getDate(dateInUTCPlus8) === 1;
      if (!isFirstDayOfMonth) {
        throw new ValidationError(
          `Invalid start date, should be 1th of month.`
        );
      }

      const packageInterestRate = packageEntity.slots.find(
        (slot) => slot.propertyName === "APY"
      )?.value;
      if (
        packageInterestRate === undefined ||
        Number(packageInterestRate) !== sanitizedInputData.interestRate
      ) {
        throw new ValidationError(
          `Invalid package interest rate: ${packageInterestRate} for the given interest rate: ${sanitizedInputData.interestRate}`
        );
      }

      const packagePrincipalDelayDays = packageEntity.slots.find(
        (slot) => slot.propertyName === "PrincipalDelayDays"
      )?.value;
      if (
        packagePrincipalDelayDays === undefined ||
        Number(packagePrincipalDelayDays) !==
          sanitizedInputData.principalDelayDays
      ) {
        throw new ValidationError(
          `Invalid package principal delay days: ${packagePrincipalDelayDays} for the given principal delay days: ${sanitizedInputData.principalDelayDays}`
        );
      }

      const packageDurationDays = packageEntity.slots.find(
        (slot) => slot.propertyName === "Duration"
      )?.value;
      if (
        packageDurationDays === undefined ||
        Number(packageDurationDays) !== sanitizedInputData.durationDays
      ) {
        throw new ValidationError(
          `Invalid package duration days: ${packageDurationDays} for the given duration days: ${sanitizedInputData.durationDays}`
        );
      }

      const messageHash = Web3.utils.soliditySha3(
        { type: "address", value: sanitizedInputData.contractAddress },
        { type: "address", value: sanitizedInputData.sender },
        { type: "uint256", value: packageInterestRate },
        { type: "uint256", value: sanitizedInputData.startTime },
        { type: "uint256", value: packagePrincipalDelayDays },
        { type: "uint256", value: packageDurationDays }
      ) as string;
      const signature = EthCrypto.sign(
        dvFundEntity.vault.contractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({ hash: signature });
    },

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
        { type: "address", value: sanitizedInputData.sender }
      ) as string;
      const signature = EthCrypto.sign(
        entity.vault.contractRootSignerPrivateKey,
        messageHash
      );

      ctx.send({ hash: signature });
    },
  })
);
