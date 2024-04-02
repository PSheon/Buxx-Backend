import {
  callback,
  changePassword,
  resetPassword,
  forgotPassword,
  register,
  emailConfirmation,
} from "./server/controllers/auth";
import { update, find, findOne, updateMe } from "./server/controllers/user";
import userService from "./server/services/user";

export default (plugin) => {
  /* Controllers */
  plugin.controllers.auth.callback = callback;
  plugin.controllers.auth.changePassword = changePassword;
  plugin.controllers.auth.resetPassword = resetPassword;
  plugin.controllers.auth.forgotPassword = forgotPassword;
  plugin.controllers.auth.register = register;
  plugin.controllers.auth.emailConfirmation = emailConfirmation;

  plugin.controllers.user.update = update;
  plugin.controllers.user.find = find;
  plugin.controllers.user.findOne = findOne;
  plugin.controllers.user.updateMe = updateMe;

  /* Services */
  plugin.services.user = userService;

  /* Routes */
  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: {
      policies: [],
      prefix: "",
    },
  });

  return plugin;
};
