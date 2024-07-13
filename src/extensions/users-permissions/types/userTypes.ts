export type UserType = {
  id: number;
  provider: string;
  email: string;
  username: string;
  exp: number;
  points: number;
  referralCode: string;
  blocked: boolean;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: {
    id: number;
    name: string;
    url: string;
  };
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
};
