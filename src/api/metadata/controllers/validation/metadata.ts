import { yup, validateYupSchema } from "@strapi/utils";

const getContractMetadataBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  contractAddressConfirm: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
});
export const validateGetContractMetadataBody = validateYupSchema(
  getContractMetadataBodySchema
);

const getSlotMetadataBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  slotId: yup.string().required(),
});
export const validateGetSlotMetadataBody = validateYupSchema(
  getSlotMetadataBodySchema
);

const getTokenMetadataBodySchema = yup.object().shape({
  contractAddress: yup
    .string()
    .matches(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid contract address")
    .required(),
  tokenId: yup.string().required(),
});
export const validateGetTokenMetadataBody = validateYupSchema(
  getTokenMetadataBodySchema
);
