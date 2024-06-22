import { yup, validateYupSchema } from "@strapi/utils";

const joinReferralSchema = yup.object().shape({
  referralId: yup
    .string()
    .matches(/^[23456789A-HJ-NP-Z]{6}$/, "Invalid referral code")
    .required(),
});
export const validateJoinReferralBody = validateYupSchema(joinReferralSchema);
