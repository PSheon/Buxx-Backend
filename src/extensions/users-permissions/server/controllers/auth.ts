/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

import crypto from "crypto";

import utils from "@strapi/utils";

import _ from "lodash";
import UaParser from "ua-parser-js";
import format from "date-fns/format";
import isBefore from "date-fns/isBefore";
import addMinutes from "date-fns/addMinutes";

import welcomeEmailTemplate from "../../../../../email/welcome/template";
import forgotPasswordEmailTemplate from "../../../../../email/forgot-password/template";
import { getService } from "../utils";
import {
  validateCallbackBody,
  validateRegisterBody,
  validateForgotPasswordBody,
  validateResetPasswordBody,
  validateEmailConfirmationBody,
  validateChangePasswordBody,
} from "./validation/auth";

import { IAdvancedSettings } from "../../../../../types/strapiServerTypes";

import type Koa from "koa";

const { sanitize } = utils;
const {
  ApplicationError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  RateLimitError,
  ForbiddenError,
} = utils.errors;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

export const callback = async (ctx: Koa.Context) => {
  const provider = ctx.params.provider || "local";
  const params = ctx.request.body;

  const store = strapi.store({ type: "plugin", name: "users-permissions" });
  const grantSettings = await store.get({ key: "grant" });

  const grantProvider = provider === "local" ? "email" : provider;

  if (!_.get(grantSettings, [grantProvider, "enabled"])) {
    throw new ApplicationError("This provider is disabled");
  }

  if (provider === "local") {
    await validateCallbackBody(params);

    const { identifier } = params;

    // Check if the user exists.
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: {
        provider,
        $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
      populate: ["avatar", "role"],
    });

    if (!user) {
      throw new ValidationError("Invalid identifier or password");
    }

    if (!user.password) {
      await strapi.service("api::access-log.access-log").logAccess({
        ctx,
        user,
        status: false,
        action: "Login",
        responseMessage: "No password set",
      });
      throw new ValidationError("Invalid identifier or password");
    }

    const validPassword = await getService("user").validatePassword(
      params.password,
      user.password
    );

    if (!validPassword) {
      await strapi.service("api::access-log.access-log").logAccess({
        ctx,
        user,
        status: false,
        action: "Login",
        responseMessage: "Invalid identifier or password",
      });
      throw new ValidationError("Invalid identifier or password");
    }

    const advancedSettings = await store.get({ key: "advanced" });
    const requiresConfirmation = _.get(advancedSettings, "email_confirmation");

    if (requiresConfirmation && user.confirmed !== true) {
      await strapi.service("api::access-log.access-log").logAccess({
        ctx,
        user,
        status: false,
        action: "Login",
        responseMessage: "Your account email is not confirmed",
      });
      throw new ApplicationError("Your account email is not confirmed");
    }

    if (user.blocked === true) {
      await strapi.service("api::access-log.access-log").logAccess({
        ctx,
        user,
        status: false,
        action: "Login",
        responseMessage: "Your account has been blocked by an administrator",
      });
      throw new ApplicationError(
        "Your account has been blocked by an administrator"
      );
    }

    await strapi.service("api::access-log.access-log").logAccess({
      ctx,
      user,
      status: true,
      action: "Login",
      responseMessage: "Success login",
    });

    return ctx.send({
      jwt: getService("jwt").issue({ id: user.id }),
      user: await sanitizeUser(user, ctx),
    });
  }

  // Connect the user with the third-party provider.
  try {
    const user = await getService("providers").connect(provider, ctx.query);

    if (user.blocked) {
      await strapi.service("api::access-log.access-log").logAccess({
        ctx,
        user,
        status: false,
        action: "Login",
        responseMessage: "Your account has been blocked by an administrator",
      });
      throw new ForbiddenError(
        "Your account has been blocked by an administrator"
      );
    }

    await strapi.service("api::access-log.access-log").logAccess({
      ctx,
      user,
      status: true,
      action: "Login",
      responseMessage: "Success login",
    });
    return ctx.send({
      jwt: getService("jwt").issue({ id: user.id }),
      user: await sanitizeUser(user, ctx),
    });
  } catch (error) {
    throw new ApplicationError(error.message);
  }
};

export const changePassword = async (ctx: Koa.Context) => {
  if (!ctx.state.user) {
    throw new ApplicationError(
      "You must be authenticated to reset your password"
    );
  }

  const { currentPassword, newPassword } = await validateChangePasswordBody(
    ctx.request.body
  );

  const user = await strapi.entityService.findOne(
    "plugin::users-permissions.user",
    ctx.state.user.id
  );

  const validPassword = await getService("user").validatePassword(
    currentPassword,
    user.password
  );

  if (!validPassword) {
    await strapi.service("api::access-log.access-log").logAccess({
      ctx,
      user,
      status: false,
      action: "ChangePassword",
      responseMessage: "The provided current password is invalid",
    });
    throw new ValidationError("The provided current password is invalid");
  }

  if (currentPassword === newPassword) {
    await strapi.service("api::access-log.access-log").logAccess({
      ctx,
      user,
      status: false,
      action: "ChangePassword",
      responseMessage:
        "Your new password must be different than your current password",
    });
    throw new ValidationError(
      "Your new password must be different than your current password"
    );
  }

  await getService("user").edit(user.id, { password: newPassword });

  await strapi.service("api::access-log.access-log").logAccess({
    ctx,
    user,
    status: true,
    action: "ChangePassword",
    responseMessage: "Password changed successfully",
  });

  ctx.send({
    jwt: getService("jwt").issue({ id: user.id }),
    user: await sanitizeUser(user, ctx),
  });
};

export const resetPassword = async (ctx: Koa.Context) => {
  const { password, passwordConfirmation, resetPasswordToken } =
    await validateResetPasswordBody(ctx.request.body);

  if (password !== passwordConfirmation) {
    throw new ValidationError("Passwords do not match");
  }

  const user = await strapi
    .query("plugin::users-permissions.user")
    .findOne({ where: { resetPasswordToken } });

  if (!user) {
    throw new ValidationError("Incorrect code provided");
  }

  await getService("user").edit(user.id, {
    resetPasswordToken: null,
    password,
  });

  await strapi.service("api::access-log.access-log").logAccess({
    ctx,
    user,
    status: true,
    action: "ResetPassword",
    responseMessage: "Password reset successfully",
  });

  // Update the user.
  ctx.send({
    jwt: getService("jwt").issue({ id: user.id }),
    user: await sanitizeUser(user, ctx),
  });
};

export const forgotPassword = async (ctx: Koa.Context) => {
  const { email } = await validateForgotPasswordBody(ctx.request.body);

  // Find the user by email.
  const user = await strapi.query("plugin::users-permissions.user").findOne({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new NotFoundError("Email entity not found");
  } else if (user.blocked) {
    await strapi.service("api::access-log.access-log").logAccess({
      ctx,
      user,
      status: false,
      action: "ForgotPassword",
      responseMessage: "You have been blocked by an administrator",
    });
    throw new UnauthorizedError("You have been blocked by an administrator");
  } else if (
    user.lastForgotPasswordAt !== null &&
    isBefore(
      new Date(),
      new Date(addMinutes(new Date(user.lastForgotPasswordAt), 3))
    )
  ) {
    await strapi.service("api::access-log.access-log").logAccess({
      ctx,
      user,
      status: false,
      action: "ForgotPassword",
      responseMessage:
        "We have already sent you an email, please check your inbox or wait 3 minutes",
    });
    throw new RateLimitError(
      "We have already sent you an email, please check your inbox or wait 3 minutes"
    );
  }

  // Generate random token.
  const resetPasswordToken = crypto.randomBytes(64).toString("hex");

  // NOTE: Update the user before sending the email so an Admin can generate the link if the email fails
  await getService("user").edit(user.id, {
    resetPasswordToken,
    lastForgotPasswordAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  });
  const uaParser = new UaParser();
  const userAgent = uaParser.setUA(ctx.request.headers["user-agent"]);
  const requestOS = userAgent.getOS().name || "Unknown";
  const requestBrowser = userAgent.getBrowser().name || "Unknown";

  // Send an email to the user.
  await strapi
    .plugin("email")
    .service("email")
    .sendTemplatedEmail(
      {
        to: user.email,
      },
      forgotPasswordEmailTemplate,
      {
        subject: `😖 喔歐，${user.username}，忘記密碼了嗎？`,
        metadata: {
          // logoImageUrl: `${
          //   process.env.BACKEND_URL as string
          // }/uploads/favicon_32x32_0dc5a4933d.png`,
          logoImageUrl:
            "https://action-store.s3.ap-northeast-1.amazonaws.com/logo_dd205a026c.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVHN56EQU4CD57NNV%2F20240402%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240402T082407Z&X-Amz-Expires=900&X-Amz-Signature=706f6bed17acfb0875466d20764aea19bd5461d0e222472a06eeecf471f96d6a&X-Amz-SignedHeaders=host&x-id=GetObject",
          productName: "Bloom",
          receiver: {
            name: user.username,
            email: user.email,
          },
          replyTo: process.env.MAILGUN_DEFAULT_REPLY_TO as string,
          unsubscribe: {
            link: {
              text: "取消訂閱",
              url: "unsubscribe",
            },
            text: "我們的通知信件",
          },
        },
        content: {
          title: "喔歐!",
          itSeemsThatYouForgotYourPassword: `看來您忘記了您的密碼．沒問題！點擊下方按鈕以重設您的密碼：`,
          ifYouDidNotMakeThisRequest:
            requestOS !== "Unknown" && requestBrowser !== "Unknown"
              ? `這是你嗎？使用${requestOS} ${requestBrowser} 發出請求，如果您沒有發出此請求，請忽略此電子郵件`
              : "如果您沒有發出此請求，請忽略此電子郵件",
        },
        resetPasswordButton: {
          text: "重設密碼",
          link: `${process.env.FRONTEND_URL}/auth/reset-password?resetPasswordToken=${resetPasswordToken}`,
        },
      }
    );

  await strapi.service("api::access-log.access-log").logAccess({
    ctx,
    user,
    status: true,
    action: "ForgotPassword",
    responseMessage: "Forgot password email sent successfully",
  });

  ctx.send({
    ok: true,
    ...(process.env.NODE_ENV === "development"
      ? {
          resetPasswordToken,
        }
      : {}),
  });
};

export const register = async (ctx: Koa.Context) => {
  const pluginStore = await strapi.store({
    type: "plugin",
    name: "users-permissions",
  });

  const settings = (await pluginStore.get({
    key: "advanced",
  })) as IAdvancedSettings;

  if (!settings.allow_register) {
    throw new ApplicationError("Register action is currently disabled");
  }

  const params = {
    username: ctx.request.body.username,
    email: ctx.request.body.email,
    password: ctx.request.body.password,
    provider: "local",
  };

  await validateRegisterBody(params);

  const role = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: settings.default_role } });

  if (!role) {
    throw new ApplicationError("Impossible to find the default role");
  }

  const { email, username, provider } = params;

  const identifierFilter = {
    $or: [
      { email: email.toLowerCase() },
      { username: email.toLowerCase() },
      { username },
      { email: username },
    ],
  };

  const conflictingUserCount = await strapi
    .query("plugin::users-permissions.user")
    .count({
      where: { ...identifierFilter, provider },
    });

  if (conflictingUserCount > 0) {
    throw new ApplicationError("Email or Username are already taken");
  }

  if (settings.unique_email) {
    const conflictingUserCount = await strapi
      .query("plugin::users-permissions.user")
      .count({
        where: { ...identifierFilter },
      });

    if (conflictingUserCount > 0) {
      throw new ApplicationError("Email or Username are already taken");
    }
  }

  const newUser = {
    ...params,
    role: role.id,
    email: email.toLowerCase(),
    username,
    confirmed: !settings.email_confirmation,
  };

  const user = await getService("user").add(newUser);
  const sanitizedUser = await sanitizeUser(user, ctx);

  if (settings.email_confirmation) {
    try {
      await getService("user").sendConfirmationEmail(sanitizedUser);
    } catch (err) {
      throw new ApplicationError(err.message);
    }

    return ctx.send({ user: sanitizedUser });
  }

  const jwt = getService("jwt").issue(_.pick(user, ["id"]));

  return ctx.send({
    jwt,
    user: sanitizedUser,
  });
};

export const emailConfirmation = async (ctx: Koa.Context, next, returnUser) => {
  const { confirmation: confirmationToken } =
    await validateEmailConfirmationBody(ctx.query);

  const userService = getService("user");
  const jwtService = getService("jwt");

  const [user] = await userService.fetchAll({ filters: { confirmationToken } });

  if (!user) {
    throw new ValidationError("Invalid token");
  }

  await userService.edit(user.id, { confirmed: true, confirmationToken: null });

  await strapi.service("api::access-log.access-log").logAccess({
    ctx,
    user,
    status: true,
    action: "VerifyEmail",
    responseMessage: "Email verified successfully",
  });

  await strapi
    .plugin("email")
    .service("email")
    .sendTemplatedEmail(
      {
        to: user.email,
      },
      welcomeEmailTemplate,
      {
        subject: `🤩 嗨，${user.username}，歡迎加入`,
        metadata: {
          // logoImageUrl: `${
          //   process.env.BACKEND_URL as string
          // }/uploads/favicon_32x32_0dc5a4933d.png`,
          logoImageUrl:
            "https://action-store.s3.ap-northeast-1.amazonaws.com/logo_dd205a026c.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVHN56EQU4CD57NNV%2F20240402%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240402T082407Z&X-Amz-Expires=900&X-Amz-Signature=706f6bed17acfb0875466d20764aea19bd5461d0e222472a06eeecf471f96d6a&X-Amz-SignedHeaders=host&x-id=GetObject",
          productName: "Bloom",
          receiver: {
            name: user.username,
            email: user.email,
          },
          replyTo: process.env.MAILGUN_DEFAULT_REPLY_TO as string,
          unsubscribe: {
            link: {
              text: "取消訂閱",
              url: "unsubscribe",
            },
            text: "我們的通知信件",
          },
        },
        content: {
          title: "歡迎您加入 Bloom!",
          greeting: `👋嗨，${user.username}!`,
          thankYouForSigningUp: `感謝您註冊Bloom．真高興您來了！點擊下方按鈕以登入您的帳號：`,
          bestRegard: `乾杯`,
          team: "Bloom 團隊",
        },
        loginButton: {
          text: "登入我的帳號",
          link: `${process.env.FRONTEND_URL}/login`,
        },
      }
    );

  if (returnUser) {
    ctx.send({
      jwt: jwtService.issue({ id: user.id }),
      user: await sanitizeUser(user, ctx),
    });
  } else {
    const settings = (await strapi
      .store({ type: "plugin", name: "users-permissions" })
      .get({ key: "advanced" })) as IAdvancedSettings;

    ctx.redirect(settings.email_confirmation_redirection || "/");
  }
};
