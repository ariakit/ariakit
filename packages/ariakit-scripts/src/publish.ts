import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

interface PublishOptions {
  dryRun?: boolean;
}

interface PublishedPackage {
  name: string;
  version: string;
}

interface PublishSummary {
  publishedPackages?: Array<{
    name?: unknown;
    version?: unknown;
  }>;
}

interface PreState {
  mode?: unknown;
}

function getSummaryPath() {
  return resolve("pnpm-publish-summary.json");
}

function getPreStatePath() {
  return resolve(".changeset", "pre.json");
}

function removePublishSummary() {
  rmSync(getSummaryPath(), { force: true });
}

function fail(message: string) {
  console.error(message);
  process.exitCode = 1;
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.error) {
    console.error(result.error);
    return 1;
  }

  return result.status ?? 1;
}

function isPublishedPackage(pkg: {
  name?: unknown;
  version?: unknown;
}): pkg is PublishedPackage {
  return typeof pkg.name === "string" && typeof pkg.version === "string";
}

function readPublishedPackages() {
  const summaryPath = getSummaryPath();
  if (!existsSync(summaryPath)) return [];

  const summary: PublishSummary = JSON.parse(
    readFileSync(summaryPath, "utf-8"),
  );
  const packages = summary.publishedPackages ?? [];
  return packages.filter(isPublishedPackage);
}

function isInPreMode() {
  const preStatePath = getPreStatePath();
  if (!existsSync(preStatePath)) return false;

  const preState: PreState = JSON.parse(readFileSync(preStatePath, "utf-8"));
  return preState.mode === "pre";
}

function tagExists(tag: string) {
  const result = spawnSync(
    "git",
    ["rev-parse", "-q", "--verify", `refs/tags/${tag}`],
    { stdio: "ignore" },
  );
  return result.status === 0;
}

function createTag(tag: string) {
  if (tagExists(tag)) return;

  const status = run("git", ["tag", tag]);

  if (status !== 0) {
    process.exit(status);
  }
}

export function publish(options: PublishOptions = {}) {
  if (isInPreMode()) {
    fail("ariakit publish does not support Changesets pre mode yet.");
    return;
  }

  const publishArgs = options.dryRun ? ["--dry-run"] : [];
  removePublishSummary();

  const status = run("pnpm", [
    "publish",
    "-r",
    "--access",
    "public",
    "--no-git-checks",
    "--report-summary",
    ...publishArgs,
  ]);

  if (status !== 0) {
    process.exitCode = status;
    return;
  }

  const publishedPackages = readPublishedPackages();
  removePublishSummary();

  if (!publishedPackages.length) {
    console.warn("No unpublished projects to publish");
    return;
  }

  if (options.dryRun) return;

  console.log(`Creating git tag${publishedPackages.length > 1 ? "s" : ""}...`);

  for (const pkg of publishedPackages) {
    const tag = `${pkg.name}@${pkg.version}`;
    createTag(tag);
    console.log("New tag: ", tag);
  }
}
