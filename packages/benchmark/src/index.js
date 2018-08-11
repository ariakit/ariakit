/* eslint-disable no-console */
const spawn = require("cross-spawn");
const { readdirSync } = require("fs");
const { join } = require("path");

function doBenchmark(filename) {
  const path = join(__dirname, "cases", filename);
  const binPath = join(__dirname, "../node_modules/.bin/react-benchmark");
  const prettyName = filename.replace(/[.]js/, "").replace("-", " ");
  console.log(prettyName);
  return spawn.sync(binPath, [path], { stdio: "inherit" });
}

let cases = readdirSync(join(__dirname, "cases"));
const request = process.argv.slice(2);

if (request.length) cases = cases.filter(x => x.indexOf(request) >= 0);

console.log(`🏃  Benchmarking ${request.length ? request : "all"}`);
if (!cases.length) console.warn(`⚠️  Benchmark not found: ${request}`);
cases.forEach(doBenchmark);
