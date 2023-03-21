// @ts-check
import { readFileSync, writeFileSync } from "fs";
import spawn from "cross-spawn";
import { globSync } from "glob";

/** @param {NodeJS.ExitListener} callback */
function onExit(callback) {
  process.on("exit", callback);
  process.on("SIGINT", callback);
  process.on("SIGUSR1", callback);
  process.on("SIGUSR2", callback);
  process.on("uncaughtException", callback);
}

spawn.sync("npm", ["run", "build"], { stdio: "inherit" });

const packages = globSync("packages/*/package.json");

/** @type {Record<string, string>} */
const prevPackages = {};

// Restore package.json
onExit(() => {
  Object.entries(prevPackages).forEach(([filename, contents]) => {
    writeFileSync(filename, contents);
  });
});

// Temporarily overwrite fields in package.json using publishConfig
packages.forEach((filename) => {
  const contents = readFileSync(filename, "utf8");
  prevPackages[filename] = contents;
  const json = JSON.parse(contents);
  const nextJson = { ...json, ...json.publishConfig };
  writeFileSync(filename, JSON.stringify(nextJson, null, 2));
});

spawn.sync("npx", ["changeset", "publish"], { stdio: "inherit" });
