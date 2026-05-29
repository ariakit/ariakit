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
  layout: number;
  styleRecalc: number;
  painting: number;
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

interface PerfProfiles {
  script?: PerfScriptProfileEntry[];
}

interface PerfResult {
  testFile: string;
  testTitle: string;
  label: string;
  metrics: PerfMetrics;
  raw: PerfMetrics[];
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

function runCompare(dir: string, args: string[] = []) {
  execFileSync(process.execPath, [scriptPath, "perf-compare", ...args], {
    cwd: dir,
    encoding: "utf-8",
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

  expect(markdown).toContain("100.0ms → 120.0ms (+20%) :warning:");
  expect(markdown).not.toContain("Aggregated across");
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

test("merges sharded round files with shard-suffixed names", () => {
  const dir = createTempDir();
  // Mirrors the CI Chrome sharding: each shard writes round files carrying a
  // `-s<shard>` suffix (e.g. baseline-1-s1-worker0.json) for its own subset of
  // tests, and chrome-merge runs a single comparison over all of them. Locks
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
  expect(markdown).toContain("100.0ms → 130.0ms (+30%) :warning:");
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
  expect(markdown).toContain("100.0ms | 115.0ms | +15.0ms (+15%)");
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
  expect(markdown).toContain("50.0ms | 65.0ms | +15.0ms (+30%)");
  expect(markdown).not.toMatch(/% :warning:/);
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
  expect(markdown).toContain(
    "| sandbox/example/perf-chrome.ts > react > example | 1 | 2 |",
  );
  expect(markdown).not.toContain("0.0ms | 0.0ms");
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
    ":warning: 1 test had no paired baseline/current rounds and was not compared.",
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
  expect(markdown).toContain("20.0ms | 24.0ms | +4.0ms (+20%)");
  expect(markdown).not.toMatch(/% :warning:/);
});

test("does not flag rendering sub-metric noise", () => {
  const dir = createTempDir();
  const baselineMetrics: PerfMetrics = {
    scripting: 100,
    layout: 16,
    styleRecalc: 4,
    painting: 0,
    rendering: 20,
    inp: 0,
    total: 120,
  };
  const currentMetrics: PerfMetrics = {
    scripting: 100,
    layout: 11,
    styleRecalc: 9,
    painting: 0,
    rendering: 20,
    inp: 0,
    total: 120,
  };
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("sub-metrics", baselineMetrics),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithMetrics("sub-metrics", currentMetrics),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("No significant performance changes detected.");
  expect(markdown).toContain(
    "| - Style recalc | 4.0ms | 9.0ms | +5.0ms (+125%) |",
  );
  expect(markdown).not.toContain("+5.0ms (+125%) :warning:");
  expect(markdown).not.toContain("-5.0ms (-31%) :rocket:");
});

test("aggregates worker shards within the same round", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-1-worker0.json", [createResult(100)]);
  writeJson(dir, "baseline-1-worker1.json", [createResult(100)]);
  writeJson(dir, "current-1-worker0.json", [createResult(200)]);
  writeJson(dir, "current-1-worker1.json", [createResult(100)]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("100.0ms → 150.0ms (+50%) :warning:");
  expect(markdown).toContain("100.0ms | 150.0ms | +50.0ms (+50%) :warning:");
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

test("warns when only one side has profile data for a test", () => {
  const dir = createTempDir();
  writeJson(dir, "baseline-worker0.json", [
    createResultWithMetrics("profile-mismatch", createMetrics(100), {
      script: [createScriptProfileEntry("baselineProfile", 1)],
    }),
  ]);
  writeJson(dir, "current-worker0.json", [
    createResultWithMetrics("profile-mismatch", createMetrics(100)),
  ]);

  const markdown = runCompare(dir);

  expect(markdown).toContain("Profile data differs between baseline");
  expect(markdown).toContain("| profile-mismatch | script | yes | no |");
});
