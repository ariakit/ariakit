import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  getRepositoryRoot,
  getRequiredEnv,
  runCommand,
  setOutput,
} from "./lib/workflow.ts";

interface ChangesetRelease {
  name: string;
}

interface ChangesetStatus {
  releases: ChangesetRelease[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseChangesetStatus(text: string): ChangesetStatus {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value) || !Array.isArray(value.releases)) {
    throw new Error("Invalid changeset status output.");
  }
  const releases = value.releases.flatMap((release) => {
    if (!isRecord(release) || typeof release.name !== "string") {
      return [];
    }
    return [{ name: release.name }];
  });
  return { releases };
}

function readPackageName(packageJsonPath: string): string {
  const packageText = readFileSync(packageJsonPath, "utf8");
  const packageData: unknown = JSON.parse(packageText);
  if (!isRecord(packageData) || typeof packageData.name !== "string") {
    throw new Error(`Invalid package.json file: ${packageJsonPath}`);
  }
  return packageData.name;
}

function getChangesetStatus(): void {
  const baseRef = getRequiredEnv("BASE_REF");
  try {
    runCommand("npx", [
      "changeset",
      "status",
      `--since=${baseRef}`,
      "--output",
      "changes.json",
    ]);
    setOutput("has-changesets", "true");
  } catch {
    setOutput("has-changesets", "false");
  }
}

function computeAffectedPackages(): void {
  const repoRoot = getRepositoryRoot();
  const changes = parseChangesetStatus(
    readFileSync(path.join(repoRoot, "changes.json"), "utf8"),
  );
  const packagesDir = path.join(repoRoot, "packages");
  const packageDirectories = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join("packages", entry.name));

  const packageMap = new Map<string, string>();

  for (const directory of packageDirectories) {
    const packageName = readPackageName(
      path.join(repoRoot, directory, "package.json"),
    );
    packageMap.set(packageName, directory);
  }

  const affectedPackages = changes.releases.flatMap((release) => {
    const affectedPackage = packageMap.get(release.name);
    if (!affectedPackage) {
      return [];
    }
    return [affectedPackage];
  });

  setOutput("affected-packages", JSON.stringify(affectedPackages));
}

function publishPreview(): void {
  const affectedPackagesText = getRequiredEnv("AFFECTED_PACKAGES");
  const affectedPackages: unknown = JSON.parse(affectedPackagesText);
  if (
    !Array.isArray(affectedPackages) ||
    !affectedPackages.every((value) => typeof value === "string")
  ) {
    throw new Error("AFFECTED_PACKAGES must be a JSON array of strings.");
  }
  if (affectedPackages.length === 0) {
    console.log("No affected packages to publish");
    return;
  }
  runCommand("npx", [
    "pkg-pr-new",
    "publish",
    "--compact",
    "--template",
    "./templates/*",
    ...affectedPackages,
  ]);
}

const command = process.argv[2];

if (command === "get-changeset-status") {
  getChangesetStatus();
} else if (command === "compute-affected-packages") {
  computeAffectedPackages();
} else if (command === "publish-preview") {
  publishPreview();
} else {
  throw new Error(`Unknown command: ${command}`);
}
