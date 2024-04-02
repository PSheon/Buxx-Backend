import utils from "@strapi/utils";

import _ from "lodash";

import { getService } from "../utils";
import {
  PaginationInfo,
  getPaginationInfo,
  transformPaginationResponse,
  convertPagedToStartLimit,
} from "../utils/pagination";
import {
  validateUpdateUserBody,
  validateUpdateMeUserBody,
} from "./validation/user";

import { IAdvancedSettings } from "../../../../../types/strapiServerTypes";

const { sanitize, validate } = utils;
const { ApplicationError, ValidationError, NotFoundError } = utils.errors;

const sanitizeOutput = async (user, ctx) => {
  const schema = strapi.getModel("plugin::users-permissions.user");
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(user, schema, { auth });
};

const sanitizeQuery = async (query, ctx) => {
  const schema = strapi.getModel("plugin::users-permissions.user");
  const { auth } = ctx.state;

  return sanitize.contentAPI.query(query, schema, { auth });
};

const validateQuery = async (query, ctx) => {
  const schema = strapi.getModel("plugin::users-permissions.user");
  const { auth } = ctx.state;

  return validate.contentAPI.query(query, schema, { auth });
};

export const update = async (ctx) => {
  const advancedConfigs = (await strapi
    .store({ type: "plugin", name: "users-permissions" })
    .get({
      key: "advanced",
    })) as IAdvancedSettings;

  const { id } = ctx.params;
  const { email, username, password } = ctx.request.body;

  const user = await getService("user").fetch(id);
  if (!user) {
    throw new NotFoundError(`User not found`);
  }

  await validateUpdateUserBody(ctx.request.body);

  if (
    user.provider === "local" &&
    _.has(ctx.request.body, "password") &&
    !password
  ) {
    throw new ValidationError("password.notNull");
  }

  if (_.has(ctx.request.body, "username")) {
    const userWithSameUsername = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { username } });

    if (
      userWithSameUsername &&
      _.toString(userWithSameUsername.id) !== _.toString(id)
    ) {
      throw new ApplicationError("Username already taken");
    }
  }

  if (_.has(ctx.request.body, "email") && advancedConfigs.unique_email) {
    const userWithSameEmail = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: email.toLowerCase() } });

    if (
      userWithSameEmail &&
      _.toString(userWithSameEmail.id) !== _.toString(id)
    ) {
      throw new ApplicationError("Email already taken");
    }
    ctx.request.body.email = ctx.request.body.email.toLowerCase();
  }

  const updateData = {
    ...ctx.request.body,
  };

  const data = await getService("user").edit(user.id, updateData);
  const sanitizedData = await sanitizeOutput(data, ctx);

  ctx.send(sanitizedData);
};

// ** NOTE: I modified pagination with some tricks, please make sure to update here after Strapi V5 is released.
export const find = async (ctx) => {
  const sanitizedQuery = await sanitizeQuery(ctx.query, ctx);
  const { pagination = {}, ...restOfCtxQueries } = sanitizedQuery;

  const queryPagination = convertPagedToStartLimit(
    pagination as PaginationInfo
  );
  const params = {
    ...restOfCtxQueries,
    ...queryPagination,
  };
  const query = utils.convertQueryParams.transformParamsToQuery(
    "plugin::users-permissions.user",
    params
  );

  const [users, count] = await strapi.db
    .query("plugin::users-permissions.user")
    .findWithCount(query);

  const paginationInfo = getPaginationInfo(sanitizedQuery);
  const paginationResult = transformPaginationResponse(paginationInfo, count);

  const data = await Promise.all(
    users.map((user) => sanitizeOutput(user, ctx))
  );

  ctx.send({
    data,
    meta: {
      pagination: paginationResult,
    },
  });
};

export const findOne = async (ctx) => {
  const { id } = ctx.params;

  await validateQuery(ctx.query, ctx);
  const sanitizedQuery = await sanitizeQuery(ctx.query, ctx);

  const data = await getService("user").fetch(id, sanitizedQuery);

  if (!data) {
    throw new NotFoundError(`User not found`);
  }

  const sanitizedData = await sanitizeOutput(data, ctx);

  ctx.body = sanitizedData;
};

export const updateMe = async (ctx) => {
  const user = await getService("user").fetch(ctx.state.user.id);
  if (!user) {
    throw new NotFoundError(`User not found`);
  }

  await validateUpdateMeUserBody(ctx.request.body);

  const data = await strapi.entityService.update(
    "plugin::users-permissions.user",
    user.id,
    {
      data: ctx.request.body,
      populate: ctx.query.populate,
    }
  );
  const sanitizedData = await sanitizeOutput(data, ctx);

  ctx.send(sanitizedData);
};
