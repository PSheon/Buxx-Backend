/**
 * wallet controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";

import { generateNonce, SiweMessage } from "siwe";

import type Koa from "koa";

const { ApplicationError, ValidationError } = utils.errors;

export default factories.createCoreController(
  "api::wallet.wallet",
  ({ strapi }) => ({
    async findMe(ctx: Koa.Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const { results, pagination } = await strapi
        .service("api::wallet.wallet")
        .find({ ...sanitizedQuery, filters: { user: ctx.state.user.id } });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      const response = this.transformResponse(sanitizedResults, {
        pagination,
      });

      ctx.send(response);
    },

    async getNonce(ctx) {
      const nonce = generateNonce();

      ctx.send({ nonce });
    },

    async verifyWallet(ctx: Koa.Context) {
      const {
        data: { message, signature, address, connector },
      } = ctx.request.body;

      const savedWallets = await strapi.entityService.findMany(
        "api::wallet.wallet",
        {
          filters: { address },
        }
      );
      if (savedWallets.length > 0) {
        throw new ValidationError("Wallet already verified");
      }

      const meSavedWallets = await strapi.entityService.findMany(
        "api::wallet.wallet",
        {
          filters: { user: ctx.state.user.id },
        }
      );

      if (
        meSavedWallets.find(
          (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
        )
      ) {
        return ctx.send({ ok: false, message: "Wallet already exists" });
      }
      if (meSavedWallets.length >= 3) {
        return ctx.send({ ok: false, message: "You can only add 3 wallets" });
      }

      try {
        const siweMessage = new SiweMessage(message);
        await siweMessage.verify({
          signature,
        });

        const connectedWalletEntity = await strapi.entityService.create(
          "api::wallet.wallet",
          {
            data: {
              user: ctx.state.user.id,
              chain: "Ethereum",
              address,
              connector,
              isConnected: true,
            },
          }
        );

        await strapi.service("api::activity-log.activity-log").logActivity({
          action: "Create",
          refContentType: "Wallet",
          refId: connectedWalletEntity.id,
          message: "Create wallet successfully.",
          payload: { message },
          status: "Fulfilled",
          user: ctx.state.user,
        });

        await strapi.service("api::point-record.point-record").logPointRecord({
          type: "VerifyWallet",
          user: ctx.state.user,
          earningExp: 300,
          earningPoints: 0,
          receipt: {
            task: "Verify Wallet",
            userId: ctx.state.user.id,
            exp: 300,
            points: 0,
          },
        });

        ctx.send({ ok: true, message: "Wallet verified" });
      } catch (error) {
        throw new ApplicationError(`Verify wallet failed. [${error.message}]`);
      }
    },
  })
);
