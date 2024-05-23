import { yup, validateYupSchema } from "@strapi/utils";

const signHashBodySchema = yup.object().shape({
  contractName: yup.string().required(),
  minterAddress: yup.string().required(),
  slotId: yup.number().required(),
  value: yup.string().required(),
});

export const validateSignHashBody = validateYupSchema(signHashBodySchema);
