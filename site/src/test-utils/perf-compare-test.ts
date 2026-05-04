/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import type { PerfMetrics, PerfResult } from "./perf.ts";

const resultsDir = ".perf-results";
const scriptPath = path.join(import.meta.dirname, "perf-compare.ts");
const tempDirs: string[] = [];

function createTempDir() {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), "ariakit-perf-")));
  tempDirs.push(dir);
  return dir;
}

function createMetrics(total: number): PerfMetrics {
  return {
    scripting: total,
    layout: 0,
    styleRecalc: 0,
    painting: 0,
    rendering: 0,
    inp: 0,
    total,
  };
}

function createResult(total: number): PerfResult {
  const metrics = createMetrics(total);
  return {
    testFile: "sandbox/example/perf-chrome.ts",
    testTitle: "sandbox/example/perf-chrome.ts > react > example",
    label: "sandbox/example/perf-chrome.ts > react > example",
    metrics,
    raw: [metrics],
  };
}

function writeJson(dir: string, file: string, data: unknown) {
  const outputDir = path.join(dir, resultsDir);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, file), JSON.stringify(data), "utf-8");
}

function writeRound(
  dir: string,
  prefix: "baseline" | "current",
  round: number,
  total: number,
) {
  writeJson(dir, `${prefix}-${round}-worker0.json`, [createResult(total)]);
}

function runCompare(dir: string) {
  execFileSync(process.execPath, [scriptPath], {
    cwd: dir,
    encoding: "utf-8",
  });
  return readFileSync(path.join(dir, resultsDir, "comparison.md"), "utf-8");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("keeps single-run comparison behavior", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [createResult(100)]);
  writeJson(dir, "current-worker0.json", [createResult(120)]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("100.0ms → 120.0ms (+20%) :warning:");
  expect(markdown).not.toContain("Aggregated across");
});

test("does not flag noisy rounds that disagree on direction", () => {
  const dir = createTempDir();
  for (let round = 1; round <= 5; round++) {
    writeRound(dir, "baseline", round, 100);
  }
  [80, 85, 82, 130, 135].forEach((total, index) => {
    writeRound(dir, "current", index + 1, total);
  });

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).not.toMatch(/% :warning:/);
  expect(markdown).toContain("Aggregated across 5 interleaved rounds");
});

test("flags a consistent regression across rounds", () => {
  const dir = createTempDir();
  for (let round = 1; round <= 3; round++) {
    writeRound(dir, "baseline", round, 100);
  }
  [125, 128, 130].forEach((total, index) => {
    writeRound(dir, "current", index + 1, total);
  });

  const markdown = runCompare(dir);

  expect(markdown).toContain(":warning:");
  expect(markdown).toContain("+28%");
});

test("aggregates displayed values from shared rounds", () => {
  const dir = createTempDir();
  [200, 200, 50, 50].forEach((total, index) => {
    writeRound(dir, "baseline", index + 1, total);
  });
  [160, 160].forEach((total, index) => {
    writeRound(dir, "current", index + 1, total);
  });

  const markdown = runCompare(dir);

  expect(markdown).toContain("200.0ms → 160.0ms (-20%) :rocket:");
  expect(markdown).not.toContain("125.0ms");
  expect(markdown).toContain("Aggregated across 2 interleaved rounds");
});

test("does not flag percentage-only changes below the absolute floor", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [createResult(20)]);
  writeJson(dir, "current-worker0.json", [createResult(24)]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain("20.0ms | 24.0ms | +4.0ms (+20%)");
  expect(markdown).not.toMatch(/% :warning:/);
});
