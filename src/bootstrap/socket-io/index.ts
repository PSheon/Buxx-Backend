/**
 * Socket.io Bootstrap
 */

import fs from "fs";
import path from "path";
import readline from "readline";

import { Strapi } from "@strapi/strapi";

import { format } from "date-fns";
import { Server } from "socket.io";
import { os, cpu, mem, drive, proc } from "node-os-utils";

const getLastLines = (
  logPath: string,
  linesNumberToGet: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(logPath),
    });

    let lines = [];
    rl.on("line", (line) => {
      lines.push(line);

      if (lines.length > linesNumberToGet) {
        lines.shift();
      }
    });

    rl.on("error", reject);

    rl.on("close", function () {
      resolve(lines.join("\n"));
    });
  });
};

export const socketIOBootstrap = (strapi: Strapi) => {
  const io = require("socket.io")(strapi.server.httpServer, {
    cors: {
      origin: (process.env.FRONTEND_URL as string) || "http://localhost:8080",
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      await strapi.service("plugin::users-permissions.jwt").verify(token);

      next();
    } catch (error) {
      next(new Error("Socket not authorized"));
    }
  });

  io.on("connection", async (socket: Server) => {
    /* Dashboard: OS Info */
    socket.on("dashboard:get-os-info", async () => {
      const osName = await os.oos();
      const osType = await os.type();
      const osArch = await os.arch();
      const nodeVersion = process.version;

      socket.emit("dashboard:os-info", {
        osName,
        osType,
        osArch,
        nodeVersion,
      });
    });

    /* Dashboard: DB Info */
    socket.on("dashboard:get-db-info", async () => {
      const dbName = strapi.config.get("database.connection.client");

      socket.emit("dashboard:db-info", { dbName });
    });

    /* Dashboard: CPU Usage */
    socket.on("dashboard:get-cpu-usage", async () => {
      const cpuUsage = await cpu.usage();
      socket.emit("dashboard:cpu-usage", cpuUsage);
    });

    /* Dashboard: Memory Usage */
    socket.on("dashboard:get-mem-usage", async () => {
      const memUsage = await mem.info();
      socket.emit("dashboard:mem-usage", memUsage);
    });

    /* Dashboard: Drive Usage */
    socket.on("dashboard:get-drive-usage", async () => {
      const driveUsage = await drive.info("/");
      socket.emit("dashboard:drive-usage", driveUsage);
    });

    /* Dashboard: Processes Usage */
    socket.on("dashboard:get-proc-usage", async () => {
      const totalProcesses = await proc.totalProcesses();
      socket.emit("dashboard:proc-usage", { totalProcesses });
    });

    /* Dashboard: System Log */
    socket.on(
      "dashboard:get-system-log",
      async ({ keepLines = 20 }: { keepLines: number }) => {
        const logPath = path.resolve(
          __dirname,
          `../../../../.log/bloom_rwa_${format(
            new Date(),
            "yyyy-MM-DD-HH"
          )}.log`
        );
        if (fs.existsSync(logPath)) {
          const log = await getLastLines(logPath, keepLines);

          socket.emit("dashboard:system-log", { log });
        } else {
          socket.emit("dashboard:system-log", { log: "not found" });
        }
      }
    );

    /* Disconnect */
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
