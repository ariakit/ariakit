#!/usr/bin/env node --experimental-strip-types
import fs from "node:fs";
import path from "node:path";
import type { DiffFile, DiffSummary } from "./collect-visual-diffs.ts";

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function normalizeSlashes(filePath: string) {
  return filePath.split(path.sep).join("/");
}

function rewriteAndCopyFromArtifacts(
  artifactsRootDir: string,
  artifactName: string,
  originalPath: string,
  outputRootDir: string,
) {
  const match = originalPath.match(/[\\/]site[\\/]test-results[\\/](.*)$/);
  if (!match) return "";
  const relativeRest = match[1] as string;
  const relativeOutput = path.join("test-results", artifactName, relativeRest);
  const sourcePath = path.join(
    artifactsRootDir,
    artifactName,
    "site",
    "test-results",
    relativeRest,
  );
  const destinationPath = path.join(outputRootDir, relativeOutput);
  ensureDir(path.dirname(destinationPath));
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    return normalizeSlashes(relativeOutput);
  }
  return "";
}

function rewriteAndCopyFromRepo(originalPath: string, outputRootDir: string) {
  const match = originalPath.match(
    /[\\/]site[\\/]src[\\/]tests[\\/]screenshots[\\/](.*)$/,
  );
  if (!match) return "";
  const relativeRest = match[1] as string;
  const relativeOutput = path.join("baselines", relativeRest);
  const sourcePath = path.join(
    "site",
    "src",
    "tests",
    "screenshots",
    relativeRest,
  );
  const destinationPath = path.join(outputRootDir, relativeOutput);
  ensureDir(path.dirname(destinationPath));
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    return normalizeSlashes(relativeOutput);
  }
  return "";
}

function copyAndRewrite(
  artifactsRootDir: string,
  artifactName: string,
  originalPath: string | undefined,
  outputRootDir: string,
) {
  if (!originalPath) return "";
  return (
    rewriteAndCopyFromArtifacts(
      artifactsRootDir,
      artifactName,
      originalPath,
      outputRootDir,
    ) || rewriteAndCopyFromRepo(originalPath, outputRootDir)
  );
}

function mergeVisualDiffs(
  artifactsRootDir = "artifacts",
  outputRootDir = "public",
): DiffSummary {
  ensureDir(outputRootDir);
  const byTest: Record<string, DiffFile[]> = {};

  if (!fs.existsSync(artifactsRootDir)) {
    return { byTest };
  }

  for (const artifactName of fs.readdirSync(artifactsRootDir)) {
    const summaryPath = path.join(
      artifactsRootDir,
      artifactName,
      "site-diff-summary.json",
    );
    if (!fs.existsSync(summaryPath)) continue;
    const summary: DiffSummary = JSON.parse(
      fs.readFileSync(summaryPath, "utf8"),
    );

    for (const [suite, files] of Object.entries(summary.byTest || {})) {
      const list = byTest[suite] || [];
      for (const item of files) {
        const base = copyAndRewrite(
          artifactsRootDir,
          artifactName,
          item.base,
          outputRootDir,
        );
        const actual = copyAndRewrite(
          artifactsRootDir,
          artifactName,
          item.actual,
          outputRootDir,
        );
        const diff = copyAndRewrite(
          artifactsRootDir,
          artifactName,
          item.diff,
          outputRootDir,
        );
        if (!diff) continue; // we only care about changed/new
        list.push({ actual, base, diff });
      }
      if (list.length) {
        byTest[suite] = list;
      }
    }
  }

  return { byTest };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const summary = mergeVisualDiffs();
  fs.writeFileSync("site-diff-summary.json", JSON.stringify(summary));
  const hasDiffs = Object.values(summary.byTest || {}).some(
    (list) => list.length > 0,
  );
  process.stdout.write(hasDiffs ? "true" : "false");
}

export { mergeVisualDiffs };
