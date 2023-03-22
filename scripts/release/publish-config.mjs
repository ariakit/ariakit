// @ts-check
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";

const packages = globSync("packages/*/package.json");

packages.forEach((filename) => {
  const contents = readFileSync(filename, "utf8");
  const json = JSON.parse(contents);
  const nextJson = { ...json, ...json.publishConfig };
  writeFileSync(filename, JSON.stringify(nextJson, null, 2));
});
