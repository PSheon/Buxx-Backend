/**
 * wallet controller
 */

import { factories } from "@strapi/strapi";

import { generateNonce, SiweMessage } from "siwe";

export default factories.createCoreController(
  "api::wallet.wallet",
  ({ strapi }) => ({
    async findMe(ctx) {
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
    async verifyWallet(ctx) {
      const {
        data: { message, signature, address, connector },
      } = ctx.request.body;

      const savedWallets = await strapi.entityService.findMany(
        "api::wallet.wallet",
        {
          filters: { user: ctx.state.user.id },
        }
      );

      if (
        savedWallets.find(
          (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
        )
      ) {
        return ctx.send({ ok: false, message: "Wallet already exists" });
      }
      if (savedWallets.length >= 5) {
        return ctx.send({ ok: false, message: "You can only add 5 wallets" });
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

        ctx.send({ ok: true, message: "Wallet verified" });
      } catch (error) {
        ctx.send({ ok: false, message: error.message });
      }
    },
  })
);
