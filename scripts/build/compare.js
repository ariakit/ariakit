import * as fs from "node:fs";
import * as path from "node:path";

// find latest two reports and compare
async function main() {
  const benchmarksDir = path.resolve("./.benchmarks");
  const dirents = fs.readdirSync(benchmarksDir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (!dirent.isFile() || !dirent.name.endsWith(".json")) continue;
  }
}

main();
