import { yup, validateYupSchema } from "@strapi/utils";

const updateMeOneBodySchema = yup.object().shape({
  isSeen: yup.boolean(),
});

export const validateUpdateMeOneBody = validateYupSchema(updateMeOneBodySchema);
