// @ts-check
import { readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { writeDevPackage } from "./utils.mjs";

const packagesPath = fileURLToPath(new URL("../../packages", import.meta.url));
const packages = readdirSync(packagesPath)
  .filter((name) => name !== ".DS_Store")
  .map((name) => join(packagesPath, name));

packages.forEach(writeDevPackage);
