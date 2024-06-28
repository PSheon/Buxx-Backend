import { yup, validateYupSchema } from "@strapi/utils";

const signSFTHashBodySchema = yup.object().shape({
  contractName: yup.string().required(),
  minterAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid address")
    .required(),
  slotId: yup.string().required(),
  value: yup.string().required(),
});
export const validateSFTSignHashBody = validateYupSchema(signSFTHashBodySchema);

const signVaultHashBodySchema = yup.object().shape({
  contractName: yup.string().required(),
  stakerAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  tokenId: yup.string().required(),
  packageId: yup.number().required(),
  balance: yup.string().required(),
  periodInDays: yup.number().required(),
  apy: yup.number().required(),
});
export const validateVaultSignHashBody = validateYupSchema(
  signVaultHashBodySchema
);
