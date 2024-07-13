import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

export interface ILogPointRecordType {
  type:
    | "StakeShare"
    | "TeamBonus"
    | "JoinReferral"
    | "DailyCheck"
    | "Referral";
  user: UserType;
  earningExp: number;
  earningPoints: number;
  receipt: Record<string, any>;
}
