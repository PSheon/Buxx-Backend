/**
 * Socket.io Bootstrap
 */

import fs from "fs";
import path from "path";

import { Strapi } from "@strapi/strapi";

import { format } from "date-fns";
import { Server } from "socket.io";
import { os, cpu, mem, drive, proc } from "node-os-utils";

import { getLastLines } from "./helpers";
import { SystemStatusType } from "../../../types/socketTypes";

export const socketIOBootstrap = (strapi: Strapi) => {
  const KEEP_DATA_POINTS = 12;
  const SYSTEM_STATUS: SystemStatusType = {
    os: {
      name: "",
      type: "",
      arch: "",
      nodeVersion: "",
    },
    db: {
      name: "",
    },
    cpu: {
      model: "",
      count: 0,
      usagePercentageHistory: [],
    },
    memory: {
      totalGb: 0,
      usagePercentageHistory: [],
    },
    drive: {
      totalGb: 0,
      usedGb: 0,
    },
    process: {
      totalCountHistory: [],
    },
    log: {
      system: "",
    },
  };

  const io = require("socket.io")(strapi.server.httpServer, {
    cors: {
      origin: (process.env.FRONTEND_URL as string) || "http://localhost:8080",
    },
  });

  const loadStaticStatus = async (): Promise<void> => {
    // @ts-ignore NOTE: This is a hack cause the typings are wrong
    const osName = (await os.oos()) as string;
    const osType = (await os.type()) as string;
    const osArch = (await os.arch()) as string;
    const nodeVersion = process.version;
    const dbName = strapi.config.get("database.connection.client") as string;
    const cpuModel = (await cpu.model()) as string;
    const cpuCount = (await cpu.count()) as number;
    const memoryTotalInBytes = (await mem.totalMem()) as number;
    const driveInfo = (await drive.info("/")) as {
      totalGb: string;
    };
    const systemLogPath = path.resolve(
      __dirname,
      `../../../../.log/buxx_rwa_${format(new Date(), "yyyy-MM-dd-HH")}.log`
    );
    const systemLog = fs.existsSync(systemLogPath)
      ? await getLastLines(
          path.resolve(
            __dirname,
            `../../../../.log/buxx_rwa_${format(
              new Date(),
              "yyyy-MM-dd-HH"
            )}.log`
          ),
          20
        )
      : "not found";

    SYSTEM_STATUS.os = {
      ...SYSTEM_STATUS.os,
      name: osName,
      type: osType,
      arch: osArch,
      nodeVersion,
    };
    SYSTEM_STATUS.db = {
      ...SYSTEM_STATUS.db,
      name: dbName,
    };
    SYSTEM_STATUS.cpu = {
      ...SYSTEM_STATUS.cpu,
      model: cpuModel,
      count: cpuCount,
    };
    SYSTEM_STATUS.memory = {
      ...SYSTEM_STATUS.memory,
      totalGb: Math.round((memoryTotalInBytes / 1024 ** 3) * 100) / 100,
    };
    SYSTEM_STATUS.drive = {
      ...SYSTEM_STATUS.drive,
      totalGb: parseFloat(driveInfo.totalGb),
    };
    SYSTEM_STATUS.log = {
      ...SYSTEM_STATUS.log,
      system: systemLog,
    };
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      await strapi.service("plugin::users-permissions.jwt").verify(token);

      next();
    } catch (error) {
      next(new Error("Socket not authorized"));
    }
  });

  /* System Status Loop */
  loadStaticStatus();

  setInterval(async () => {
    // Update System Status
    const currentCpuUsagePercentageHistory =
      SYSTEM_STATUS.cpu.usagePercentageHistory;
    const currentMemoryUsagePercentageHistory =
      SYSTEM_STATUS.memory.usagePercentageHistory;
    const currentProcessTotalCountHistory =
      SYSTEM_STATUS.process.totalCountHistory;

    const cpuUsagePercentage = await cpu.usage();
    const memoryUsageInfo = (await mem.info()) as {
      usedMemPercentage: number;
    };
    const driveUsedInfo = (await drive.used("/")) as {
      usedGb: string;
    };
    const processTotalCount = await proc.totalProcesses();
    const newSystemLogPath = path.resolve(
      __dirname,
      `../../../../.log/buxx_rwa_${format(new Date(), "yyyy-MM-dd-HH")}.log`
    );
    const newSystemLog = fs.existsSync(newSystemLogPath)
      ? await getLastLines(
          path.resolve(
            __dirname,
            `../../../../.log/buxx_rwa_${format(
              new Date(),
              "yyyy-MM-dd-HH"
            )}.log`
          ),
          20
        )
      : "not found";

    SYSTEM_STATUS.cpu.usagePercentageHistory = [
      ...currentCpuUsagePercentageHistory,
      cpuUsagePercentage,
    ].slice(-KEEP_DATA_POINTS);
    SYSTEM_STATUS.memory.usagePercentageHistory = [
      ...currentMemoryUsagePercentageHistory,
      memoryUsageInfo.usedMemPercentage,
    ].slice(-KEEP_DATA_POINTS);
    SYSTEM_STATUS.drive.usedGb = parseFloat(driveUsedInfo.usedGb);
    SYSTEM_STATUS.process.totalCountHistory = [
      ...currentProcessTotalCountHistory,
      typeof processTotalCount === "string"
        ? parseInt(processTotalCount)
        : processTotalCount,
    ].slice(-KEEP_DATA_POINTS);
    SYSTEM_STATUS.log.system = newSystemLog;
  }, 5 * 1_000);

  io.on("connection", async (socket: Server) => {
    /* Dashboard: OS Info */
    socket.on("dashboard:get-os-info", async () => {
      socket.emit("dashboard:os-info", SYSTEM_STATUS.os);
    });

    /* Dashboard: DB Info */
    socket.on("dashboard:get-db-info", async () => {
      socket.emit("dashboard:db-info", SYSTEM_STATUS.db);
    });

    /* Dashboard: CPU Info */
    socket.on("dashboard:get-cpu-info", async () => {
      socket.emit("dashboard:cpu-info", SYSTEM_STATUS.cpu);
    });

    /* Dashboard: Memory Info */
    socket.on("dashboard:get-mem-info", async () => {
      socket.emit("dashboard:mem-info", SYSTEM_STATUS.memory);
    });

    /* Dashboard: Drive Info */
    socket.on("dashboard:get-drive-info", async () => {
      socket.emit("dashboard:drive-info", SYSTEM_STATUS.drive);
    });

    /* Dashboard: Processes Info */
    socket.on("dashboard:get-proc-info", async () => {
      socket.emit("dashboard:proc-info", SYSTEM_STATUS.process);
    });

    /* Dashboard: System Log */
    socket.on(
      "dashboard:get-system-log",
      // async ({ keepLines = 20 }: { keepLines: number }) => {
      //   const logPath = path.resolve(
      //     __dirname,
      //     `../../../../.log/buxx_rwa_${format(
      //       new Date(),
      //       "yyyy-MM-dd-HH"
      //     )}.log`
      //   );
      //   if (fs.existsSync(logPath)) {
      //     const log = await getLastLines(logPath, keepLines);

      //     socket.emit("dashboard:system-log", { log });
      //   } else {
      //     socket.emit("dashboard:system-log", { log: "not found" });
      //   }
      // }
      async () => {
        socket.emit("dashboard:system-log", SYSTEM_STATUS.log);
      }
    );

    /* Disconnect */
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
