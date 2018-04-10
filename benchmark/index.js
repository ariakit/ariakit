const spawn = require("cross-spawn");
const { readdirSync } = require("fs");
const { join } = require("path");

function doBenchmark(filename) {
  const path = join(__dirname, "cases", filename);
  const binPath = join(__dirname, "../node_modules/.bin/react-benchmark");
  console.log(filename); // eslint-disable-line no-console
  return spawn.sync(binPath, [path], { stdio: "inherit" });
}

readdirSync(join(__dirname, "cases")).forEach(doBenchmark);
