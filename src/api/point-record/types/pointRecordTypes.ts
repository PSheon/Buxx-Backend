import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

export interface ILogPointRecordType {
  type:
    | "StakeShare"
    | "TeamBonus"
    | "JoinReferral"
    | "VerifyWallet"
    | "DailyCheck"
    | "CompleteTask"
    | "Referral";
  user: UserType;
  earningExp: number;
  earningPoints: number;
  receipt: Record<string, any>;
}
