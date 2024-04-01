import { winston } from "@strapi/logger";

import DailyRotateFile from "winston-daily-rotate-file";

module.exports = {
  transports: [
    new winston.transports.Console({
      level: "http",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
    }),
    new DailyRotateFile({
      level: "http",
      filename: "./.log/bloom_rwa_%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
    }),
  ],
};
