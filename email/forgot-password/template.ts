import fs from "fs";
import path from "path";

export default {
  subject: "<%= subject %>",
  text: fs.readFileSync(
    path.resolve("email", "forgot-password", "content.txt"),
    "utf8"
  ),
  html: fs.readFileSync(
    path.resolve("email", "forgot-password", "content.html"),
    "utf8"
  ),
};
