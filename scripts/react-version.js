import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const lockfilePath = path.join(rootDir, "pnpm-lock.yaml");
const backupDir = path.join("/tmp", "ariakit-react-version-backup");
const backupPackageJsonPath = path.join(backupDir, "package.json");
const backupLockfilePath = path.join(backupDir, "pnpm-lock.yaml");

const versionsByTarget = {
  react17: {
    react: "^17.0.0",
    "react-dom": "^17.0.0",
    "@testing-library/react": "^12.0.0",
    "@testing-library/dom": "^8.0.0",
  },
  reactnext: {
    react: "next",
    "react-dom": "next",
  },
};

function ensureBackupDir() {
  fs.mkdirSync(backupDir, { recursive: true });
}

function readPackageJson() {
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

function writePackageJson(packageJson) {
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

function backupFiles() {
  ensureBackupDir();
  fs.copyFileSync(packageJsonPath, backupPackageJsonPath);
  fs.copyFileSync(lockfilePath, backupLockfilePath);
}

function restoreFiles() {
  if (fs.existsSync(backupPackageJsonPath)) {
    fs.copyFileSync(backupPackageJsonPath, packageJsonPath);
  }
  if (fs.existsSync(backupLockfilePath)) {
    fs.copyFileSync(backupLockfilePath, lockfilePath);
  }
}

function setVersions(target) {
  const versions = versionsByTarget[target];
  if (!versions) {
    throw new Error(`Invalid target: ${target}`);
  }
  backupFiles();
  const packageJson = readPackageJson();
  for (const [dependency, version] of Object.entries(versions)) {
    if (packageJson.dependencies?.[dependency]) {
      packageJson.dependencies[dependency] = version;
    }
  }
  writePackageJson(packageJson);
}

function main() {
  const [command, target] = process.argv.slice(2);
  if (command === "set") {
    if (!target) {
      throw new Error("Target is required");
    }
    setVersions(target);
    return;
  }
  if (command === "restore") {
    restoreFiles();
    return;
  }
  throw new Error(`Invalid command: ${command}`);
}

main();
