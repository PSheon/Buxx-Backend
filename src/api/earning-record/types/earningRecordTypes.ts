import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

export interface ILogEarningRecordType {
  type:
    | "ClaimReward"
    | "TeamStakeShare"
    | "JoinReferral"
    | "ReferralLevelUp"
    | "DailyCheck"
    | "Referral"
    | "MarketingCampaign";
  user: UserType;
  earningExp: number;
  earningPoints: number;
  receipt: Record<string, any>;
}
