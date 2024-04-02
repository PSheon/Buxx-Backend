/**
 * User.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import urlJoin from "url-join";
import _ from "lodash";

import { getAbsoluteServerUrl, sanitize } from "@strapi/utils";

import confirmationEmailTemplate from "../../../../../email/confirm-email/template";

export default ({ strapi }) => ({
  /**
   * Promise to count users
   *
   * @return {Promise}
   */

  count(params) {
    return strapi
      .query("plugin::users-permissions.user")
      .count({ where: params });
  },

  /**
   * Promise to search count users
   *
   * @return {Promise}
   */

  /**
   * Promise to add a/an user.
   * @return {Promise}
   */
  async add(values) {
    return strapi.entityService.create("plugin::users-permissions.user", {
      data: values,
      populate: ["role"],
    });
  },

  /**
   * Promise to edit a/an user.
   * @param {string} userId
   * @param {object} params
   * @return {Promise}
   */
  async edit(userId, params = {}) {
    return strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        data: params,
        populate: ["role"],
      }
    );
  },

  /**
   * Promise to fetch a/an user.
   * @return {Promise}
   */
  fetch(id, params) {
    return strapi.entityService.findOne(
      "plugin::users-permissions.user",
      id,
      params
    );
  },

  /**
   * Promise to fetch authenticated user.
   * @return {Promise}
   */
  fetchAuthenticatedUser(id) {
    return strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { id }, populate: ["role"] });
  },

  /**
   * Promise to fetch all users.
   * @return {Promise}
   */
  fetchAll(params) {
    return strapi.entityService.findMany(
      "plugin::users-permissions.user",
      params
    );
  },

  /**
   * Promise to remove a/an user.
   * @return {Promise}
   */
  async remove(params) {
    return strapi
      .query("plugin::users-permissions.user")
      .delete({ where: params });
  },

  validatePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async sendConfirmationEmail(user) {
    const userSchema = strapi.getModel("plugin::users-permissions.user");

    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(
      userSchema,
      user
    );

    const confirmationToken = crypto.randomBytes(20).toString("hex");

    await this.edit(user.id, { confirmationToken });

    const apiPrefix = strapi.config.get("api.rest.prefix");

    await strapi
      .plugin("email")
      .service("email")
      .sendTemplatedEmail(
        {
          to: sanitizedUserInfo.email,
        },
        confirmationEmailTemplate,
        {
          subject: `🤩 嗨，${sanitizedUserInfo.username}，我們需要驗證您的信箱`,
          metadata: {
            // logoImageUrl: `${
            //   process.env.BACKEND_URL as string
            // }/uploads/favicon_32x32_0dc5a4933d.png`,
            logoImageUrl:
              "https://action-store.s3.ap-northeast-1.amazonaws.com/logo_dd205a026c.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVHN56EQU4CD57NNV%2F20240402%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240402T082407Z&X-Amz-Expires=900&X-Amz-Signature=706f6bed17acfb0875466d20764aea19bd5461d0e222472a06eeecf471f96d6a&X-Amz-SignedHeaders=host&x-id=GetObject",
            productName: "Bloom",
            receiver: {
              name: sanitizedUserInfo.username,
              email: sanitizedUserInfo.email,
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
            title: "請驗證你的電子郵件",
            greeting: `👋嗨， ${user.username}!`,
            welcomeAboard: `歡迎您加入 Bloom!`,
            clickButtonBelowToVerify: `請先點擊下方按鈕來驗證你的電子郵件地址：`,
            orVerifyUsingThisLink: "或複製下方連結到瀏覽器中",
            needHelp: "需要幫忙嗎？",
            pleaseFeedbackTo: "請將回饋或錯誤訊息發送至",
          },
          confirmButton: {
            text: "驗證我的信箱",
            link: `${urlJoin(
              getAbsoluteServerUrl(strapi.config),
              apiPrefix,
              "/auth/email-confirmation"
            )}?confirmation=${confirmationToken}`,
          },
        }
      );
  },
});
