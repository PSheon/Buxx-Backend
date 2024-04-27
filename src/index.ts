import { socketIOBootstrap } from "./bootstrap/socket-io";
import { databaseLifecycleBootstrap } from "./bootstrap/database-lifecycle";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    /* Socket.io Bootstrap */
    socketIOBootstrap(strapi);

    /* Database Lifecycle Bootstrap */
    databaseLifecycleBootstrap(strapi);
  },
};
