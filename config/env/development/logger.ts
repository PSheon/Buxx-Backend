import { winston } from "@strapi/logger";

import DailyRotateFile from "winston-daily-rotate-file";

const getRequestId = (info: winston.Logform.TransformableInfo): string => {
  const xRequestId = info["x-request-id"];
  const xTraceId = info["x-school-trace-id"];

  let output = "";

  if (xRequestId && xRequestId !== "-" && xTraceId && xTraceId !== "-") {
    output = JSON.stringify({
      "x-request-id": xRequestId,
      "x-school-trace-id": xTraceId,
    });
  }

  return output;
};

module.exports = {
  transports: [
    new winston.transports.Console({
      level: "silly",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.align(),
        winston.format.printf(
          (info) =>
            `[${info.timestamp}] ${info.level}: ${info.message} ${getRequestId(
              info
            )}`
        )
      ),
    }),
    new DailyRotateFile({
      level: "http",
      filename: "./.log/buxx_rwa_%DATE%.log",
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
