import type { UserType } from "../../../extensions/users-permissions/types/userTypes";

type IStatus = "Pending" | "Fulfilled" | "Rejected";
type IActivityAction = "Create" | "Update" | "Delete";
type IContentType = "Fund";

export type ILogActivityType = {
  status: IStatus;
  action: IActivityAction;
  refContentType: IContentType;
  refId: number;
  message: string;
  payload: Record<string, string | number>;
  date: Date;
  user: UserType;
  isHighlighted: boolean;
};
