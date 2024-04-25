import fs from "fs";
import readline from "readline";

export const getLastLines = (
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
