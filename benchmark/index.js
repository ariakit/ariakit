const spawn = require("cross-spawn");
const { readdirSync } = require("fs");
const { join } = require("path");

function doBenchmark(filename) {
  const path = join(__dirname, "cases", filename);
  const binPath = join(__dirname, "../node_modules/.bin/react-benchmark");
  console.log(filename);
  return spawn.sync(binPath, [path], { stdio: "inherit" });
}

readdirSync(join(__dirname, "cases"))
  .filter(x => x === "reas-box.js")
  .forEach(doBenchmark);
