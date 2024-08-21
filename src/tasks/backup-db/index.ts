/**
 * Backup DB Task
 */

import { Strapi } from "@strapi/strapi";
import fs from "fs";
import path from "path";
import { exec as execCallback } from "child_process";
import { promisify } from "util";

import format from "date-fns/format";
import subDays from "date-fns/subDays";

export const backupDB = async ({ strapi }: { strapi: Strapi }) => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  // ** Step. Prepare backup path
  const exec = promisify(execCallback);
  const BACKUP_KEEP_DAYS = 14;
  const BACKUP_PATH = path.resolve(__dirname, "../../../../", "backup");
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
  }

  // ** Step. Remove outdated backup files
  const backupLogEntities = await strapi
    .query("api::backup-log.backup-log")
    .findMany({
      filters: {
        createdAt: {
          $lte: subDays(new Date(), BACKUP_KEEP_DAYS),
        },
        status: "Fulfilled",
      },
    });
  if (backupLogEntities.length > 0) {
    for await (const backupLogEntity of backupLogEntities) {
      try {
        fs.unlinkSync(backupLogEntity.backupFilePath);
        await strapi.query("api::backup-log.backup-log").update({
          where: { id: backupLogEntity.id },
          data: {
            message: "Remove outdated backup file succeed",
            status: "Deleted",
          },
        });
      } catch (error) {
        await strapi.query("api::backup-log.backup-log").create({
          data: {
            message: `Remove outdated backup file failed: ${error.message}`,
            status: "Rejected",
          },
        });
      }
    }
  }

  // ** Step. Execute backup command
  const backupFilePath = path.resolve(
    BACKUP_PATH,
    `db_${format(new Date(), "yyyy-MM-dd_HH:mm:ss")}_backup`
  );
  const backupCommand = `npm run strapi export -- --no-encrypt --file ${backupFilePath}`;

  try {
    const { stdout, stderr } = await exec(backupCommand);
    if (stderr) {
      await strapi.query("api::backup-log.backup-log").create({
        data: {
          message: `Backup error: ${stderr}`,
          backupFilePath,
          status: "Rejected",
        },
      });
    } else {
      await strapi.query("api::backup-log.backup-log").create({
        data: {
          message: `Backup succeed: ${stdout}`,
          backupFilePath,
          status: "Fulfilled",
        },
      });
    }
  } catch (error) {
    await strapi.query("api::backup-log.backup-log").create({
      data: {
        message: `Backup Failed: ${error.message}`,
        backupFilePath,
        status: "Rejected",
      },
    });
  }
};
