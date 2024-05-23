/**
 * metadata router
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter("api::metadata.metadata");

const customRouter = (defaultRouter, customRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return defaultRouter.prefix;
    },
    get routes() {
      if (!routes) routes = customRoutes.concat(defaultRouter.routes);
      return routes;
    },
  };
};

const customRoutes = [
  {
    method: "GET",
    path: "/metadata/:contractAddress/contract/:contractAddressConfirm",
    handler: "metadata.getContractMetadata",
  },
  {
    method: "GET",
    path: "/metadata/:contractAddress/slot/:slotId",
    handler: "metadata.getSlotMetadata",
  },
  {
    method: "GET",
    path: "/metadata/:contractAddress/:tokenId",
    handler: "metadata.getTokenMetadata",
  },
];

export default customRouter(defaultRouter, customRoutes);
