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

function rewriteAndCopyDiff(
  artifactsRootDir: string,
  artifactName: string,
  originalPath: string,
  outputRootDir: string,
) {
  if (!originalPath) return "";
  const match = originalPath.match(/[\\/ ]site[\\/]test-results[\\/](.*)$/);
  if (!match) return "";
  const relativeRest = match[1]!;
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
  }
  return normalizeSlashes(relativeOutput);
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
        // Only publish the diff image. Keep base/actual empty to avoid broken links.
        const diff = rewriteAndCopyDiff(
          artifactsRootDir,
          artifactName,
          item.diff || "",
          outputRootDir,
        );
        if (!diff) continue;
        list.push({ actual: "", base: "", diff });
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
