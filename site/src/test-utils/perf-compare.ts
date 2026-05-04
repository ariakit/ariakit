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
// A metric must move by both this much in percent and at least MIN_DELTA_MS in
// absolute terms before it is flagged. Without an absolute floor a 1ms metric
// drifting to 1.2ms reads as a 20% regression even though the underlying
// timing is well inside CDP's quantization noise.
const THRESHOLD_PERCENT = 10;
const MIN_DELTA_MS = 1;

type MetricKey = keyof PerfMetrics;

interface RoundFile {
  filePath: string;
  roundIndex: number;
}

interface RoundResult {
  roundIndex: number;
  result: PerfResult;
}

interface AggregatedResult {
  testFile: string;
  testTitle: string;
  label: string;
  // Indexed by roundIndex so we can pair baseline and current entries from the
  // same round even when one side is missing a round for some test.
  byRound: Map<number, PerfResult>;
  metrics: PerfMetrics;
  profiles?: PerfProfiles;
}

interface ComparisonRow {
  testFile: string;
  label: string;
  metric: MetricKey;
  baseline: number;
  current: number;
  delta: number;
  percent: number;
  perRoundPercents: number[];
  agreement: number;
  significant: boolean;
}

interface ProfileModeMismatch {
  testFile: string;
  label: string;
  profile: "script" | "selectors";
  baseline: boolean;
  current: boolean;
}

interface ComparisonSummary {
  rows: ComparisonRow[];
  hasSignificantChanges: boolean;
  currentResults: AggregatedResult[];
  profileModeMismatches: ProfileModeMismatch[];
  newTests: AggregatedResult[];
  removedTests: AggregatedResult[];
  pairedRoundsCount: number;
}

interface PersistedComparisonSummary {
  rows: ComparisonRow[];
  hasSignificantChanges: boolean;
  profileModeMismatches: ProfileModeMismatch[];
  newTests: PerfResult[];
  removedTests: PerfResult[];
  pairedRoundsCount: number;
}

// Metrics that can trigger a warning/rocket flag. Sub-metrics (layout,
// styleRecalc, painting) and inp are still shown in the breakdown for
// debugging but they fluctuate enough at small absolute values that flagging
// them produces too many false positives.
const PRIMARY_METRICS: MetricKey[] = ["scripting", "rendering", "total"];

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

const RENDERING_SUB_METRICS = new Set<MetricKey>([
  "layout",
  "styleRecalc",
  "painting",
]);

function readJsonFile(filePath: string): PerfResult[] {
  if (!existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf-8"));
    if (Array.isArray(parsed)) return parsed as PerfResult[];
    return [];
  } catch (error) {
    console.warn(
      `Warning: failed to parse JSON file at ${filePath}. Falling back to empty results.`,
      error,
    );
    return [];
  }
}

// Discover round files like `baseline-1-worker0.json`, `baseline-2-worker0.json`,
// ... and expose each one's round number so per-round comparisons stay aligned
// across baseline and current even if a round is missing on one side. Falls
// back to single-round `baseline-worker*.json` (assigned roundIndex 1) so
// existing single-run setups keep working.
function discoverRoundFiles(prefix: string): RoundFile[] {
  if (!existsSync(RESULTS_DIR)) return [];
  const numbered: RoundFile[] = [];
  const fallback: RoundFile[] = [];
  for (const name of readdirSync(RESULTS_DIR)) {
    if (!name.endsWith(".json")) continue;
    const numberedMatch = name.match(/^(.+)-(\d+)-worker\d+\.json$/);
    if (numberedMatch && numberedMatch[1] === prefix) {
      numbered.push({
        filePath: path.join(RESULTS_DIR, name),
        roundIndex: Number(numberedMatch[2] ?? 0),
      });
      continue;
    }
    const singleMatch = name.match(/^(.+)-worker\d+\.json$/);
    if (singleMatch && singleMatch[1] === prefix) {
      fallback.push({
        filePath: path.join(RESULTS_DIR, name),
        roundIndex: 1,
      });
    }
  }
  if (numbered.length > 0) {
    return numbered.sort((a, b) => a.roundIndex - b.roundIndex);
  }
  return fallback;
}

function loadRounds(prefix: string): RoundResult[] {
  const discovered = discoverRoundFiles(prefix);
  const out: RoundResult[] = [];
  for (const { filePath, roundIndex } of discovered) {
    for (const result of readJsonFile(filePath)) {
      out.push({ roundIndex, result });
    }
  }
  return out;
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

function computeMedianMetrics(results: PerfResult[]): PerfMetrics {
  return {
    scripting: median(results.map((r) => r.metrics.scripting)),
    layout: median(results.map((r) => r.metrics.layout)),
    styleRecalc: median(results.map((r) => r.metrics.styleRecalc)),
    painting: median(results.map((r) => r.metrics.painting)),
    rendering: median(results.map((r) => r.metrics.rendering)),
    inp: median(results.map((r) => r.metrics.inp)),
    total: median(results.map((r) => r.metrics.total)),
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
  if (
    (profiles.script == null || profiles.script.length === 0) &&
    (profiles.selectors == null || profiles.selectors.length === 0)
  ) {
    return;
  }
  return profiles;
}

function resultKey(testFile: string, label: string): string {
  return `${testFile}::${label}`;
}

// Combine the worker shards that contributed to a single round into one
// representative `PerfResult`. Today Playwright forces `workers: 1` whenever
// `PERF_TEST=true` so this is single-pass, but the file naming scheme exposes
// `worker\d+`, and a future config change could land multiple shards in the
// same round. Without this, `aggregateByKey` would silently drop every shard
// after the first.
function combineWorkerShards(shards: PerfResult[]): PerfResult {
  const first = shards[0];
  if (!first) {
    throw new Error("combineWorkerShards: expected at least one shard");
  }
  if (shards.length === 1) return first;
  return {
    testFile: first.testFile,
    testTitle: first.testTitle,
    label: first.label,
    metrics: computeMedianMetrics(shards),
    raw: shards.flatMap((s) => s.raw),
    profiles: mergeProfiles(shards),
  };
}

function aggregateByKey(rounds: RoundResult[]): Map<string, AggregatedResult> {
  const grouped = new Map<string, Map<number, PerfResult[]>>();
  for (const { roundIndex, result } of rounds) {
    const key = resultKey(result.testFile, result.label);
    let inner = grouped.get(key);
    if (!inner) {
      inner = new Map();
      grouped.set(key, inner);
    }
    const shards = inner.get(roundIndex);
    if (shards) {
      shards.push(result);
    } else {
      inner.set(roundIndex, [result]);
    }
  }
  const aggregated = new Map<string, AggregatedResult>();
  for (const [key, byRound] of grouped) {
    const collapsed = new Map<number, PerfResult>();
    for (const [roundIndex, shards] of byRound) {
      collapsed.set(roundIndex, combineWorkerShards(shards));
    }
    const entries = [...collapsed.values()];
    const first = entries[0];
    if (!first) continue;
    aggregated.set(key, {
      testFile: first.testFile,
      testTitle: first.testTitle,
      label: first.label,
      byRound: collapsed,
      metrics: computeMedianMetrics(entries),
      profiles: mergeProfiles(entries),
    });
  }
  return aggregated;
}

// Direction-of-change agreement check across rounds. Up to two rounds we fall
// back to magnitude only — with so few samples a single noise round would
// otherwise veto every flag, which is the failure mode this exists to avoid.
// Three or four rounds require unanimity. Five or more rounds tolerate a
// single dissenter so a one-off CI hiccup cannot block an alert.
function requiredAgreement(roundsCount: number) {
  if (roundsCount <= 2) return 1;
  if (roundsCount <= 4) return roundsCount;
  return roundsCount - 1;
}

interface SignificanceParams {
  metric: MetricKey;
  delta: number;
  percent: number;
  baseline: number;
  current: number;
  perRoundPercents: number[];
}

interface SignificanceResult {
  agreement: number;
  significant: boolean;
}

function computeSignificance(params: SignificanceParams): SignificanceResult {
  const { metric, delta, percent, baseline, current, perRoundPercents } =
    params;
  const direction = Math.sign(delta);
  let agreement = 0;
  for (const value of perRoundPercents) {
    if (Math.sign(value) === direction) {
      agreement += 1;
    }
  }
  if (!PRIMARY_METRICS.includes(metric)) {
    return { agreement, significant: false };
  }
  const magnitudeOk = Math.abs(percent) > THRESHOLD_PERCENT;
  const absoluteOk = Math.abs(delta) > MIN_DELTA_MS;
  const fromZeroOk = baseline === 0 && Math.abs(current) > MIN_DELTA_MS;
  const enoughRounds = perRoundPercents.length;
  const agreementOk =
    enoughRounds === 0 || agreement >= requiredAgreement(enoughRounds);
  const significant =
    (magnitudeOk && absoluteOk && agreementOk) || (fromZeroOk && agreementOk);
  return { agreement, significant };
}

function hasProfile(result: AggregatedResult, profile: "script" | "selectors") {
  return (result.profiles?.[profile]?.length ?? 0) > 0;
}

function compare(): ComparisonSummary {
  const baseline = aggregateByKey(loadRounds("baseline"));
  const current = aggregateByKey(loadRounds("current"));

  const rows: ComparisonRow[] = [];
  const profileModeMismatches: ProfileModeMismatch[] = [];
  const newTests: AggregatedResult[] = [];
  const removedTests: AggregatedResult[] = [];
  const pairedRoundIndices = new Set<number>();

  for (const [key, cur] of current) {
    const base = baseline.get(key);
    if (!base) {
      newTests.push(cur);
      continue;
    }

    for (const profile of ["script", "selectors"] as const) {
      const baselineHas = hasProfile(base, profile);
      const currentHas = hasProfile(cur, profile);
      if (baselineHas === currentHas) continue;
      profileModeMismatches.push({
        testFile: cur.testFile,
        label: cur.label,
        profile,
        baseline: baselineHas,
        current: currentHas,
      });
    }

    const sharedRounds: number[] = [];
    for (const roundIndex of cur.byRound.keys()) {
      if (base.byRound.has(roundIndex)) {
        sharedRounds.push(roundIndex);
      }
    }
    sharedRounds.sort((a, b) => a - b);
    const sharedBaseline: PerfResult[] = [];
    const sharedCurrent: PerfResult[] = [];
    for (const roundIndex of sharedRounds) {
      const baselineRound = base.byRound.get(roundIndex);
      const currentRound = cur.byRound.get(roundIndex);
      if (!baselineRound || !currentRound) continue;
      pairedRoundIndices.add(roundIndex);
      sharedBaseline.push(baselineRound);
      sharedCurrent.push(currentRound);
    }
    // Aggregate displayed baseline/current from shared rounds only. Otherwise
    // an unpaired round can drag one side's median past the paired rounds and
    // even flip the sign of the change relative to per-round percents.
    const baselineMetrics =
      sharedBaseline.length > 0
        ? computeMedianMetrics(sharedBaseline)
        : base.metrics;
    const currentMetrics =
      sharedCurrent.length > 0
        ? computeMedianMetrics(sharedCurrent)
        : cur.metrics;

    for (const metric of ALL_METRICS) {
      const baseVal = baselineMetrics[metric];
      const curVal = currentMetrics[metric];
      const delta = curVal - baseVal;
      const percent = baseVal > 0 ? (delta / baseVal) * 100 : 0;
      const perRoundPercents: number[] = [];
      for (let i = 0; i < sharedBaseline.length; i++) {
        const baselineRoundEntry = sharedBaseline[i];
        const currentRoundEntry = sharedCurrent[i];
        if (!baselineRoundEntry || !currentRoundEntry) continue;
        const baselineRoundValue = baselineRoundEntry.metrics[metric];
        const currentRoundValue = currentRoundEntry.metrics[metric];
        if (baselineRoundValue <= 0) continue;
        perRoundPercents.push(
          ((currentRoundValue - baselineRoundValue) / baselineRoundValue) * 100,
        );
      }
      const { agreement, significant } = computeSignificance({
        metric,
        delta,
        percent,
        baseline: baseVal,
        current: curVal,
        perRoundPercents,
      });
      rows.push({
        testFile: cur.testFile,
        label: cur.label,
        metric,
        baseline: baseVal,
        current: curVal,
        delta,
        percent,
        perRoundPercents,
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

  return {
    rows,
    hasSignificantChanges: rows.some((r) => r.significant),
    currentResults: [...current.values()],
    profileModeMismatches,
    newTests,
    removedTests,
    pairedRoundsCount: pairedRoundIndices.size,
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

function rowKey(row: ComparisonRow): string {
  return resultKey(row.testFile, row.label);
}

function aggregatedKey(result: AggregatedResult): string {
  return resultKey(result.testFile, result.label);
}

function formatSummaryTable(rows: ComparisonRow[], keys: string[]): string[] {
  const lines: string[] = [];
  lines.push("| Test | Scripting | Rendering | Total |");
  lines.push("|------|-----------|-----------|-------|");

  for (const key of keys) {
    const testRows = rows.filter((r) => rowKey(r) === key);
    const label = testRows[0]?.label ?? key;
    const cells: string[] = [escapeTableCell(label)];
    for (const metric of PRIMARY_METRICS) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) {
        cells.push("--");
        continue;
      }
      let cell = `${formatMs(row.baseline)} → ${formatMs(row.current)}`;
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

function formatScriptProfile(result: AggregatedResult): string[] {
  const profile = result.profiles?.script;
  if (!profile || profile.length === 0) return [];

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

function formatSelectorProfile(result: AggregatedResult): string[] {
  const profile = result.profiles?.selectors;
  if (!profile || profile.length === 0) return [];

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

function formatProfiles(result?: AggregatedResult): string[] {
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
  currentByKey: Map<string, AggregatedResult>,
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
    lines.push(...formatProfiles(currentByKey.get(key)));
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
    pairedRoundsCount,
  } = summary;
  const currentByKey = new Map<string, AggregatedResult>();
  for (const result of currentResults) {
    currentByKey.set(aggregatedKey(result), result);
  }

  const allKeys = [...new Set(rows.map((r) => rowKey(r)))];
  const significantKeys = allKeys.filter((key) =>
    rows.some((r) => rowKey(r) === key && r.significant),
  );

  const totalTests = allKeys.length + newTests.length + removedTests.length;

  const lines: string[] = [];
  lines.push("## Performance");
  lines.push("");

  if (hasSignificantChanges) {
    lines.push(...formatSummaryTable(rows, significantKeys));
  } else if (rows.length === 0 && newTests.length > 0) {
    lines.push("No baseline results available for comparison.");
  } else if (rows.length === 0 && newTests.length === 0) {
    lines.push("No performance results found.");
  } else {
    lines.push("No significant performance changes detected.");
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
    for (const result of newTests) {
      const cells: string[] = [escapeTableCell(result.label)];
      for (const metric of PRIMARY_METRICS) {
        cells.push(formatMs(result.metrics[metric]));
      }
      lines.push(`| ${cells.join(" | ")} |`);
    }
    lines.push("");
    for (const result of newTests) {
      const profileLines = formatProfiles(result);
      if (profileLines.length === 0) continue;
      lines.push(`#### ${result.label}`);
      lines.push("");
      lines.push(...profileLines);
    }
  }

  if (removedTests.length > 0) {
    lines.push("### Removed tests");
    lines.push("");
    for (const result of removedTests) {
      lines.push(`- ${result.label}`);
    }
    lines.push("");
  }

  lines.push("</details>");
  lines.push("");
  lines.push(
    `:warning: = regression above ${THRESHOLD_PERCENT}% · :rocket: = improvement above ${THRESHOLD_PERCENT}%`,
  );
  if (pairedRoundsCount > 1) {
    lines.push("");
    lines.push(
      `Comparison spans ${pairedRoundsCount} interleaved baseline/current rounds; a change is flagged only when the median exceeds the threshold and the per-round directions agree.`,
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
    newTests: summary.newTests.map(toPersistedResult),
    removedTests: summary.removedTests.map(toPersistedResult),
    pairedRoundsCount: summary.pairedRoundsCount,
  };
}

function toPersistedResult(result: AggregatedResult): PerfResult {
  return {
    testFile: result.testFile,
    testTitle: result.testTitle,
    label: result.label,
    metrics: result.metrics,
    raw: [...result.byRound.values()].flatMap((r) => r.raw),
    profiles: result.profiles,
  };
}

const summary = compare();
const markdown = formatMarkdown(summary);

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(
  path.join(RESULTS_DIR, "comparison.json"),
  JSON.stringify(toPersistedSummary(summary), null, 2),
);
writeFileSync(path.join(RESULTS_DIR, "comparison.md"), markdown);

console.log(markdown);
