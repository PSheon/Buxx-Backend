import { Context } from "koa";

import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

type IAccessAction =
  | "Login"
  | "ForgotPassword"
  | "ResetPassword"
  | "ChangePassword"
  | "VerifyEmail";

export type ILogAccessType = {
  ctx: Context;
  user: UserType;
  status: boolean;
  action: IAccessAction;
  responseMessage: string;
};
