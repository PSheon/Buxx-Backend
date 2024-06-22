import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

export interface ILogPointRecordType {
  type: "StakeShare" | "TeamBonus" | "DailyCheck" | "CompleteTask" | "Referral";
  user: UserType;
  earningExp: number;
  earningPoints: number;
  receipt: Record<string, any>;
}
