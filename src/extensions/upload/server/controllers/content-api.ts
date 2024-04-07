import utils from "@strapi/utils";

import _ from "lodash";

import {
  PaginationInfo,
  getPaginationInfo,
  transformPaginationResponse,
  convertPagedToStartLimit,
} from "../utils/pagination";
import { getService } from "../utils";
import validateUploadBody from "./validation/content-api/upload";
import { FILE_MODEL_UID } from "../constants";

const { sanitize, validate } = utils;

const sanitizeOutput = async (data, ctx) => {
  const schema = strapi.getModel(FILE_MODEL_UID);
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(data, schema, { auth });
};

const validateQuery = async (data, ctx) => {
  const schema = strapi.getModel(FILE_MODEL_UID);
  const { auth } = ctx.state;

  return validate.contentAPI.query(data, schema, { auth });
};

const sanitizeQuery = async (data, ctx) => {
  const schema = strapi.getModel(FILE_MODEL_UID);
  const { auth } = ctx.state;

  return sanitize.contentAPI.query(data, schema, { auth });
};

// ** NOTE: I modified pagination with some tricks, please make sure to update here after Strapi V5 is released.
export const find = async (ctx) => {
  await validateQuery(ctx.query, ctx);
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
    "plugin::upload.file",
    params
  );

  const [files, count] = await strapi.db
    .query("plugin::upload.file")
    .findWithCount(query);

  const paginationInfo = getPaginationInfo(sanitizedQuery);
  const paginationResult = transformPaginationResponse(paginationInfo, count);

  const data = await Promise.all(
    files.map((user) => sanitizeOutput(user, ctx))
  );

  ctx.send({
    data,
    meta: {
      pagination: paginationResult,
    },
  });
};

export const update = async (ctx) => {
  const {
    params: { id },
    request: { body },
  } = ctx;

  const data = await validateUploadBody(body);

  const result = await getService("upload").updateFileInfo(id, data.fileInfo);

  ctx.body = await sanitizeOutput(result, ctx);
};
