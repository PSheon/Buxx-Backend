import { yup, validateYupSchema } from "@strapi/utils";

const callbackSchema = yup.object({
  identifier: yup.string().required(),
  password: yup.string().required(),
});

const registerSchema = yup.object({
  email: yup.string().email().required(),
  username: yup.string().required(),
  password: yup.string().required(),
});

const sendEmailConfirmationSchema = yup.object({
  email: yup.string().email().required(),
});

const validateEmailConfirmationSchema = yup.object({
  confirmation: yup.string().required(),
});

const forgotPasswordSchema = yup
  .object({
    email: yup.string().email().required(),
  })
  .noUnknown();

const resetPasswordSchema = yup
  .object({
    password: yup.string().required(),
    passwordConfirmation: yup.string().required(),
    resetPasswordToken: yup.string().required(),
  })
  .noUnknown();

const changePasswordSchema = yup
  .object({
    currentPassword: yup.string().required(),
    newPassword: yup.string().required(),
    newPasswordConfirmation: yup
      .string()
      .required()
      .oneOf([yup.ref("newPassword")], "Passwords do not match"),
  })
  .noUnknown();

export const validateCallbackBody = validateYupSchema(callbackSchema);
export const validateRegisterBody = validateYupSchema(registerSchema);
export const validateSendEmailConfirmationBody = validateYupSchema(
  sendEmailConfirmationSchema
);
export const validateEmailConfirmationBody = validateYupSchema(
  validateEmailConfirmationSchema
);
export const validateForgotPasswordBody =
  validateYupSchema(forgotPasswordSchema);
export const validateResetPasswordBody = validateYupSchema(resetPasswordSchema);
export const validateChangePasswordBody =
  validateYupSchema(changePasswordSchema);
