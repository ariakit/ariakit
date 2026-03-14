import path from "node:path";

import {
  findPaths,
  getOptionalEnv,
  getRepositoryRoot,
  getRequiredEnv,
  removePaths,
  runCommand,
  runShellCommand,
} from "./lib/workflow.ts";

function shellEscape(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function testVisual(): void {
  const project = getRequiredEnv("PROJECT");
  const visualCommand = getRequiredEnv("VISUAL_COMMAND");
  const useVizzly = getOptionalEnv("USE_VIZZLY") === "true";

  if (useVizzly) {
    const parallelId = `${getRequiredEnv("GITHUB_RUN_ID")}-${getRequiredEnv("GITHUB_RUN_ATTEMPT")}`;
    const command = `${visualCommand} --project ${project} --grep @visual --pass-with-no-tests`;
    runCommand("npx", [
      "vizzly",
      "run",
      "--allow-no-token",
      `--parallel-id=${parallelId}`,
      command,
    ]);
    return;
  }

  runShellCommand(
    `${visualCommand} --project ${shellEscape(project)} --grep @visual --pass-with-no-tests -x`,
  );
}

function resetSnapshots(): void {
  const project = getRequiredEnv("PROJECT");
  const siteSourceDir = path.join(getRepositoryRoot(), "site", "src");
  const snapshotFiles = findPaths(siteSourceDir, (entryPath, isDirectory) => {
    if (isDirectory) {
      return false;
    }
    return (
      entryPath.includes(`${path.sep}__screenshots__${path.sep}`) &&
      entryPath.endsWith(`-${project}.png`)
    );
  });
  removePaths(snapshotFiles);
}

function packSnapshots(): void {
  const project = getRequiredEnv("PROJECT");
  const artifactsDir = getRequiredEnv("ARTIFACTS_DIR");
  const repoRoot = getRepositoryRoot();
  const siteSourceDir = path.join(repoRoot, "site", "src");
  const snapshotFiles = findPaths(siteSourceDir, (entryPath, isDirectory) => {
    if (isDirectory) {
      return false;
    }
    return (
      entryPath.includes(`${path.sep}__screenshots__${path.sep}`) &&
      entryPath.endsWith(`-${project}.png`)
    );
  }).map((entryPath) => path.relative(repoRoot, entryPath));

  if (snapshotFiles.length === 0) {
    return;
  }

  const archivePath = path.join(artifactsDir, `app-visual-${project}.tar.gz`);
  runCommand("mkdir", ["-p", artifactsDir]);
  runCommand("tar", ["-czf", archivePath, ...snapshotFiles], { cwd: repoRoot });
}

const command = process.argv[2];

if (command === "test-visual") {
  testVisual();
} else if (command === "reset-snapshots") {
  resetSnapshots();
} else if (command === "pack-snapshots") {
  packSnapshots();
} else {
  throw new Error(`Unknown command: ${command}`);
}
