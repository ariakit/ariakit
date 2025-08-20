#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [, , version] = process.argv;

if (!version) {
  console.error("Usage: node scripts/react-version.js <version>");
  process.exit(1);
}

const packageJsonPath = "package.json";
const originalContent = readFileSync(packageJsonPath, "utf8");

try {
  // Modify package.json with new React version
  const pkg = JSON.parse(originalContent);
  const testingLibraryVersion = version === "17" ? "12" : "16.0.1";
  const testingLibraryDomVersion = version === "17" ? "8" : "10.4.0";

  pkg.dependencies.react = version === "next" ? version : version;
  pkg.dependencies["react-dom"] = version === "next" ? version : version;
  pkg.dependencies["@testing-library/react"] = testingLibraryVersion;
  pkg.dependencies["@testing-library/dom"] = testingLibraryDomVersion;

  writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

  // Run pnpm install
  console.log(`Installing React ${version}...`);
  execSync("pnpm install --no-frozen-lockfile", { stdio: "inherit" });
} catch (error) {
  console.error(
    "Error:",
    error instanceof Error ? error.message : String(error),
  );
  // Always restore original package.json on error
  writeFileSync(packageJsonPath, originalContent);
  process.exit(1);
} finally {
  // Always restore original package.json
  writeFileSync(packageJsonPath, originalContent);
  console.log("Restored original package.json");
}
