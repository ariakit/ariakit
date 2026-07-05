import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";

interface PerfMetrics {
  scripting: number;
  rendering: number;
  inp: number;
  total: number;
}

interface PerfScriptProfileEntry {
  functionName: string;
  url: string;
  line: number;
  column: number;
  selfTime: number;
  totalTime: number;
  hitCount: number;
}

interface PerfSelectorProfileEntry {
  selector: string;
  styleSheetId: string;
  styleSheetUrl: string;
  elapsed: number;
  matchAttempts: number;
  matchCount: number;
  slowPathNonMatchPercent: number;
  invalidationCount: number;
}

interface PerfProfiles {
  script?: PerfScriptProfileEntry[];
  selectors?: PerfSelectorProfileEntry[];
}

interface PerfResult {
  testFile: string;
  testTitle: string;
  label: string;
  metrics: PerfMetrics;
  raw: PerfMetrics[];
  profileOnly?: boolean;
  scriptProfile?: boolean;
  selectorProfile?: boolean;
  profiles?: PerfProfiles;
}

const resultsDir = ".perf-results";
const scriptPath = path.join(import.meta.dirname, "index.ts");
const tempDirs: string[] = [];

function createTempDir() {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), "ariakit-perf-")));
  tempDirs.push(dir);
  return dir;
}

function createMetrics(total: number): PerfMetrics {
  return {
    scripting: total,
    rendering: 0,
    inp: 0,
    total,
  };
}

function medianValue(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const midValue = sorted[mid];
  if (midValue == null) return 0;
  if (sorted.length % 2 !== 0) return midValue;
  const prevValue = sorted[mid - 1];
  if (prevValue == null) return midValue;
  return (prevValue + midValue) / 2;
}

function createResult(total: number): PerfResult {
  const metrics = createMetrics(total);
  return {
    testFile: "sandbox/example/perf-chrome.ts",
    testTitle: "example > react > example",
    label: "example > react > example",
    metrics,
    raw: [metrics],
  };
}

function createResultWithRaw(label: string, totals: number[]): PerfResult {
  const metrics = createMetrics(medianValue(totals));
  return {
    ...createResultWithMetrics(label, metrics),
    raw: totals.map(createMetrics),
  };
}

function createResultWithLabel(label: string, total: number): PerfResult {
  return {
    ...createResult(total),
    label,
    testTitle: label,
  };
}

function createResultWithMetrics(
  label: string,
  metrics: PerfMetrics,
  profiles?: PerfProfiles,
): PerfResult {
  return {
    ...createResultWithLabel(label, metrics.total),
    metrics,
    raw: [metrics],
    profiles,
  };
}

function createResultWithTitle(
  label: string,
  testTitle: string,
  metrics: PerfMetrics,
  profiles?: PerfProfiles,
): PerfResult {
  return {
    ...createResultWithMetrics(label, metrics, profiles),
    testTitle,
  };
}

function createScriptProfileEntry(
  functionName: string,
  selfTime: number,
): PerfScriptProfileEntry {
  return {
    functionName,
    url: "https://example.com/script.js",
    line: 1,
    column: 1,
    selfTime,
    totalTime: selfTime,
    hitCount: 1,
  };
}

function createSelectorProfileEntry(
  selector = ".item",
): PerfSelectorProfileEntry {
  return {
    selector,
    styleSheetId: "1",
    styleSheetUrl: "app/src/sandbox/example/style.css",
    elapsed: 8,
    matchAttempts: 10,
    matchCount: 2,
    slowPathNonMatchPercent: 20,
    invalidationCount: 0,
  };
}

function createBenchmarkReport(
  groups: Array<{
    benchmarks: Array<{ hz?: number; mean?: number; name: string }>;
    fullName: string;
  }>,
  filepath = path.join(
    "/repo",
    "packages/ariakit-store/benchmark/store.bench.ts",
  ),
) {
  return {
    files: [
      {
        filepath,
        groups,
      },
    ],
  };
}

function createBenchmarkReportFromFiles(
  files: Array<{
    filepath: string;
    groups: Array<{
      benchmarks: Array<{ hz?: number; mean?: number; name: string }>;
      fullName: string;
    }>;
  }>,
) {
  return { files };
}

function createStoreBenchmarkReport(hz?: number, mean?: number) {
  return createBenchmarkReport([
    {
      fullName: "packages/ariakit-store/benchmark/store.bench.ts",
      benchmarks: [{ name: "set state", hz, mean }],
    },
  ]);
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

function writeRawRound(
  dir: string,
  prefix: "baseline" | "current",
  round: number,
  totals: number[],
) {
  writeJson(dir, `${prefix}-${round}-worker0.json`, [
    createResultWithRaw("raw samples", totals),
  ]);
}

function createResultWithInpRaw(label: string, inps: number[]): PerfResult {
  return {
    ...createResultWithLabel(label, 100),
    metrics: { ...createMetrics(100), inp: medianValue(inps) },
    raw: inps.map((inp) => ({ ...createMetrics(100), inp })),
  };
}

function writeInpRawRound(
  dir: string,
  prefix: "baseline" | "current",
  round: number,
  inps: number[],
) {
  writeJson(dir, `${prefix}-${round}-worker0.json`, [
    createResultWithInpRaw("inp test", inps),
  ]);
}

function createFileResultWithRaw(
  testFile: string,
  label: string,
  totals: number[],
): PerfResult {
  return { ...createResultWithRaw(label, totals), testFile };
}

function readComparisonSummary(dir: string) {
  return JSON.parse(
    readFileSync(path.join(dir, resultsDir, "comparison.json"), "utf-8"),
  );
}

function readConfirmationFilesList(dir: string) {
  return readFileSync(
    path.join(dir, resultsDir, "confirmation-files.txt"),
    "utf-8",
  );
}

function runCompare(
  dir: string,
  args: string[] = [],
  env: NodeJS.ProcessEnv = {},
) {
  execFileSync(process.execPath, [scriptPath, "perf-compare", ...args], {
    cwd: dir,
    encoding: "utf-8",
    env: { ...process.env, ...env },
  });
  return readFileSync(path.join(dir, resultsDir, "comparison.md"), "utf-8");
}

function runCompareFailure(dir: string) {
  const result = spawnSync(process.execPath, [scriptPath, "perf-compare"], {
    cwd: dir,
    encoding: "utf-8",
  });
  if (result.status === 0) {
    throw new Error("Expected performance comparison to fail");
  }
  return `${result.stderr}${result.stdout}`;
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

  expect(markdown).toContain("100ms → 120ms (+20%) :warning:");
  expect(markdown).not.toContain("Aggregated across");
});

test("pairs legacy generated labels with normalized labels", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [
    createResultWithLabel(
      "sandbox/example/perf-chrome.ts > react > example",
      100,
    ),
  ]);
  writeJson(dir, "current-worker0.json", [createResult(120)]);

  const markdown = runCompare(dir);
  const summary = readComparisonSummary(dir);

  expect(markdown).toContain("100ms \u2192 120ms (+20%) :warning:");
  expect(markdown).not.toContain("### New tests");
  expect(markdown).not.toContain("### Removed tests");
  expect(summary.rows[0]?.label).toBe("example > react > example");
  expect(summary.newTests).toEqual([]);
  expect(summary.removedTests).toEqual([]);
});

test("compares Vitest benchmark reports in node mode", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1.json", createStoreBenchmarkReport(1000));
  writeJson(dir, "current-1.json", createStoreBenchmarkReport(500));

  const markdown = runCompare(dir, ["--node"]);

  expect(markdown).toContain(
    "#### packages/ariakit-store/benchmark/store.bench.ts",
  );
  expect(markdown).toContain("| Benchmark | Baseline | Current | Change |");
  expect(markdown).toContain(
    "| set state | 1,000 ops/sec | 500 ops/sec | -500 ops/sec (-50%) :warning: |",
  );
});

test("keeps Vitest benchmark groups distinct in node mode", () => {
  const dir = createTempDir();
  writeJson(
    dir,
    "baseline-1.json",
    createBenchmarkReport([
      {
        fullName: "packages/ariakit-store/benchmark/store.bench.ts > store",
        benchmarks: [{ name: "set state", hz: 1000 }],
      },
      {
        fullName:
          "packages/ariakit-store/benchmark/store.bench.ts > collection",
        benchmarks: [{ name: "set state", hz: 1000 }],
      },
    ]),
  );
  writeJson(
    dir,
    "current-1.json",
    createBenchmarkReport([
      {
        fullName: "packages/ariakit-store/benchmark/store.bench.ts > store",
        benchmarks: [{ name: "set state", hz: 500 }],
      },
      {
        fullName:
          "packages/ariakit-store/benchmark/store.bench.ts > collection",
        benchmarks: [{ name: "set state", hz: 1000 }],
      },
    ]),
  );

  const markdown = runCompare(dir, ["--node"]);

  expect(markdown).toContain(
    "| store > set state | 1,000 ops/sec | 500 ops/sec | -500 ops/sec (-50%) :warning: |",
  );
  expect(markdown).toContain("| collection > set state |");
});

test("groups Vitest benchmark tables by file in node mode", () => {
  const dir = createTempDir();
  const storeFile = path.join(
    "/repo",
    "packages/ariakit-store/benchmark/store.bench.ts",
  );
  const utilsFile = path.join(
    "/repo",
    "packages/ariakit-utils/benchmark/utils.bench.ts",
  );
  const report = createBenchmarkReportFromFiles([
    {
      filepath: storeFile,
      groups: [
        {
          fullName: storeFile,
          benchmarks: [{ name: "set state", hz: 1000 }],
        },
      ],
    },
    {
      filepath: utilsFile,
      groups: [
        {
          fullName: utilsFile,
          benchmarks: [{ name: "get value", hz: 2000 }],
        },
      ],
    },
  ]);
  writeJson(dir, "current-1.json", report);

  const markdown = runCompare(dir, ["--node"]);

  expect(markdown).toContain(
    "#### packages/ariakit-store/benchmark/store.bench.ts",
  );
  expect(markdown).toContain(
    "#### packages/ariakit-utils/benchmark/utils.bench.ts",
  );
  expect(markdown.match(/\| Benchmark \| Ops\/sec \|/g)).toHaveLength(2);
});

test("uses Vitest benchmark mean in node mode", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1.json", createStoreBenchmarkReport(0, 0.00002));
  writeJson(dir, "current-1.json", createStoreBenchmarkReport(0, 0.00004));

  const markdown = runCompare(dir, ["--node"]);

  expect(markdown).toContain(
    "50,000,000 ops/sec | 25,000,000 ops/sec | -25,000,000 ops/sec (-50%) :warning:",
  );
});

test("does not flag empty Vitest benchmark metrics in node mode", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1.json", createStoreBenchmarkReport());
  writeJson(dir, "current-1.json", createStoreBenchmarkReport());

  const markdown = runCompare(dir, ["--node"]);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain(
    "| set state | 0 ops/sec | 0 ops/sec | +0 ops/sec |",
  );
  expect(markdown).not.toContain("+0 ops/sec :rocket:");
});

test("describes Node multi-round comparisons by round agreement", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeJson(dir, `baseline-${round}.json`, createStoreBenchmarkReport(1000));
    writeJson(dir, `current-${round}.json`, createStoreBenchmarkReport(500));
  }

  const markdown = runCompare(dir, ["--node"]);
  const summary = readComparisonSummary(dir);

  expect(markdown).toContain(
    "Aggregated across 2 interleaved rounds; a change is flagged only when the paired median delta exceeds the threshold, rounds agree on direction.",
  );
  expect(markdown).not.toContain("raw samples support it");
  // Node mode does not require raw sample support, so rows that pass the
  // magnitude and agreement gates are significant, never candidates.
  expect(markdown).not.toContain("Unconfirmed changes");
  expect(summary.hasCandidateChanges).toBe(false);
  expect(summary.rows.every((row: any) => !row.candidate)).toBe(true);
  expect(summary.confirmationFiles).toEqual([
    "packages/ariakit-store/benchmark/store.bench.ts",
  ]);
  expect(readConfirmationFilesList(dir)).toBe(
    "packages/ariakit-store/benchmark/store.bench.ts\n",
  );
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
  expect(markdown).not.toContain("Unconfirmed changes");
  expect(markdown).not.toMatch(/% :warning:/);
  expect(markdown).toContain("Aggregated across 5 interleaved rounds");
  // Clean comparisons still write the workflow list so shell consumers can
  // read it unconditionally.
  expect(readConfirmationFilesList(dir)).toBe("");
});

test("reports overlapping same-direction rounds as unconfirmed candidates", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeRawRound(dir, "baseline", round, [80, 100, 120, 140, 160]);
    writeRawRound(dir, "current", round, [100, 120, 140, 160, 180]);
  }

  const markdown = runCompare(dir);

  expect(markdown).toContain("No confirmed performance changes detected.");
  expect(markdown).toContain("#### Unconfirmed changes");
  expect(markdown.indexOf("#### Unconfirmed changes")).toBeLessThan(
    markdown.indexOf("<details>"),
  );
  expect(markdown).toContain(
    "| raw samples | Scripting | 120ms | 140ms | +20ms (+17%) | low | rounds 2/2, raw 0/2, pairs 60% |",
  );
  expect(markdown).toContain("120ms | 140ms | +20ms (+17%)");
  // Candidates are reported in the unconfirmed changes section, not repeated
  // in the detailed breakdown diagnostics.
  expect(markdown).not.toContain("Unflagged threshold-sized changes");
  expect(markdown).not.toMatch(/% :warning:/);
  expect(markdown).not.toMatch(/% :rocket:/);
});

test("grades candidates by their displayed pairs percent", () => {
  const dir = createTempDir();
  const baseline = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  // 70 of 100 pairwise deltas support round 1 and 69 of 100 support round 2,
  // pooling to 139/200 = 69.5%, which displays as "pairs 70%". The medium
  // grade must match the displayed percent, not the raw 69.5 value.
  writeRawRound(dir, "baseline", 1, baseline);
  writeRawRound(dir, "current", 1, [35, 45, 75, 85, 85, 85, 85, 85, 85, 85]);
  writeRawRound(dir, "baseline", 2, baseline);
  writeRawRound(dir, "current", 2, [35, 35, 75, 85, 85, 85, 85, 85, 85, 85]);

  const markdown = runCompare(dir);

  expect(markdown).toContain(
    "| raw samples | Scripting | 55ms | 85ms | +30ms (+55%) | medium | rounds 2/2, raw 0/2, pairs 70% |",
  );
});

test("flags same-direction rounds with separated raw samples", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeRawRound(dir, "baseline", round, [80, 90, 100, 110, 120]);
    writeRawRound(dir, "current", round, [140, 150, 160, 170, 180]);
  }

  const markdown = runCompare(dir);

  expect(markdown).toContain(":warning:");
  expect(markdown).toContain("100ms → 160ms (+60%) :warning:");
  expect(markdown).not.toContain("Unconfirmed changes");
});

test("requires raw sample support in each required round", () => {
  const dir = createTempDir();
  writeRawRound(dir, "baseline", 1, [80, 100, 120, 140, 160]);
  writeRawRound(dir, "current", 1, [100, 120, 140, 160, 180]);
  writeRawRound(dir, "baseline", 2, [80, 90, 100, 110, 120]);
  writeRawRound(dir, "current", 2, [140, 150, 160, 170, 180]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No confirmed performance changes detected.");
  expect(markdown).toContain("110ms | 150ms | +40ms (+36%)");
  expect(markdown).toContain(
    "| raw samples | Scripting | 110ms | 150ms | +40ms (+36%) | medium | rounds 2/2, raw 1/2, pairs 80% |",
  );
  expect(markdown).not.toMatch(/% :warning:/);
});

test("caps the unconfirmed changes table", () => {
  const dir = createTempDir();
  const labels = ["c1", "c2", "c3", "c4", "c5", "c6"];
  for (const round of [1, 2]) {
    writeJson(
      dir,
      `baseline-${round}-worker0.json`,
      labels.map((label) =>
        createResultWithRaw(label, [80, 100, 120, 140, 160]),
      ),
    );
    writeJson(
      dir,
      `current-${round}-worker0.json`,
      labels.map((label) =>
        createResultWithRaw(label, [100, 120, 140, 160, 180]),
      ),
    );
  }

  const markdown = runCompare(dir);

  // Each candidate test contributes a Scripting and a Total row, so six tests
  // exceed the ten-row cap by two rows.
  expect(markdown).toContain("| c5 | Total |");
  expect(markdown).not.toContain("| c6 | Scripting |");
  expect(markdown).toContain(
    "...and 2 more unconfirmed changes in the full breakdown.",
  );
});

test("keeps zero-baseline candidates visible under the cap", () => {
  const dir = createTempDir();
  const labels = ["c1", "c2", "c3", "c4", "c5", "c6"];
  for (const round of [1, 2]) {
    writeJson(dir, `baseline-${round}-worker0.json`, [
      ...labels.map((label) =>
        createResultWithRaw(label, [80, 100, 120, 140, 160]),
      ),
      createResultWithRaw("from zero", [0, 0, 0, 0, 0]),
    ]);
    writeJson(dir, `current-${round}-worker0.json`, [
      ...labels.map((label) =>
        createResultWithRaw(label, [100, 120, 140, 160, 180]),
      ),
      createResultWithRaw("from zero", [0, 0, 200, 250, 300]),
    ]);
  }

  const markdown = runCompare(dir);

  // Zero-baseline rows have no percent, so they must rank ahead of
  // percent-sorted rows instead of falling behind them and off the cap.
  expect(markdown).toContain(
    "| from zero | Scripting | 0ms | 200ms | +200ms | low | rounds 2/2, raw 0/2, pairs 60% |",
  );
  expect(markdown.indexOf("| from zero | Scripting |")).toBeLessThan(
    markdown.indexOf("| c1 | Scripting |"),
  );
  expect(markdown).toContain(
    "...and 4 more unconfirmed changes in the full breakdown.",
  );
});

test("reports INP-only changes as unconfirmed candidates", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeInpRawRound(dir, "baseline", round, [600, 620, 650, 700, 710]);
    writeInpRawRound(dir, "current", round, [380, 390, 400, 790, 800]);
  }

  const markdown = runCompare(dir);

  expect(markdown).toContain("No confirmed performance changes detected.");
  expect(markdown).toContain(
    "| inp test | INP | 650ms | 400ms | -250ms (-38%) | low | rounds 2/2, raw 0/2, pairs 60% |",
  );
  expect(markdown).not.toMatch(/% :rocket:/);
});

test("flags confirmed INP regressions", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeInpRawRound(dir, "baseline", round, [100, 105, 110, 115, 120]);
    writeInpRawRound(dir, "current", round, [200, 210, 220, 230, 240]);
  }

  const markdown = runCompare(dir);

  expect(markdown).toContain("| Test | Scripting | Rendering | INP | Total |");
  expect(markdown).toContain("110ms → 220ms (+100%) :warning:");
  expect(markdown).not.toContain("Unconfirmed changes");
});

test("flags confirmed INP improvements", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeInpRawRound(dir, "baseline", round, [200, 210, 220, 230, 240]);
    writeInpRawRound(dir, "current", round, [100, 105, 110, 115, 120]);
  }

  const markdown = runCompare(dir);

  expect(markdown).toContain("220ms → 110ms (-50%) :rocket:");
  expect(markdown).not.toContain("Unconfirmed changes");
});

test("lists confirmation files for significant and candidate changes", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeJson(dir, `baseline-${round}-worker0.json`, [
      createFileResultWithRaw(
        "sandbox/a/perf-chrome.ts",
        "significant",
        [80, 90, 100, 110, 120],
      ),
      createFileResultWithRaw(
        "sandbox/b/perf-chrome.ts",
        "candidate",
        [80, 100, 120, 140, 160],
      ),
      createFileResultWithRaw(
        "sandbox/c/perf-chrome.ts",
        "stable",
        [100, 100, 100, 100, 100],
      ),
    ]);
    writeJson(dir, `current-${round}-worker0.json`, [
      createFileResultWithRaw(
        "sandbox/a/perf-chrome.ts",
        "significant",
        [140, 150, 160, 170, 180],
      ),
      createFileResultWithRaw(
        "sandbox/b/perf-chrome.ts",
        "candidate",
        [100, 120, 140, 160, 180],
      ),
      createFileResultWithRaw(
        "sandbox/c/perf-chrome.ts",
        "stable",
        [100, 100, 100, 100, 100],
      ),
    ]);
  }

  const markdown = runCompare(dir);
  const summary = readComparisonSummary(dir);

  expect(summary.hasSignificantChanges).toBe(true);
  expect(summary.hasCandidateChanges).toBe(true);
  expect(summary.confirmationFiles).toEqual([
    "sandbox/a/perf-chrome.ts",
    "sandbox/b/perf-chrome.ts",
  ]);
  // The perf workflow consumes the flagged files as a plain-text list, one
  // per line.
  expect(readConfirmationFilesList(dir)).toBe(
    "sandbox/a/perf-chrome.ts\nsandbox/b/perf-chrome.ts\n",
  );
  // Significant and unconfirmed changes are reported side by side, without
  // icons on the unconfirmed rows.
  expect(markdown).toContain("100ms → 160ms (+60%) :warning:");
  expect(markdown).toContain("#### Unconfirmed changes");
  expect(markdown).toContain(
    "| candidate | Scripting | 120ms | 140ms | +20ms (+17%) | low | rounds 2/2, raw 0/2, pairs 60% |",
  );
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

  expect(markdown).toContain("200ms → 160ms (-20%) :rocket:");
  expect(markdown).not.toContain("125ms");
  expect(markdown).toContain("Aggregated across 2 interleaved rounds");
  expect(markdown).toContain(
    "paired median delta exceeds the threshold, rounds agree on direction and raw samples support it",
  );
});

test("merges sharded round files with shard-suffixed names", () => {
  const dir = createTempDir();
  // Mirrors the CI Chrome sharding: each shard writes round files carrying a
  // `-s<shard>` suffix (e.g. baseline-1-s1-worker0.json) for its own subset of
  // tests, and the post job runs a single comparison over all of them. Locks
  // that discoverRoundFiles accepts the suffix, pairs by round index, and
  // merges the shards' disjoint tests into one comparison.
  for (const round of [1, 2]) {
    writeJson(dir, `baseline-${round}-s1-worker0.json`, [
      createResultWithLabel("shard one test", 100),
    ]);
    writeJson(dir, `current-${round}-s1-worker0.json`, [
      createResultWithLabel("shard one test", 101),
    ]);
    writeJson(dir, `baseline-${round}-s2-worker0.json`, [
      createResultWithLabel("shard two test", 100),
    ]);
    writeJson(dir, `current-${round}-s2-worker0.json`, [
      createResultWithLabel("shard two test", 130),
    ]);
  }

  const markdown = runCompare(dir);

  expect(markdown).toContain("Aggregated across 2 interleaved rounds");
  expect(markdown).toContain("shard one test");
  expect(markdown).toContain("shard two test");
  expect(markdown).toContain("100ms → 130ms (+30%) :warning:");
});

test("does not overstate mixed paired round counts", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1-worker0.json", [
    createResultWithLabel("three rounds", 100),
    createResultWithLabel("one round", 100),
  ]);
  writeJson(dir, "baseline-2-worker0.json", [
    createResultWithLabel("three rounds", 100),
  ]);
  writeJson(dir, "baseline-3-worker0.json", [
    createResultWithLabel("three rounds", 100),
  ]);
  writeJson(dir, "current-1-worker0.json", [
    createResultWithLabel("three rounds", 120),
    createResultWithLabel("one round", 120),
  ]);
  writeJson(dir, "current-2-worker0.json", [
    createResultWithLabel("three rounds", 120),
  ]);
  writeJson(dir, "current-3-worker0.json", [
    createResultWithLabel("three rounds", 120),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).not.toContain("Aggregated across 3 interleaved rounds");
  expect(markdown).toContain("mixed interleaved round counts");
});

test("requires both rounds to agree in two-round comparisons", () => {
  const dir = createTempDir();
  [100, 100].forEach((total, index) => {
    writeRound(dir, "baseline", index + 1, total);
  });
  [80, 150].forEach((total, index) => {
    writeRound(dir, "current", index + 1, total);
  });

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain("100ms → 115ms (+15%)");
  expect(markdown).not.toMatch(/% :warning:/);
});

test("flags unanimous two-round regressions", () => {
  const dir = createTempDir();
  [100, 100].forEach((total, index) => {
    writeRound(dir, "baseline", index + 1, total);
  });
  [130, 132].forEach((total, index) => {
    writeRound(dir, "current", index + 1, total);
  });

  const markdown = runCompare(dir);

  expect(markdown).toContain(":warning:");
  expect(markdown).toContain("+31%");
});

test("keeps zero-baseline paired rounds in the agreement count", () => {
  const dir = createTempDir();
  writeRound(dir, "baseline", 1, 0);
  writeRound(dir, "current", 1, 0);
  writeRound(dir, "baseline", 2, 100);
  writeRound(dir, "current", 2, 130);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain("50ms → 65ms (+30%)");
  expect(markdown).not.toMatch(/% :warning:/);
});

test("fails when a flagged row has no test file", () => {
  const dir = createTempDir();
  for (const round of [1, 2]) {
    writeJson(dir, `baseline-${round}-worker0.json`, [
      createFileResultWithRaw("", "no file", [80, 90, 100, 110, 120]),
    ]);
    writeJson(dir, `current-${round}-worker0.json`, [
      createFileResultWithRaw("", "no file", [140, 150, 160, 170, 180]),
    ]);
  }

  const stderr = runCompareFailure(dir);

  expect(stderr).toContain("Missing test file for comparison row: no file");
});

test("fails on malformed perf result files", () => {
  const dir = createTempDir();
  const outputDir = path.join(dir, resultsDir);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, "baseline-worker0.json"), "{", "utf-8");
  writeJson(dir, "current-worker0.json", [createResult(100)]);

  const stderr = runCompareFailure(dir);

  expect(stderr).toContain("Failed to parse perf results");
  expect(stderr).toContain("baseline-worker0.json");
});

test("fails on missing discovered perf result files", () => {
  const dir = createTempDir();
  const outputDir = path.join(dir, resultsDir);
  mkdirSync(outputDir, { recursive: true });
  symlinkSync("missing.json", path.join(outputDir, "baseline-worker0.json"));
  writeJson(dir, "current-worker0.json", [createResult(100)]);

  const stderr = runCompareFailure(dir);

  expect(stderr).toContain("Failed to read perf results");
  expect(stderr).toContain("baseline-worker0.json");
});

test("fails on parsed non-array perf result files", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", {});
  writeJson(dir, "current-worker0.json", [createResult(100)]);

  const stderr = runCompareFailure(dir);

  expect(stderr).toContain("Invalid perf results format");
  expect(stderr).toContain("baseline-worker0.json");
});

test("reports tests with no paired rounds separately", () => {
  const dir = createTempDir();
  writeRound(dir, "baseline", 1, 100);
  writeRound(dir, "current", 2, 120);

  const markdown = runCompare(dir);

  expect(markdown).toContain(
    "No paired performance results available for comparison.",
  );
  expect(markdown).toContain("### Unpaired tests");
  expect(markdown).toContain("| example > react > example | 1 | 2 |");
  expect(markdown).not.toContain("0ms | 0ms");
});

test("surfaces unpaired tests outside the details block", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1-worker0.json", [
    createResultWithLabel("paired", 100),
    createResultWithLabel("unpaired", 100),
  ]);
  writeJson(dir, "current-1-worker0.json", [
    createResultWithLabel("paired", 100),
  ]);
  writeJson(dir, "current-2-worker0.json", [
    createResultWithLabel("unpaired", 120),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain(
    ":warning: 1 test had no comparable paired round and was not compared.",
  );
  expect(markdown.indexOf(":warning: 1 test")).toBeLessThan(
    markdown.indexOf("<details>"),
  );
  expect(markdown.indexOf("- unpaired")).toBeLessThan(
    markdown.indexOf("<details>"),
  );
  expect(markdown).toContain("| unpaired | 1 | 2 |");
});

test("reports renamed tests as new and removed", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [
    createResultWithLabel("old name", 100),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithLabel("new name", 100),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("### New tests (no baseline)");
  expect(markdown).toContain("### Removed tests");
  expect(markdown).toContain("new name");
  expect(markdown).toContain("- old name");
});

test("does not flag percentage-only changes below the absolute floor", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [createResult(20)]);
  writeJson(dir, "current-worker0.json", [createResult(24)]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain("20ms → 24ms (+20%)");
  expect(markdown).not.toMatch(/% :warning:/);
});

test("ignores legacy rendering sub-metrics in older baselines", () => {
  const dir = createTempDir();
  // Baselines produced by an older harness carry the retired layout, style
  // recalc, and painting keys alongside the current metrics.
  const legacyMetrics = {
    scripting: 100,
    layout: 16,
    styleRecalc: 4,
    painting: 0,
    rendering: 20,
    inp: 0,
    total: 120,
  };
  writeJson(dir, "baseline-worker0.json", [
    {
      ...createResultWithLabel("legacy sub-metrics", legacyMetrics.total),
      metrics: legacyMetrics,
      raw: [legacyMetrics],
    },
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithMetrics("legacy sub-metrics", {
      scripting: 100,
      rendering: 20,
      inp: 0,
      total: 120,
    }),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain("20ms → 20ms (+0%)");
  expect(markdown).not.toContain("Style recalc");
  expect(markdown).not.toContain("Painting");
});

test("aggregates worker shards within the same round", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1-worker0.json", [createResult(100)]);
  writeJson(dir, "baseline-1-worker1.json", [createResult(100)]);
  writeJson(dir, "current-1-worker0.json", [createResult(200)]);
  writeJson(dir, "current-1-worker1.json", [createResult(100)]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No confirmed performance changes detected.");
  expect(markdown).toContain("100ms | 150ms | +50ms (+50%)");
  expect(markdown).toContain("rounds 1/1, raw 0/1, pairs 50%");
  expect(markdown).not.toMatch(/% :warning:/);
});

test("merges profiles across rounds", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), {
      script: [createScriptProfileEntry("baselineFirstRound", 1)],
    }),
  ]);
  writeJson(dir, "baseline-2-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), {
      script: [createScriptProfileEntry("baselineSecondRound", 1)],
    }),
  ]);
  writeJson(dir, "current-1-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), {
      script: [createScriptProfileEntry("firstRoundFn", 8)],
    }),
  ]);
  writeJson(dir, "current-2-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), {
      script: [createScriptProfileEntry("secondRoundFn", 7)],
    }),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("firstRoundFn");
  expect(markdown).toContain("secondRoundFn");
});

test("renders script profile function names as linked code", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [
      {
        functionName: "Dialog",
        url: "packages/ariakit-react-components/src/dialog/dialog.tsx",
        line: 12,
        column: 3,
        selfTime: 8,
        totalTime: 9,
        hitCount: 2,
      },
      {
        functionName: "DialogPerf",
        url: "app/src/sandbox/dialog-perf/index.react.tsx",
        line: 34,
        column: 5,
        selfTime: 4,
        totalTime: 5,
        hitCount: 1,
      },
      {
        functionName: "Escaped",
        url: String.raw`app/src/sandbox/dialog\[perf]|case.tsx`,
        line: 56,
        column: 7,
        selfTime: 2,
        totalTime: 3,
        hitCount: 1,
      },
    ],
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), profiles),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), profiles),
  ]);

  const markdown = runCompare(dir, [], {
    GITHUB_REPOSITORY: "ariakit/ariakit",
    GITHUB_SHA: "abc123",
  });

  expect(markdown).toContain(
    "[`Dialog`](https://github.com/ariakit/ariakit/blob/abc123/packages/ariakit-react-components/src/dialog/dialog.tsx#L12)",
  );
  expect(markdown).toContain(
    "[`DialogPerf`](https://github.com/ariakit/ariakit/blob/abc123/app/src/sandbox/dialog-perf/index.react.tsx#L34)",
  );
  expect(markdown).toContain(
    "[`Escaped`](https://github.com/ariakit/ariakit/blob/abc123/app/src/sandbox/dialog%5C%5Bperf%5D%7Ccase.tsx#L56)",
  );
  expect(markdown).toContain(
    "| [`Dialog`](https://github.com/ariakit/ariakit/blob/abc123/packages/ariakit-react-components/src/dialog/dialog.tsx#L12) | 8ms | 9ms | 2 |",
  );
  expect(markdown).not.toContain("| Function | Self | Total | Hits | Source |");
  expect(markdown).not.toContain("dialog.tsx:12:3");
});

test("keeps node_modules script profile functions as unlinked code", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [
      {
        functionName: "updateWorkInProgressHook",
        url: "/node_modules/react-dom/react-dom-client.production.js",
        line: 4455,
        column: 10,
        selfTime: 8,
        totalTime: 9,
        hitCount: 2,
      },
    ],
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), profiles),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100), profiles),
  ]);

  const markdown = runCompare(dir, [], {
    GITHUB_REPOSITORY: "ariakit/ariakit",
    GITHUB_SHA: "abc123",
  });

  expect(markdown).toContain("| `updateWorkInProgressHook` | 8ms | 9ms | 2 |");
  expect(markdown).not.toContain("react-dom-client.production.js");
});

test("renders script profiles below comparison tables", () => {
  const dir = createTempDir();
  const label = "custom label";
  const testTitle = "ariakit-tailwind > react > page load";
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithTitle(label, testTitle, createMetrics(100), profiles),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithTitle(label, testTitle, createMetrics(130), profiles),
  ]);

  const markdown = runCompare(dir);
  const comparisonIndex = markdown.indexOf(
    "| [ariakit-tailwind > react > page load](#script-profile-ariakit-tailwind-react-page-load) | 100ms → 130ms (+30%) :warning:",
  );
  const profileIndex = markdown.indexOf(
    "#### ariakit-tailwind > react > page load",
  );

  expect(markdown).toContain(
    `<a id="script-profile-ariakit-tailwind-react-page-load"></a>`,
  );
  expect(comparisonIndex).toBeGreaterThan(-1);
  expect(profileIndex).toBeGreaterThan(comparisonIndex);
  expect(markdown).toContain("| `profiledFn` | 8ms | 8ms | 1 |");
  expect(markdown).not.toContain("#### custom label");
  expect(markdown).not.toContain("#### Script profile");
});

test("merges script profile rows into base comparisons", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithLabel("profiled", 100),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithLabel("profiled", 130),
    {
      ...createResultWithMetrics(
        "profiled (script profile)",
        createMetrics(300),
        profiles,
      ),
      scriptProfile: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain(
    "| [profiled](#script-profile-profiled) | 100ms → 130ms (+30%) :warning:",
  );
  expect(markdown).toContain(`<a id="script-profile-profiled"></a>`);
  expect(markdown).toContain("#### profiled");
  expect(markdown).toContain("| `profiledFn` | 8ms | 8ms | 1 |");
  expect(markdown).not.toContain("### profiled (script profile)");
  expect(markdown).not.toContain("#### Script profile");
  expect(markdown).not.toContain("300ms");
});

test("escapes and disambiguates script profile anchors", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithTitle(
      "first custom label",
      "same [title] | test",
      createMetrics(100),
      profiles,
    ),
    createResultWithTitle(
      "second custom label",
      "same title test",
      createMetrics(100),
      profiles,
    ),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithTitle(
      "first custom label",
      "same [title] | test",
      createMetrics(130),
      profiles,
    ),
    createResultWithTitle(
      "second custom label",
      "same title test",
      createMetrics(130),
      profiles,
    ),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain(
    "| [same \\[title\\] \\| test](#script-profile-same-title-test) |",
  );
  expect(markdown).toContain(
    "| [same title test](#script-profile-same-title-test-2) |",
  );
  expect(markdown).toContain(`<a id="script-profile-same-title-test"></a>`);
  expect(markdown).toContain(`<a id="script-profile-same-title-test-2"></a>`);
});

test("includes new test metric rows for script profile results", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "current-worker0.json", [
    createResultWithLabel("regular", 100),
    createResultWithTitle(
      "profiled label",
      "profiled title",
      createMetrics(130),
      profiles,
    ),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("### New tests (no baseline)");
  expect(markdown).toContain("| Test | Scripting | Rendering | INP | Total |");
  expect(markdown).toContain("| regular | 100ms | 0ms | 0ms | 100ms |");
  expect(markdown).toContain(
    "| [profiled title](#script-profile-profiled-title) | 130ms | 0ms | 0ms | 130ms |",
  );
  expect(markdown).toContain(`<a id="script-profile-profiled-title"></a>`);
  expect(markdown).toContain("#### profiled title");
  expect(markdown).not.toContain("#### profiled label");
  expect(markdown).not.toContain("#### Script profile");
  expect(markdown).toContain("| `profiledFn` | 8ms | 8ms | 1 |");
});

test("omits new test metric rows for profile-only results", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    selectors: [createSelectorProfileEntry(".item")],
  };
  writeJson(dir, "current-worker0.json", [
    createResultWithLabel("regular", 100),
    {
      ...createResultWithMetrics(
        "selector-profiled",
        createMetrics(130),
        profiles,
      ),
      selectorProfile: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("### New tests (no baseline)");
  expect(markdown).toContain("| Test | Scripting | Rendering | INP | Total |");
  expect(markdown).toContain("| regular | 100ms | 0ms | 0ms | 100ms |");
  expect(markdown).toMatch(/^#### selector-profiled$/m);
  expect(markdown).toMatch(/^##### Selector profile$/m);
  expect(markdown).toContain("| .item | 8ms | 10 | 2 | 20% |");
  expect(markdown).not.toContain(
    "| selector-profiled | 130ms | 0ms | 0ms | 130ms |",
  );
});

test("omits new test metric rows for explicit profile-only results", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "current-worker0.json", [
    {
      ...createResultWithMetrics("profiled", createMetrics(130), profiles),
      profileOnly: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("### New tests (no baseline)");
  expect(markdown).toContain("#### profiled");
  expect(markdown).not.toContain("#### Script profile");
  expect(markdown).toContain("| `profiledFn` | 8ms | 8ms | 1 |");
  expect(markdown).not.toContain(
    "| Test | Scripting | Rendering | INP | Total |",
  );
  expect(markdown).not.toContain("| profiled | 130ms | 0ms | 0ms | 130ms |");
});

test("ignores profile-only rounds in metric comparisons", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "baseline-1-worker0.json", [
    createResultWithLabel("profiled", 100),
  ]);
  writeJson(dir, "current-1-worker0.json", [
    createResultWithLabel("profiled", 130),
  ]);
  writeJson(dir, "baseline-2-worker0.json", [
    createResultWithLabel("profiled", 100),
  ]);
  writeJson(dir, "current-2-worker0.json", [
    {
      ...createResultWithMetrics("profiled", createMetrics(300), profiles),
      profileOnly: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain(
    "| [profiled](#script-profile-profiled) | 100ms → 130ms (+30%) :warning:",
  );
  expect(markdown).toContain("#### profiled");
  expect(markdown).not.toContain("#### Script profile");
  expect(markdown).toContain("| `profiledFn` | 8ms | 8ms | 1 |");
  expect(markdown).not.toContain("300ms");
});

test("reports tests with no non-profile paired rounds as unpaired", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("profiledFn", 8)],
  };
  writeJson(dir, "baseline-1-worker0.json", [
    createResultWithLabel("profiled", 100),
  ]);
  writeJson(dir, "current-1-worker0.json", [
    {
      ...createResultWithMetrics("profiled", createMetrics(300), profiles),
      profileOnly: true,
    },
  ]);
  writeJson(dir, "baseline-2-worker0.json", [
    {
      ...createResultWithMetrics("profiled", createMetrics(200), profiles),
      profileOnly: true,
    },
  ]);
  writeJson(dir, "current-2-worker0.json", [
    createResultWithLabel("profiled", 130),
  ]);

  const markdown = runCompare(dir);
  const summary = readComparisonSummary(dir);

  expect(markdown).toContain(
    "No paired performance results available for comparison.",
  );
  expect(markdown).toContain(
    ":warning: 1 test had no comparable paired round and was not compared.",
  );
  expect(markdown).toContain("| profiled | 1, 2 | 1, 2 |");
  expect(markdown).not.toContain("| Metric | Baseline | Current | Delta |");
  expect(summary.rows).toEqual([]);
  expect(summary.unpairedTests).toMatchObject([
    {
      label: "profiled",
      baselineRounds: [1, 2],
      currentRounds: [1, 2],
    },
  ]);
});

test("compares metrics when only one side has attached profile data", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(100)),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithMetrics("profiled", createMetrics(130), {
      script: [createScriptProfileEntry("currentProfile", 8)],
    }),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain(
    "| [profiled](#script-profile-profiled) | 100ms → 130ms (+30%) :warning:",
  );
  expect(markdown).toContain("#### profiled");
  expect(markdown).toContain("| `currentProfile` | 8ms | 8ms | 1 |");
  expect(markdown).not.toContain("Profile mode differs between baseline");
});

test("omits metric tables when only current has script profile mode", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    script: [createScriptProfileEntry("currentProfile", 8)],
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profile-mismatch", createMetrics(100)),
  ]);
  writeJson(dir, "current-worker0.json", [
    {
      ...createResultWithMetrics(
        "profile-mismatch",
        createMetrics(130),
        profiles,
      ),
      scriptProfile: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("Profile mode differs between baseline");
  expect(markdown).toContain("| profile-mismatch | script | no | yes |");
  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain("| `currentProfile` | 8ms | 8ms | 1 |");
  expect(markdown).not.toContain("| Metric | Baseline | Current | Delta |");
  expect(markdown).not.toContain("+30ms (+30%)");
});

test("omits metric tables when script profile has no retained entries", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profile-mismatch", createMetrics(100)),
  ]);
  writeJson(dir, "current-worker0.json", [
    {
      ...createResultWithMetrics("profile-mismatch", createMetrics(130)),
      scriptProfile: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("Profile mode differs between baseline");
  expect(markdown).toContain("| profile-mismatch | script | no | yes |");
  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).not.toContain("### profile-mismatch");
  expect(markdown).not.toContain("| Metric | Baseline | Current | Delta |");
  expect(markdown).not.toContain("+30ms (+30%)");
});

test("omits metric tables when selector profile has no retained entries", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profile-mismatch", createMetrics(100)),
  ]);
  writeJson(dir, "current-worker0.json", [
    {
      ...createResultWithMetrics("profile-mismatch", createMetrics(130)),
      selectorProfile: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("Profile mode differs between baseline");
  expect(markdown).toContain("| profile-mismatch | selectors | no | yes |");
  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).not.toContain("### profile-mismatch");
  expect(markdown).not.toContain("| Metric | Baseline | Current | Delta |");
  expect(markdown).not.toContain("+30ms (+30%)");
});

test("omits metric tables for profile-only comparisons", () => {
  const dir = createTempDir();
  const profiles: PerfProfiles = {
    selectors: [createSelectorProfileEntry(".item")],
  };
  writeJson(dir, "baseline-worker0.json", [
    {
      ...createResultWithMetrics(
        "selector-profiled",
        createMetrics(100),
        profiles,
      ),
      selectorProfile: true,
    },
  ]);
  writeJson(dir, "current-worker0.json", [
    {
      ...createResultWithMetrics(
        "selector-profiled",
        createMetrics(130),
        profiles,
      ),
      selectorProfile: true,
    },
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toMatch(/^#### selector-profiled$/m);
  expect(markdown).toMatch(/^##### Selector profile$/m);
  expect(markdown).toContain("| .item | 8ms | 10 | 2 | 20% |");
  expect(markdown).not.toContain("| Metric | Baseline | Current | Delta |");
  expect(markdown).not.toContain("+30ms (+30%)");
});
