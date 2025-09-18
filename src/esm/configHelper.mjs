// configHelper.mjs
import fs from "fs";
import { fwrite } from "./autoFileSysModule.mjs"; // certifique-se de que autoFileSysModule também seja mjs

export function configExist() {
  if (!fs.existsSync("config.json")) {
    fwrite("config.json", {});
  }
}
