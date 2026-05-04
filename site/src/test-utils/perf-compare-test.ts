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
import { afterEach, describe, expect, test } from "vitest";
import type { PerfMetrics, PerfResult } from "./perf.ts";

const resultsDir = ".perf-results";
const scriptPath = path.join(import.meta.dirname, "perf-compare.ts");
const tempDirs: string[] = [];

interface MetricsInput {
  scripting?: number;
  layout?: number;
  styleRecalc?: number;
  painting?: number;
  rendering?: number;
  inp?: number;
  total?: number;
}

function fillMetrics(input: MetricsInput): PerfMetrics {
  const layout = input.layout ?? 0;
  const styleRecalc = input.styleRecalc ?? 0;
  const painting = input.painting ?? 0;
  const rendering = input.rendering ?? layout + styleRecalc + painting;
  const scripting = input.scripting ?? 0;
  const total = input.total ?? scripting + rendering;
  return {
    scripting,
    layout,
    styleRecalc,
    painting,
    rendering,
    inp: input.inp ?? 0,
    total,
  };
}

function createResult(
  label: string,
  metrics: MetricsInput,
  testFile = "site/src/sandbox/example/perf-chrome.ts",
): PerfResult {
  return {
    testFile,
    testTitle: `${label} > ${testFile}`,
    label,
    metrics: fillMetrics(metrics),
    raw: [fillMetrics(metrics)],
  };
}

function createTempDir() {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), "ariakit-perf-")));
  tempDirs.push(dir);
  return dir;
}

function writeJson(dir: string, name: string, data: unknown) {
  const filePath = path.join(dir, resultsDir, name);
  writeFileSync(filePath, JSON.stringify(data), "utf-8");
}

function runCompareSingle({
  baseline,
  current,
}: {
  baseline?: PerfResult[];
  current?: PerfResult[];
}) {
  const dir = createTempDir();
  const outputDir = path.join(dir, resultsDir);
  mkdirSync(outputDir, { recursive: true });
  if (baseline) {
    writeJson(dir, "baseline-worker0.json", baseline);
  }
  if (current) {
    writeJson(dir, "current-worker0.json", current);
  }
  execFileSync(process.execPath, [scriptPath], {
    cwd: dir,
    stdio: "pipe",
  });
  return readFileSync(path.join(outputDir, "comparison.md"), "utf-8");
}

function runCompareRounds({
  baseline,
  current,
}: {
  baseline: PerfResult[][];
  current: PerfResult[][];
}) {
  const dir = createTempDir();
  const outputDir = path.join(dir, resultsDir);
  mkdirSync(outputDir, { recursive: true });
  baseline.forEach((round, index) => {
    writeJson(dir, `baseline-${index + 1}-worker0.json`, round);
  });
  current.forEach((round, index) => {
    writeJson(dir, `current-${index + 1}-worker0.json`, round);
  });
  execFileSync(process.execPath, [scriptPath], {
    cwd: dir,
    stdio: "pipe",
  });
  return readFileSync(path.join(outputDir, "comparison.md"), "utf-8");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("perf-compare", () => {
  test("reports no significant changes when within threshold", () => {
    const markdown = runCompareSingle({
      baseline: [
        createResult("toggle classes", { scripting: 100, total: 100 }),
      ],
      current: [createResult("toggle classes", { scripting: 105, total: 105 })],
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("flags a regression above the threshold", () => {
    const markdown = runCompareSingle({
      baseline: [
        createResult("toggle classes", { scripting: 100, total: 100 }),
      ],
      current: [createResult("toggle classes", { scripting: 130, total: 130 })],
    });
    expect(markdown).toContain("+30%");
    expect(markdown).toContain(":warning:");
  });

  test("flags an improvement above the threshold", () => {
    const markdown = runCompareSingle({
      baseline: [
        createResult("toggle classes", { scripting: 100, total: 100 }),
      ],
      current: [createResult("toggle classes", { scripting: 70, total: 70 })],
    });
    expect(markdown).toContain("-30%");
    expect(markdown).toContain(":rocket:");
  });

  test("does not flag tiny absolute changes that exceed the threshold", () => {
    // The painting metric goes from 0.4ms → 0.6ms (50% but only 0.2ms). The
    // floor blocks the warning so CDP quantization noise doesn't read as a
    // regression. Total moves only 0.2ms so it stays quiet too.
    const markdown = runCompareSingle({
      baseline: [
        createResult("tiny", {
          scripting: 1,
          painting: 0.4,
          total: 1.4,
        }),
      ],
      current: [
        createResult("tiny", {
          scripting: 1,
          painting: 0.6,
          total: 1.6,
        }),
      ],
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("does not flag sub-metric jitter when primary metrics stay flat", () => {
    // Layout drops by 5ms while painting rises by 5ms; rendering and total
    // both stay flat. Layout and painting are not primary metrics, so the
    // jitter must not surface as a warning.
    const markdown = runCompareSingle({
      baseline: [
        createResult("jitter", {
          scripting: 100,
          layout: 15,
          painting: 5,
          rendering: 20,
          total: 120,
        }),
      ],
      current: [
        createResult("jitter", {
          scripting: 100,
          layout: 10,
          painting: 10,
          rendering: 20,
          total: 120,
        }),
      ],
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("flags rendering when its sub-metrics combine into a real shift", () => {
    const markdown = runCompareSingle({
      baseline: [
        createResult("render shift", {
          scripting: 50,
          layout: 20,
          painting: 20,
          rendering: 40,
          total: 90,
        }),
      ],
      current: [
        createResult("render shift", {
          scripting: 50,
          layout: 30,
          painting: 30,
          rendering: 60,
          total: 110,
        }),
      ],
    });
    expect(markdown).toContain(":warning:");
    expect(markdown).toMatch(/Rendering.*\+50%/s);
  });

  test("does not flag a regression when rounds disagree on direction", () => {
    const baselineRounds = [100, 100, 100, 100, 100].map((value) => [
      createResult("noisy bench", { scripting: value, total: value }),
    ]);
    // Five rounds with a slim majority claiming regression and a couple of
    // rounds going the other way. The median is a regression but rounds do
    // not agree, so this must not be flagged.
    const currentRounds = [130, 135, 90, 88, 132].map((value) => [
      createResult("noisy bench", { scripting: value, total: value }),
    ]);
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
    expect(markdown).toContain("Comparison spans 5 interleaved");
  });

  test("flags a consistent regression across rounds", () => {
    const baselineRounds = [100, 102, 99, 101, 100].map((value) => [
      createResult("consistent bench", { scripting: value, total: value }),
    ]);
    const currentRounds = [130, 128, 132, 129, 131].map((value) => [
      createResult("consistent bench", { scripting: value, total: value }),
    ]);
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain(":warning:");
    expect(markdown).toContain("+30%");
  });

  test("tolerates a single dissenting round when there are 5", () => {
    const baselineRounds = [100, 100, 100, 100, 100].map((value) => [
      createResult("robust bench", { scripting: value, total: value }),
    ]);
    // 4 of 5 rounds show a regression; 1 round shows a tiny noise gain.
    const currentRounds = [130, 132, 95, 128, 134].map((value) => [
      createResult("robust bench", { scripting: value, total: value }),
    ]);
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain(":warning:");
  });

  test("does not flag with two dissenters at five rounds", () => {
    const baselineRounds = [100, 100, 100, 100, 100].map((value) => [
      createResult("two-dissent bench", { scripting: value, total: value }),
    ]);
    // 3 of 5 regress, 2 disagree — beyond the single-dissenter tolerance.
    const currentRounds = [130, 132, 128, 95, 92].map((value) => [
      createResult("two-dissent bench", { scripting: value, total: value }),
    ]);
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("requires unanimity with three rounds", () => {
    const baselineRounds = [100, 100, 100].map((value) => [
      createResult("small-n bench", { scripting: value, total: value }),
    ]);
    // 2 of 3 regress; with only three rounds we require unanimity.
    const currentRounds = [130, 132, 95].map((value) => [
      createResult("small-n bench", { scripting: value, total: value }),
    ]);
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("flags a unanimous regression with three rounds", () => {
    const baselineRounds = [100, 100, 100].map((value) => [
      createResult("three-round bench", { scripting: value, total: value }),
    ]);
    const currentRounds = [128, 130, 132].map((value) => [
      createResult("three-round bench", { scripting: value, total: value }),
    ]);
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain(":warning:");
    expect(markdown).toContain("+30%");
  });

  test("requires unanimity with two paired rounds", () => {
    // With two rounds, accepting a single agreeing direction would let any
    // disagreeing pair flag whatever way the median happens to fall — exactly
    // the flip-flop the agreement check exists to filter. Bumping to N=2
    // makes both rounds matter.
    const baselineRounds = [
      [createResult("two-round", { scripting: 100, total: 100 })],
      [createResult("two-round", { scripting: 100, total: 100 })],
    ];
    // Round 1 regresses, round 2 improves — median is +15% but rounds
    // disagree on direction.
    const currentRounds = [
      [createResult("two-round", { scripting: 150, total: 150 })],
      [createResult("two-round", { scripting: 80, total: 80 })],
    ];
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("flags a unanimous regression with two paired rounds", () => {
    const baselineRounds = [
      [createResult("two-round-pass", { scripting: 100, total: 100 })],
      [createResult("two-round-pass", { scripting: 100, total: 100 })],
    ];
    const currentRounds = [
      [createResult("two-round-pass", { scripting: 130, total: 130 })],
      [createResult("two-round-pass", { scripting: 132, total: 132 })],
    ];
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain(":warning:");
  });

  test("counts zero-baseline rounds toward the agreement denominator", () => {
    // Baseline `[0, 100]` and current `[0, 130]` median to `50ms → 65ms`
    // (+30%). Only the second paired round provides agreeing direction; the
    // first round is `0 → 0` and contributes nothing. With two paired rounds
    // unanimity is required, so this must not flag — even though one round
    // alone agrees with the median direction. Filtering the zero-baseline
    // round out of the agreement check would shrink the denominator to one
    // and let a single agreeing round pass.
    const baselineRounds = [
      [createResult("zero-baseline", { scripting: 0, total: 0 })],
      [createResult("zero-baseline", { scripting: 100, total: 100 })],
    ];
    const currentRounds = [
      [createResult("zero-baseline", { scripting: 0, total: 0 })],
      [createResult("zero-baseline", { scripting: 130, total: 130 })],
    ];
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain("No significant performance changes detected.");
    expect(markdown).not.toMatch(/% :warning:/);
  });

  test("does not flag tests with no shared rounds", () => {
    // Baseline ran only round 1, current ran only round 2. No round produced
    // both sides, so cross-round medians would be the only comparison —
    // exactly the runner-noise the rounds layout is supposed to filter. The
    // test must surface as unpaired and never get a flag, even if the
    // cross-round values look like a regression.
    const dir = createTempDir();
    const outputDir = path.join(dir, resultsDir);
    mkdirSync(outputDir, { recursive: true });
    writeJson(dir, "baseline-1-worker0.json", [
      createResult("disjoint", { scripting: 100, total: 100 }),
    ]);
    writeJson(dir, "current-2-worker0.json", [
      createResult("disjoint", { scripting: 130, total: 130 }),
    ]);
    execFileSync(process.execPath, [scriptPath], {
      cwd: dir,
      stdio: "pipe",
    });
    const markdown = readFileSync(
      path.join(outputDir, "comparison.md"),
      "utf-8",
    );
    expect(markdown).not.toMatch(/% :warning:/);
    expect(markdown).toContain("Tests without paired rounds");
    expect(markdown).toMatch(/disjoint.*\| 1 \| 2 \|/);
    // Headline must reflect the unpaired state instead of falling through to
    // "No performance results found." — the breakdown below contradicts that.
    expect(markdown).toContain(
      "No comparable rounds across baseline and current.",
    );
    expect(markdown).not.toContain("No performance results found.");
  });

  test("notes mixed paired-round counts in the footer", () => {
    // One test has all three rounds paired; another has only the second
    // round paired. The footer must call out the mixed counts so readers
    // don't assume the agreement check spans the same number of rounds for
    // every row.
    const dir = createTempDir();
    const outputDir = path.join(dir, resultsDir);
    mkdirSync(outputDir, { recursive: true });
    for (let i = 1; i <= 3; i++) {
      writeJson(dir, `baseline-${i}-worker0.json`, [
        createResult("full-rounds", { scripting: 100, total: 100 }),
      ]);
      writeJson(dir, `current-${i}-worker0.json`, [
        createResult("full-rounds", { scripting: 100, total: 100 }),
      ]);
    }
    writeJson(dir, "baseline-2-worker0.json", [
      createResult("full-rounds", { scripting: 100, total: 100 }),
      createResult("partial", { scripting: 100, total: 100 }),
    ]);
    writeJson(dir, "current-2-worker0.json", [
      createResult("full-rounds", { scripting: 100, total: 100 }),
      createResult("partial", { scripting: 100, total: 100 }),
    ]);
    execFileSync(process.execPath, [scriptPath], {
      cwd: dir,
      stdio: "pipe",
    });
    const markdown = readFileSync(
      path.join(outputDir, "comparison.md"),
      "utf-8",
    );
    expect(markdown).toContain("mix of paired baseline/current round counts");
    expect(markdown).toMatch(/1.{1,3}3 rounds/);
  });

  test("aggregates from shared rounds when round counts differ", () => {
    // Baseline has four rounds; current has only two. The unpaired baseline
    // rounds (3-4) are far slower — if they leaked into the displayed
    // baseline median the comparison would report an improvement instead of
    // a regression.
    const baselineRounds = [
      [createResult("asymmetric", { scripting: 100, total: 100 })],
      [createResult("asymmetric", { scripting: 100, total: 100 })],
      [createResult("asymmetric", { scripting: 200, total: 200 })],
      [createResult("asymmetric", { scripting: 200, total: 200 })],
    ];
    const currentRounds = [
      [createResult("asymmetric", { scripting: 130, total: 130 })],
      [createResult("asymmetric", { scripting: 130, total: 130 })],
    ];
    const markdown = runCompareRounds({
      baseline: baselineRounds,
      current: currentRounds,
    });
    expect(markdown).toContain(":warning:");
    expect(markdown).toContain("+30%");
  });

  test("reports renamed tests as new and removed", () => {
    const markdown = runCompareSingle({
      baseline: [createResult("old name", { scripting: 100, total: 100 })],
      current: [createResult("new name", { scripting: 100, total: 100 })],
    });
    expect(markdown).toContain("### New tests (no baseline)");
    expect(markdown).toContain("### Removed tests");
    expect(markdown).toContain("- old name");
    expect(markdown).toContain("new name");
  });

  test("reports a metric that goes from zero to non-trivial", () => {
    // The from-zero branch needs a current value above MIN_DELTA_MS,
    // otherwise the same floor that suppresses CDP quantization noise
    // suppresses this case too.
    const markdown = runCompareSingle({
      baseline: [createResult("zero-to-nonzero", { scripting: 0, total: 0 })],
      current: [createResult("zero-to-nonzero", { scripting: 10, total: 10 })],
    });
    expect(markdown).toContain(":warning:");
  });

  test("hard-fails when a results file is malformed JSON", () => {
    // Silently treating a corrupt artifact as missing input would surface as
    // "No baseline results available" in the PR comment, hiding the real
    // problem. The comparator must exit non-zero with the file path so CI
    // fails loudly.
    const dir = createTempDir();
    const outputDir = path.join(dir, resultsDir);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(path.join(outputDir, "baseline-worker0.json"), "{", "utf-8");
    writeJson(dir, "current-worker0.json", [
      createResult("bench", { scripting: 100, total: 100 }),
    ]);
    expect(() =>
      execFileSync(process.execPath, [scriptPath], {
        cwd: dir,
        stdio: "pipe",
      }),
    ).toThrowError(/Failed to parse perf results/);
  });

  test("ignores unrelated round files when discovering numbered rounds", () => {
    // Even though `current-1-worker0.json` exists for some other prefix
    // (e.g., another concurrent run) `baseline-worker0.json` is the only
    // file matching prefix=baseline, so the legacy single-round path kicks in.
    const dir = createTempDir();
    const outputDir = path.join(dir, resultsDir);
    mkdirSync(outputDir, { recursive: true });
    writeJson(dir, "baseline-worker0.json", [
      createResult("bench", { scripting: 100, total: 100 }),
    ]);
    writeJson(dir, "current-1-worker0.json", [
      createResult("bench", { scripting: 130, total: 130 }),
    ]);
    execFileSync(process.execPath, [scriptPath], {
      cwd: dir,
      stdio: "pipe",
    });
    const markdown = readFileSync(
      path.join(outputDir, "comparison.md"),
      "utf-8",
    );
    expect(markdown).toContain(":warning:");
    expect(markdown).toContain("+30%");
  });

  test("combines worker shards that report the same test in the same round", () => {
    // Shouldn't happen today (`workers: 1` is forced for PERF_TEST), but the
    // file naming scheme allows it. If the comparator silently dropped the
    // second shard the median would be 200ms (worker0) instead of the median
    // of [200, 100] = 150ms — exposing the regression as +50% instead of +30%.
    const dir = createTempDir();
    const outputDir = path.join(dir, resultsDir);
    mkdirSync(outputDir, { recursive: true });
    writeJson(dir, "baseline-1-worker0.json", [
      createResult("shard", { scripting: 100, total: 100 }),
    ]);
    writeJson(dir, "baseline-1-worker1.json", [
      createResult("shard", { scripting: 100, total: 100 }),
    ]);
    writeJson(dir, "current-1-worker0.json", [
      createResult("shard", { scripting: 200, total: 200 }),
    ]);
    writeJson(dir, "current-1-worker1.json", [
      createResult("shard", { scripting: 100, total: 100 }),
    ]);
    execFileSync(process.execPath, [scriptPath], {
      cwd: dir,
      stdio: "pipe",
    });
    const markdown = readFileSync(
      path.join(outputDir, "comparison.md"),
      "utf-8",
    );
    expect(markdown).toContain(":warning:");
    expect(markdown).toContain("+50%");
    expect(markdown).not.toContain("+100%");
  });

  test("warns when only one side has profile data for a test", () => {
    const baselineWithProfile = createResult("profile-mismatch", {
      scripting: 100,
      total: 100,
    });
    baselineWithProfile.profiles = {
      script: [
        {
          functionName: "expensive",
          url: "src/example.ts",
          line: 1,
          column: 1,
          selfTime: 50,
          totalTime: 50,
          hitCount: 5,
        },
      ],
    };
    const markdown = runCompareSingle({
      baseline: [baselineWithProfile],
      current: [
        createResult("profile-mismatch", { scripting: 100, total: 100 }),
      ],
    });
    expect(markdown).toContain("Profile data differs between baseline");
    expect(markdown).toContain("profile-mismatch");
  });
});
