/**
 * access-log service
 */

import { factories } from "@strapi/strapi";

import UaParser from "ua-parser-js";
import { getClientIp } from "request-ip";

import { ILogAccessType } from "../types/accessLogTypes";

export default factories.createCoreService(
  "api::access-log.access-log",
  ({ strapi }) => ({
    async logAccess(params: ILogAccessType) {
      const { ctx, user, status, action, responseMessage } = params;

      const clientIp = getClientIp(ctx.request) || "Unknown";

      const uaParser = new UaParser();
      const userAgent = uaParser.setUA(ctx.request.headers["user-agent"]);
      const requestOS = userAgent.getOS().name || "Unknown";
      const requestBrowser = userAgent.getBrowser().name || "Unknown";

      await strapi.entityService.create("api::access-log.access-log", {
        data: {
          action,
          responseMessage,
          status,
          date: new Date(),
          user: user.id,
          ip: clientIp,
          os: requestOS,
          browser: requestBrowser,
        },
      });
    },
  })
);
