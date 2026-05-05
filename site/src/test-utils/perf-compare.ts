import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  mergeScriptProfiles,
  mergeSelectorProfiles,
  type PerfMetrics,
  type PerfProfiles,
  type PerfResult,
  type PerfScriptProfileEntry,
  type PerfSelectorProfileEntry,
} from "./perf.ts";

const RESULTS_DIR = path.join(process.cwd(), ".perf-results");
const PROFILE_LIMIT = 10;
const THRESHOLD_PERCENT = 10;
const MIN_SIGNIFICANT_DELTA_MS = 5;

type MetricKey = keyof PerfMetrics;

interface ComparisonRow {
  testFile: string;
  label: string;
  metric: MetricKey;
  baseline: number;
  current: number;
  delta: number;
  percent: number;
  pairedRoundsCount: number;
  perRoundDeltas: number[];
  agreement: number;
  significant: boolean;
}

interface ComparisonSummary {
  rows: ComparisonRow[];
  hasSignificantChanges: boolean;
  currentResults: AggregatedPerfResult[];
  profileModeMismatches: ProfileModeMismatch[];
  newTests: AggregatedPerfResult[];
  removedTests: AggregatedPerfResult[];
  unpairedTests: UnpairedTest[];
  pairedRoundsCount: number | null;
}

interface PersistedComparisonSummary {
  rows: ComparisonRow[];
  hasSignificantChanges: boolean;
  profileModeMismatches: ProfileModeMismatch[];
  newTests: PerfResult[];
  removedTests: PerfResult[];
  unpairedTests: UnpairedTest[];
  pairedRoundsCount: number | null;
}

interface ProfileModeMismatch {
  testFile: string;
  label: string;
  profile: "script" | "selectors";
  baseline: boolean;
  current: boolean;
}

interface RoundPerfResult {
  roundIndex: number;
  result: PerfResult;
}

interface AggregatedPerfResult {
  key: string;
  result: PerfResult;
  byRound: Map<number, PerfResult>;
}

interface UnpairedTest {
  testFile: string;
  label: string;
  baselineRounds: number[];
  currentRounds: number[];
}

interface DiscoveredRoundFile {
  filePath: string;
  roundIndex: number;
}

// Primary metrics shown in the summary table.
const PRIMARY_METRICS: MetricKey[] = ["scripting", "rendering", "total"];

// All metrics shown in the detailed breakdown.
const ALL_METRICS: MetricKey[] = [
  "scripting",
  "rendering",
  "layout",
  "styleRecalc",
  "painting",
  "inp",
  "total",
];

const METRIC_LABELS: Record<MetricKey, string> = {
  scripting: "Scripting",
  layout: "Layout",
  styleRecalc: "Style recalc",
  painting: "Painting",
  rendering: "Rendering",
  inp: "INP",
  total: "Total",
};

// Rendering sub-metrics are indented in the detailed breakdown.
const RENDERING_SUB_METRICS = new Set<MetricKey>([
  "layout",
  "styleRecalc",
  "painting",
]);

function readJsonFile(filePath: string): unknown {
  let contents: string;
  try {
    contents = readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read perf results at ${filePath}`, {
      cause: error,
    });
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`Failed to parse perf results at ${filePath}`, {
      cause: error,
    });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Discover round files like `baseline-1-worker0.json` and
// `current-1-worker0.json`. If no numbered rounds are present, fall back to
// the previous single-run files such as `baseline-worker0.json`.
function discoverRoundFiles(prefix: string): DiscoveredRoundFile[] {
  if (!existsSync(RESULTS_DIR)) return [];
  const files = readdirSync(RESULTS_DIR)
    .filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
    .sort();

  const numbered: DiscoveredRoundFile[] = [];
  const roundPattern = new RegExp(
    `^${escapeRegExp(prefix)}-(\\d+)(?:-.+)?\\.json$`,
  );
  for (const file of files) {
    const match = file.match(roundPattern);
    if (!match) continue;
    const roundIndex = Number(match[1] ?? 0);
    if (!Number.isInteger(roundIndex) || roundIndex <= 0) continue;
    numbered.push({
      filePath: path.join(RESULTS_DIR, file),
      roundIndex,
    });
  }
  if (numbered.length > 0) {
    return numbered.sort(
      (a, b) =>
        a.roundIndex - b.roundIndex || a.filePath.localeCompare(b.filePath),
    );
  }

  return files.map((file) => ({
    filePath: path.join(RESULTS_DIR, file),
    roundIndex: 1,
  }));
}

function loadRounds(prefix: string): RoundPerfResult[] {
  const rounds: RoundPerfResult[] = [];
  for (const { filePath, roundIndex } of discoverRoundFiles(prefix)) {
    const data = readJsonFile(filePath);
    if (!Array.isArray(data)) {
      throw new Error(
        `Invalid perf results format at ${filePath}: expected an array of results.`,
      );
    }
    for (const result of data) {
      rounds.push({ roundIndex, result: result as PerfResult });
    }
  }
  return rounds;
}

function median(values: number[]): number {
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

function computeMedianMetrics(all: PerfMetrics[]): PerfMetrics {
  return {
    scripting: median(all.map((m) => m.scripting)),
    layout: median(all.map((m) => m.layout)),
    styleRecalc: median(all.map((m) => m.styleRecalc)),
    painting: median(all.map((m) => m.painting)),
    rendering: median(all.map((m) => m.rendering)),
    inp: median(all.map((m) => m.inp)),
    total: median(all.map((m) => m.total)),
  };
}

function mergeProfiles(results: PerfResult[]): PerfProfiles | undefined {
  const scriptProfiles: PerfScriptProfileEntry[][] = [];
  const selectorProfiles: PerfSelectorProfileEntry[][] = [];
  for (const result of results) {
    if (result.profiles?.script && result.profiles.script.length > 0) {
      scriptProfiles.push(result.profiles.script);
    }
    if (result.profiles?.selectors && result.profiles.selectors.length > 0) {
      selectorProfiles.push(result.profiles.selectors);
    }
  }
  const profiles: PerfProfiles = {};
  if (scriptProfiles.length > 0) {
    profiles.script = mergeScriptProfiles(scriptProfiles, PROFILE_LIMIT);
  }
  if (selectorProfiles.length > 0) {
    profiles.selectors = mergeSelectorProfiles(selectorProfiles, PROFILE_LIMIT);
  }
  if (!profiles.script && !profiles.selectors) return;
  return profiles;
}

function combineResults(results: PerfResult[]): PerfResult | undefined {
  const first = results[0];
  if (!first) return;
  return {
    ...first,
    metrics: computeMedianMetrics(results.map((result) => result.metrics)),
    raw: results.flatMap((result) => result.raw),
    profiles: mergeProfiles(results),
  };
}

function createAggregatedResult(
  key: string,
  byRound: Map<number, PerfResult>,
): AggregatedPerfResult | undefined {
  const results = [...byRound.values()];
  const result = combineResults(results);
  if (!result) return;
  return {
    key,
    byRound,
    result,
  };
}

function aggregateByKey(
  roundResults: RoundPerfResult[],
): Map<string, AggregatedPerfResult> {
  const grouped = new Map<string, Map<number, PerfResult[]>>();
  for (const { roundIndex, result } of roundResults) {
    const key = resultKey(result);
    let byRound = grouped.get(key);
    if (!byRound) {
      byRound = new Map();
      grouped.set(key, byRound);
    }
    const resultsForRound = byRound.get(roundIndex);
    if (resultsForRound) {
      resultsForRound.push(result);
    } else {
      byRound.set(roundIndex, [result]);
    }
  }

  const aggregated = new Map<string, AggregatedPerfResult>();
  for (const [key, groupedByRound] of grouped) {
    const byRound = new Map<number, PerfResult>();
    for (const [roundIndex, roundResults] of groupedByRound) {
      const result = combineResults(roundResults);
      if (!result) continue;
      byRound.set(roundIndex, result);
    }
    const result = createAggregatedResult(key, byRound);
    if (!result) continue;
    aggregated.set(key, result);
  }
  return aggregated;
}

function getSharedRoundIndices(
  baseline: AggregatedPerfResult,
  current: AggregatedPerfResult,
) {
  const roundIndices: number[] = [];
  for (const roundIndex of current.byRound.keys()) {
    if (baseline.byRound.has(roundIndex)) {
      roundIndices.push(roundIndex);
    }
  }
  return roundIndices.sort((a, b) => a - b);
}

function requiredAgreement(roundsCount: number) {
  if (roundsCount <= 1) return 1;
  if (roundsCount <= 4) return roundsCount;
  return roundsCount - 1;
}

function computeSignificance({
  baseline,
  current,
  metric,
  percent,
  perRoundDeltas,
}: {
  baseline: number;
  current: number;
  metric: MetricKey;
  percent: number;
  perRoundDeltas: number[];
}) {
  if (perRoundDeltas.length === 0) {
    return { agreement: 0, significant: false };
  }

  const delta = current - baseline;
  const direction = Math.sign(delta);
  let agreement = 0;
  for (const roundDelta of perRoundDeltas) {
    if (Math.sign(roundDelta) === direction) {
      agreement += 1;
    }
  }

  const percentOk = Math.abs(percent) > THRESHOLD_PERCENT;
  const deltaOk = Math.abs(delta) >= MIN_SIGNIFICANT_DELTA_MS;
  const zeroBaselineOk =
    baseline === 0 && Math.abs(current) >= MIN_SIGNIFICANT_DELTA_MS;
  const magnitudeOk = baseline === 0 ? zeroBaselineOk : percentOk && deltaOk;
  const agreementOk = agreement >= requiredAgreement(perRoundDeltas.length);
  const primaryMetric = PRIMARY_METRICS.includes(metric);

  return {
    agreement,
    significant: primaryMetric && magnitudeOk && agreementOk,
  };
}

function formatMs(value: number): string {
  return `${value.toFixed(1)}ms`;
}

function formatDelta(delta: number, percent: number, baseline: number): string {
  const sign = delta >= 0 ? "+" : "";
  if (baseline === 0) {
    return `${sign}${formatMs(delta)}`;
  }
  return `${sign}${formatMs(delta)} (${sign}${percent.toFixed(0)}%)`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

function escapeTableCell(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/[\r\n\t]/g, " ")
    .trim();
}

function resultKey(result: PerfResult): string {
  return `${result.testFile}::${result.label}`;
}

function hasProfile(
  result: AggregatedPerfResult,
  profile: "script" | "selectors",
) {
  return (result.result.profiles?.[profile]?.length ?? 0) > 0;
}

function compare(): ComparisonSummary {
  const baseline = aggregateByKey(loadRounds("baseline"));
  const current = aggregateByKey(loadRounds("current"));

  const rows: ComparisonRow[] = [];
  const profileModeMismatches: ProfileModeMismatch[] = [];
  const newTests: AggregatedPerfResult[] = [];
  const removedTests: AggregatedPerfResult[] = [];
  const unpairedTests: UnpairedTest[] = [];

  for (const [key, cur] of current) {
    const base = baseline.get(key);
    if (!base) {
      newTests.push(cur);
      continue;
    }
    for (const profile of ["script", "selectors"] as const) {
      const baselineHasProfile = hasProfile(base, profile);
      const currentHasProfile = hasProfile(cur, profile);
      if (baselineHasProfile === currentHasProfile) continue;
      profileModeMismatches.push({
        testFile: cur.result.testFile,
        label: cur.result.label,
        profile,
        baseline: baselineHasProfile,
        current: currentHasProfile,
      });
    }

    const sharedRoundIndices = getSharedRoundIndices(base, cur);
    if (sharedRoundIndices.length === 0) {
      unpairedTests.push({
        testFile: cur.result.testFile,
        label: cur.result.label,
        baselineRounds: [...base.byRound.keys()].sort((a, b) => a - b),
        currentRounds: [...cur.byRound.keys()].sort((a, b) => a - b),
      });
      continue;
    }

    for (const metric of ALL_METRICS) {
      const baselineValues: number[] = [];
      const currentValues: number[] = [];
      const perRoundDeltas: number[] = [];
      for (const roundIndex of sharedRoundIndices) {
        const baselineRound = base.byRound.get(roundIndex);
        const currentRound = cur.byRound.get(roundIndex);
        if (!baselineRound || !currentRound) continue;
        const baselineValue = baselineRound.metrics[metric];
        const currentValue = currentRound.metrics[metric];
        baselineValues.push(baselineValue);
        currentValues.push(currentValue);
        perRoundDeltas.push(currentValue - baselineValue);
      }

      const baseVal = median(baselineValues);
      const curVal = median(currentValues);
      const delta = curVal - baseVal;
      const percent = baseVal > 0 ? (delta / baseVal) * 100 : 0;
      const { agreement, significant } = computeSignificance({
        baseline: baseVal,
        current: curVal,
        metric,
        percent,
        perRoundDeltas,
      });
      rows.push({
        testFile: cur.result.testFile,
        label: cur.result.label,
        metric,
        baseline: baseVal,
        current: curVal,
        delta,
        percent,
        pairedRoundsCount: sharedRoundIndices.length,
        perRoundDeltas,
        agreement,
        significant,
      });
    }
  }

  for (const [key, base] of baseline) {
    if (!current.has(key)) {
      removedTests.push(base);
    }
  }

  const pairedRoundsCounts = new Set(rows.map((row) => row.pairedRoundsCount));

  return {
    rows,
    hasSignificantChanges: rows.some((r) => r.significant),
    currentResults: [...current.values()],
    profileModeMismatches,
    newTests,
    removedTests,
    unpairedTests,
    pairedRoundsCount:
      pairedRoundsCounts.size === 0
        ? 0
        : pairedRoundsCounts.size === 1
          ? (pairedRoundsCounts.values().next().value ?? 0)
          : null,
  };
}

function rowKey(row: ComparisonRow): string {
  return `${row.testFile}::${row.label}`;
}

function formatRoundList(rounds: number[]): string {
  if (rounds.length === 0) return "-";
  return rounds.join(", ");
}

function formatSummaryTable(rows: ComparisonRow[], keys: string[]): string[] {
  const lines: string[] = [];
  lines.push("| Test | Scripting | Rendering | Total |");
  lines.push("|------|-----------|-----------|-------|");

  for (const key of keys) {
    const testRows = rows.filter((r) => rowKey(r) === key);
    const label = testRows[0]?.label ?? key;
    const cells: string[] = [label];
    for (const metric of PRIMARY_METRICS) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) {
        cells.push("--");
        continue;
      }
      let cell = `${formatMs(row.baseline)} \u2192 ${formatMs(row.current)}`;
      cell +=
        row.baseline === 0
          ? " (n/a)"
          : ` (${row.delta >= 0 ? "+" : ""}${row.percent.toFixed(0)}%)`;
      if (row.significant) {
        cell += row.delta > 0 ? " :warning:" : " :rocket:";
      }
      cells.push(cell);
    }
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines;
}

function formatScriptProfile(result: PerfResult): string[] {
  const profile = result.profiles?.script;
  if (!profile) return [];
  if (profile.length === 0) return [];

  const lines: string[] = [];
  lines.push("#### Script profile");
  lines.push("");
  lines.push("| Function | Self | Total | Hits | Source |");
  lines.push("|----------|------|-------|------|--------|");

  for (const item of profile) {
    const source = `${item.url}:${item.line}:${item.column}`;
    lines.push(
      `| ${escapeTableCell(item.functionName)} | ${formatMs(item.selfTime)} | ${formatMs(item.totalTime)} | ${item.hitCount} | ${escapeTableCell(source)} |`,
    );
  }

  lines.push("");
  return lines;
}

function formatSelectorProfile(result: PerfResult): string[] {
  const profile = result.profiles?.selectors;
  if (!profile) return [];
  if (profile.length === 0) return [];

  const lines: string[] = [];
  lines.push("#### Selector profile");
  lines.push("");
  lines.push(
    "| Selector | Elapsed | Attempts | Matches | Slow non-match | Stylesheet |",
  );
  lines.push(
    "|----------|---------|----------|---------|----------------|------------|",
  );

  for (const item of profile) {
    lines.push(
      `| ${escapeTableCell(item.selector)} | ${formatMs(item.elapsed)} | ${item.matchAttempts} | ${item.matchCount} | ${formatPercent(item.slowPathNonMatchPercent)} | ${escapeTableCell(item.styleSheetUrl || item.styleSheetId)} |`,
    );
  }

  lines.push("");
  return lines;
}

function formatProfiles(result?: PerfResult): string[] {
  if (!result) return [];
  return [...formatScriptProfile(result), ...formatSelectorProfile(result)];
}

function formatProfileModeWarning(mismatches: ProfileModeMismatch[]): string[] {
  if (mismatches.length === 0) return [];

  const lines: string[] = [];
  lines.push(
    ":warning: Profile data differs between baseline and current. Run both sides with the same profiling flags before comparing aggregate metrics.",
  );
  lines.push("");
  lines.push("| Test | Profile | Baseline | Current |");
  lines.push("|------|---------|----------|---------|");
  for (const mismatch of mismatches) {
    lines.push(
      `| ${escapeTableCell(mismatch.label)} | ${mismatch.profile} | ${mismatch.baseline ? "yes" : "no"} | ${mismatch.current ? "yes" : "no"} |`,
    );
  }
  lines.push("");
  return lines;
}

function formatDetailedBreakdown(
  rows: ComparisonRow[],
  keys: string[],
  currentByKey: Map<string, AggregatedPerfResult>,
): string[] {
  const lines: string[] = [];
  for (const key of keys) {
    const testRows = rows.filter((r) => rowKey(r) === key);
    const label = testRows[0]?.label ?? key;
    lines.push(`### ${label}`);
    lines.push("");
    lines.push("| Metric | Baseline | Current | Delta |");
    lines.push("|--------|----------|---------|-------|");
    for (const metric of ALL_METRICS) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) continue;
      const prefix = RENDERING_SUB_METRICS.has(metric) ? "- " : "";
      const metricLabel = `${prefix}${METRIC_LABELS[metric]}`;
      const deltaStr = formatDelta(row.delta, row.percent, row.baseline);
      let icon = "";
      if (row.significant) {
        icon = row.delta > 0 ? " :warning:" : " :rocket:";
      }
      lines.push(
        `| ${metricLabel} | ${formatMs(row.baseline)} | ${formatMs(row.current)} | ${deltaStr}${icon} |`,
      );
    }
    lines.push("");
    lines.push(...formatProfiles(currentByKey.get(key)?.result));
  }
  return lines;
}

function formatMarkdown(summary: ComparisonSummary): string {
  const {
    rows,
    hasSignificantChanges,
    currentResults,
    profileModeMismatches,
    newTests,
    removedTests,
    unpairedTests,
    pairedRoundsCount,
  } = summary;
  const currentByKey = new Map<string, AggregatedPerfResult>();
  for (const result of currentResults) {
    currentByKey.set(result.key, result);
  }

  const allKeys = [...new Set(rows.map((r) => rowKey(r)))];
  const significantKeys = allKeys.filter((key) =>
    rows.some((r) => rowKey(r) === key && r.significant),
  );

  const totalTests =
    allKeys.length +
    newTests.length +
    removedTests.length +
    unpairedTests.length;

  const lines: string[] = [];
  lines.push("## Performance");
  lines.push("");

  if (hasSignificantChanges) {
    lines.push(...formatSummaryTable(rows, significantKeys));
  } else if (rows.length === 0 && newTests.length > 0) {
    lines.push("No baseline results available for comparison.");
  } else if (rows.length === 0 && unpairedTests.length > 0) {
    lines.push("No paired performance results available for comparison.");
  } else if (rows.length === 0 && newTests.length === 0) {
    lines.push("No performance results found.");
  } else {
    lines.push("No significant performance changes detected.");
  }

  if (unpairedTests.length > 0) {
    const visibleUnpairedTests = unpairedTests.slice(0, 5);
    const hiddenUnpairedTests =
      unpairedTests.length - visibleUnpairedTests.length;
    const label = unpairedTests.length === 1 ? "test" : "tests";
    const verb = unpairedTests.length === 1 ? "was" : "were";
    lines.push("");
    lines.push(
      `:warning: ${unpairedTests.length} ${label} had no paired baseline/current rounds and ${verb} not compared.`,
    );
    for (const result of visibleUnpairedTests) {
      lines.push(`- ${result.label}`);
    }
    if (hiddenUnpairedTests > 0) {
      lines.push(`- ...and ${hiddenUnpairedTests} more.`);
    }
  }

  lines.push("");
  lines.push(...formatProfileModeWarning(profileModeMismatches));
  lines.push(`<details>`);
  lines.push(`<summary>Full breakdown (${totalTests} tests)</summary>`);
  lines.push("");
  lines.push(...formatDetailedBreakdown(rows, allKeys, currentByKey));

  if (newTests.length > 0) {
    lines.push("### New tests (no baseline)");
    lines.push("");
    lines.push("| Test | Scripting | Rendering | Total |");
    lines.push("|------|-----------|-----------|-------|");
    for (const { result } of newTests) {
      const cells: string[] = [result.label];
      for (const metric of PRIMARY_METRICS) {
        cells.push(formatMs(result.metrics[metric]));
      }
      lines.push(`| ${cells.join(" | ")} |`);
    }
    lines.push("");

    for (const { result } of newTests) {
      const profileLines = formatProfiles(result);
      if (profileLines.length === 0) continue;
      lines.push(`#### ${result.label}`);
      lines.push("");
      lines.push(...profileLines);
    }
  }

  if (unpairedTests.length > 0) {
    lines.push("### Unpaired tests");
    lines.push("");
    lines.push(
      "These tests produced baseline and current results, but no shared round index.",
    );
    lines.push("");
    lines.push("| Test | Baseline rounds | Current rounds |");
    lines.push("|------|-----------------|----------------|");
    for (const result of unpairedTests) {
      lines.push(
        `| ${escapeTableCell(result.label)} | ${formatRoundList(result.baselineRounds)} | ${formatRoundList(result.currentRounds)} |`,
      );
    }
    lines.push("");
  }

  if (removedTests.length > 0) {
    lines.push("### Removed tests");
    lines.push("");
    for (const { result } of removedTests) {
      lines.push(`- ${result.label}`);
    }
    lines.push("");
  }

  lines.push("</details>");
  lines.push("");

  lines.push(
    `:warning: = regression above ${THRESHOLD_PERCENT}% and ${formatMs(MIN_SIGNIFICANT_DELTA_MS)} · :rocket: = improvement above ${THRESHOLD_PERCENT}% and ${formatMs(MIN_SIGNIFICANT_DELTA_MS)}`,
  );
  if (pairedRoundsCount == null) {
    lines.push("");
    lines.push(
      "Compared tests used mixed interleaved round counts; a change is flagged only when the median exceeds the threshold and rounds agree on direction.",
    );
  } else if (pairedRoundsCount > 1) {
    lines.push("");
    lines.push(
      `Aggregated across ${pairedRoundsCount} interleaved rounds; a change is flagged only when the median exceeds the threshold and rounds agree on direction.`,
    );
  }

  return lines.join("\n");
}

function toPersistedSummary(
  summary: ComparisonSummary,
): PersistedComparisonSummary {
  return {
    rows: summary.rows,
    hasSignificantChanges: summary.hasSignificantChanges,
    profileModeMismatches: summary.profileModeMismatches,
    newTests: summary.newTests.map((entry) => entry.result),
    removedTests: summary.removedTests.map((entry) => entry.result),
    unpairedTests: summary.unpairedTests,
    pairedRoundsCount: summary.pairedRoundsCount,
  };
}

// Main
const summary = compare();
const markdown = formatMarkdown(summary);

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(
  path.join(RESULTS_DIR, "comparison.json"),
  JSON.stringify(toPersistedSummary(summary), null, 2),
);
writeFileSync(path.join(RESULTS_DIR, "comparison.md"), markdown);

console.log(markdown);
