import { yup, validateYupSchema } from "@strapi/utils";

const signDepositHashBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  sender: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid EOA address")
    .required(),
  interestRate: yup
    .number()
    .min(2, "Should be greater than 2")
    .max(24, "Should be less than 24")
    .required(),
  startTime: yup.number().required(),
  principalDelayDays: yup.number().required(),
  durationDays: yup.number().required(),
});
export const validateDepositSignHashBody = validateYupSchema(
  signDepositHashBodySchema
);

const signClaimHashBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  sender: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid EOA address")
    .required(),
});
export const validateClaimSignHashBody = validateYupSchema(
  signClaimHashBodySchema
);
