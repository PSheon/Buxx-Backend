import { find, update } from "./server/controllers/content-api";

export default (plugin) => {
  /* Controllers */
  plugin.controllers["content-api"].find = find;
  plugin.controllers["content-api"].update = update;

  /* Routes */
  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/files/:id",
    handler: "content-api.update",
  });

  return plugin;
};
