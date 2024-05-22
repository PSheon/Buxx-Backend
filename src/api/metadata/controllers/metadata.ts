/**
 * metadata controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import {
  validateGetContractMetadataBody,
  validateGetSlotMetadataBody,
  validateGetTokenMetadataBody,
} from "./validation/metadata";

import type Koa from "koa";

const { ValidationError, ApplicationError, NotFoundError } = utils.errors;

export default factories.createCoreController(
  "api::metadata.metadata",
  ({ strapi }) => ({
    async getContractMetadata(ctx: Koa.Context) {
      const { contractAddress, contractAddressConfirm } = ctx.params;
      await validateGetContractMetadataBody(
        { contractAddress, contractAddressConfirm },
        ctx
      );
      if (contractAddress !== contractAddressConfirm) {
        throw new ValidationError(
          "The contract addresses is invalid. Please try again."
        );
      }

      const metadataEntity = await strapi.entityService.findOne(
        "api::metadata.metadata",
        1
      );
      if (!metadataEntity) {
        throw new ApplicationError(
          "The contract is in the process of being generated."
        );
      }

      const fundEntity = await strapi.service("api::fund.fund").find({
        filters: {
          fundSFTContractAddress: {
            $eqi: contractAddress,
          },
        },
      });
      if (fundEntity.results.length === 0) {
        throw new NotFoundError(
          "The contract address does not match any fund. Please try again."
        );
      }

      const fund = fundEntity.results[0];
      const metadata = Object.assign(metadataEntity.contractFallbackContent, {
        name: fund.displayName,
        description: fund.description || "No description",
        valueDecimals: 18,
      });

      return ctx.send(metadata);
    },

    async getSlotMetadata(ctx: Koa.Context) {
      const { contractAddress, slotId } = ctx.params;
      await validateGetSlotMetadataBody({ contractAddress, slotId }, ctx);

      const metadataEntity = await strapi.entityService.findOne(
        "api::metadata.metadata",
        1
      );
      if (!metadataEntity) {
        throw new ApplicationError(
          "The contract is in the process of being generated."
        );
      }

      const fundEntity = await strapi.service("api::fund.fund").find({
        filters: {
          fundSFTContractAddress: {
            $eqi: contractAddress,
          },
        },
        populate: ["defaultPackages", "defaultPackages.slot"],
      });
      if (fundEntity.results.length === 0) {
        throw new NotFoundError(
          "The contract address does not match any fund. Please try again."
        );
      }

      const fund = fundEntity.results[0];
      const usingPackage = fund.defaultPackages.find(
        (pkg) => pkg.id === parseInt(slotId, 10)
      );
      if (!usingPackage) {
        throw new NotFoundError(
          "The slot ID does not match any package. Please try again."
        );
      }
      const items =
        usingPackage.slot.map((slot) => ({
          name: slot.displayName,
          description: slot.description || "No description",
          value: slot.value,
          is_intrinsic: false,
        })) ?? [];

      const metadata = Object.assign(metadataEntity.contractFallbackContent, {
        name: fund.displayName,
        description: fund.description || "No description",
        items: items,
      });

      return ctx.send(metadata);
    },

    async getTokenMetadata(ctx: Koa.Context) {
      const { contractAddress, tokenId } = ctx.params;
      await validateGetTokenMetadataBody({ contractAddress, tokenId }, ctx);

      const metadataEntity = await strapi.entityService.findOne(
        "api::metadata.metadata",
        1
      );
      if (!metadataEntity) {
        throw new ApplicationError(
          "The contract is in the process of being generated."
        );
      }

      return ctx.send({ message: "under maintenance" });
    },
  })
);
