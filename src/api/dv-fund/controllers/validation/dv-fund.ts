import { yup, validateYupSchema } from "@strapi/utils";

const signDepositHashBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  user: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid EOA address")
    .required(),
  amount: yup.string().required(),
  interestRate: yup.string().required(),
  principalDelayDays: yup.string().required(),
  durationDays: yup.string().required(),
});
export const validateDepositSignHashBody = validateYupSchema(
  signDepositHashBodySchema
);

const signClaimHashBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  user: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid EOA address")
    .required(),
});
export const validateClaimSignHashBody = validateYupSchema(
  signClaimHashBodySchema
);
