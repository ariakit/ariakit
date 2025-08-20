#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const version = process.argv[2];
if (!version) {
  console.error("Usage: node test-react-version.js <version>");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const backupPath = path.join(rootDir, "package.json.backup");

try {
  // Backup original package.json
  const originalPackageJson = fs.readFileSync(packageJsonPath, "utf8");
  fs.writeFileSync(backupPath, originalPackageJson);

  // Parse and modify package.json
  const packageJson = JSON.parse(originalPackageJson);

  if (version === "next") {
    packageJson.dependencies.react = "next";
    packageJson.dependencies["react-dom"] = "next";
  } else if (version === "17") {
    packageJson.dependencies.react = "17.0.2";
    packageJson.dependencies["react-dom"] = "17.0.2";
    packageJson.dependencies["@testing-library/react"] = "12.1.5";
    packageJson.dependencies["@testing-library/dom"] = "8.20.1";
  } else {
    console.error('Unsupported React version. Use "17" or "next"');
    process.exit(1);
  }

  // Write modified package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`Installing React ${version}...`);
  execSync("pnpm install --no-frozen-lockfile", {
    stdio: "inherit",
    cwd: rootDir,
  });

  console.log(`Running tests with React ${version}...`);
  execSync("pnpm test --run", { stdio: "inherit", cwd: rootDir });
} catch (error) {
  console.error(`Error testing React ${version}:`, error.message);
  process.exit(1);
} finally {
  // Always restore the original package.json
  if (fs.existsSync(backupPath)) {
    console.log("Restoring original package.json...");
    fs.copyFileSync(backupPath, packageJsonPath);
    fs.unlinkSync(backupPath);

    console.log("Restoring original dependencies...");
    execSync("pnpm install --no-frozen-lockfile", {
      stdio: "inherit",
      cwd: rootDir,
    });
  }
}
