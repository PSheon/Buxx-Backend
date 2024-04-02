import fs from "fs";
import path from "path";

export default {
  subject: "<%= subject %>",
  text: fs.readFileSync(
    path.resolve("email", "welcome", "content.txt"),
    "utf8"
  ),
  html: fs.readFileSync(
    path.resolve("email", "welcome", "content.html"),
    "utf8"
  ),
};
