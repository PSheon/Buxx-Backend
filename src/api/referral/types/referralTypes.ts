import { Context } from "koa";
import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

export interface ILogReferralType {
  ctx: Context;
  referrer: UserType;
  referredId: number;
}
