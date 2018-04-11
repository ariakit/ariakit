const spawn = require("cross-spawn");
const { readdirSync } = require("fs");
const { join } = require("path");

function doBenchmark(filename) {
  const path = join(__dirname, "cases", filename);
  const binPath = join(__dirname, "../node_modules/.bin/react-benchmark");
  console.log(filename); // eslint-disable-line no-console
  return spawn.sync(binPath, [path], { stdio: "inherit" });
}

let cases = readdirSync(join(__dirname, "cases"));
const hasOnly = cases.find(x => x.indexOf(".only") >= 0);
const hasSkip = cases.find(x => x.indexOf(".skip") >= 0);

if (hasOnly) {
  cases = cases.filter(x => x.indexOf(".only") >= 0);
} else if (hasSkip) {
  cases = cases.filter(x => x.indexOf(".skip") === -1);
}

cases.forEach(doBenchmark);
