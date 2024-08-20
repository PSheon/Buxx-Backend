import Strapi from "@strapi/strapi";
import * as fs from "fs";

let instance;

export async function setupStrapi() {
  if (!instance) {
    // ** very important, this tells
    // ** where to find the transpiled code from typescript
    await Strapi({ distDir: "./dist" }).load();

    instance = strapi;
    await instance.server.mount();
  }
  return instance;
}

export async function cleanupStrapi() {
  const dbSettings = strapi.config.get("database.connection") as any;

  // ** close server to release the db-file
  await strapi.server.httpServer.close();
  await strapi.db.connection.destroy();

  // ** delete test database after all tests have completed

  if (dbSettings && dbSettings.connection && dbSettings.connection.filename) {
    const tmpDbFile = dbSettings.connection.filename;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
}
