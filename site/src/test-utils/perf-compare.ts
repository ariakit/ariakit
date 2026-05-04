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
// timing is well inside CDP's quantization noise. The 5ms floor is wide enough
// to cover CDP timer quantization (~1ms) plus the typical run-to-run jitter we
// see on shared CI runners; values below it tend to be noise rather than
// signal even on the primary metrics.
const THRESHOLD_PERCENT = 10;
const MIN_DELTA_MS = 5;

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
  // Signed per-round deltas (current - baseline) for every shared round.
  // Used for the agreement check so every paired round contributes a vote,
  // including rounds where the baseline measured zero — those rounds still
  // carry direction information and dropping them shrinks the denominator
  // `requiredAgreement` sees.
  perRoundDeltas: number[];
  agreement: number;
  significant: boolean;
  // Number of baseline/current round indices that paired up for this row's
  // test. Tracked per-row instead of globally because different tests can
  // produce different numbers of paired rounds when one side drops a round.
  pairedRoundsCount: number;
}

// Tests where baseline and current never produced the same round index, so
// no per-round comparison was possible. Listed separately rather than
// silently compared via cross-round medians, which would reintroduce the
// runner-noise the rounds layout exists to filter.
interface UnpairedTest {
  testFile: string;
  label: string;
  baselineRounds: number[];
  currentRounds: number[];
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
  unpairedTests: UnpairedTest[];
}

interface PersistedComparisonSummary {
  rows: ComparisonRow[];
  hasSignificantChanges: boolean;
  profileModeMismatches: ProfileModeMismatch[];
  newTests: PerfResult[];
  removedTests: PerfResult[];
  unpairedTests: UnpairedTest[];
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
  // Hard-fail on parse errors. A truncated or malformed artifact otherwise
  // surfaces as an empty side and the comparison silently degrades into "no
  // baseline / new tests", masking the real cause.
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read perf results at ${filePath}`, {
      cause: error,
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse perf results at ${filePath}`, {
      cause: error,
    });
  }
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Perf results at ${filePath} must be a JSON array, got ${typeof parsed}`,
    );
  }
  return parsed as PerfResult[];
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

// Direction-of-change agreement check across rounds. With one round the
// agreement check carries no signal and we fall back to magnitude only. From
// two rounds up through four rounds we require unanimity — with so few
// samples even a single dissenting round is enough to suspect noise. Five or
// more rounds tolerate one dissenter so a single CI hiccup cannot veto a real
// flag.
function requiredAgreement(roundsCount: number) {
  if (roundsCount <= 1) return 1;
  if (roundsCount <= 4) return roundsCount;
  return roundsCount - 1;
}

interface SignificanceParams {
  metric: MetricKey;
  delta: number;
  percent: number;
  baseline: number;
  current: number;
  perRoundDeltas: number[];
}

interface SignificanceResult {
  agreement: number;
  significant: boolean;
}

function computeSignificance(params: SignificanceParams): SignificanceResult {
  const { metric, delta, percent, baseline, current, perRoundDeltas } = params;
  const direction = Math.sign(delta);
  let agreement = 0;
  for (const value of perRoundDeltas) {
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
  const enoughRounds = perRoundDeltas.length;
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
  const unpairedTests: UnpairedTest[] = [];

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

    // No round produced both a baseline and current sample for this test.
    // Comparing cross-round medians would silently feed runner noise into
    // the report — exactly the failure mode the rounds layout was added to
    // filter — so surface these tests as unpaired and skip flagging.
    if (sharedRounds.length === 0) {
      unpairedTests.push({
        testFile: cur.testFile,
        label: cur.label,
        baselineRounds: [...base.byRound.keys()].sort((a, b) => a - b),
        currentRounds: [...cur.byRound.keys()].sort((a, b) => a - b),
      });
      continue;
    }

    const sharedBaseline: PerfResult[] = [];
    const sharedCurrent: PerfResult[] = [];
    for (const roundIndex of sharedRounds) {
      const baselineRound = base.byRound.get(roundIndex);
      const currentRound = cur.byRound.get(roundIndex);
      if (!baselineRound || !currentRound) continue;
      sharedBaseline.push(baselineRound);
      sharedCurrent.push(currentRound);
    }
    // Aggregate displayed baseline/current from shared rounds only. An
    // unpaired round on either side could otherwise drag one side's median
    // past the paired rounds and even flip the sign of the change relative
    // to per-round percents.
    const baselineMetrics = computeMedianMetrics(sharedBaseline);
    const currentMetrics = computeMedianMetrics(sharedCurrent);
    const pairedRoundsCount = sharedBaseline.length;

    for (const metric of ALL_METRICS) {
      const baseVal = baselineMetrics[metric];
      const curVal = currentMetrics[metric];
      const delta = curVal - baseVal;
      const percent = baseVal > 0 ? (delta / baseVal) * 100 : 0;
      // One signed delta per paired round, including rounds where baseline
      // measured zero. Filtering zero-baseline rounds out shrinks the array
      // `requiredAgreement` operates on and lets a 2-round row flag from a
      // single agreeing round whenever one baseline sample is zero.
      const perRoundDeltas: number[] = [];
      for (let i = 0; i < sharedBaseline.length; i++) {
        const baselineRoundEntry = sharedBaseline[i];
        const currentRoundEntry = sharedCurrent[i];
        if (!baselineRoundEntry || !currentRoundEntry) continue;
        const baselineRoundValue = baselineRoundEntry.metrics[metric];
        const currentRoundValue = currentRoundEntry.metrics[metric];
        perRoundDeltas.push(currentRoundValue - baselineRoundValue);
      }
      const { agreement, significant } = computeSignificance({
        metric,
        delta,
        percent,
        baseline: baseVal,
        current: curVal,
        perRoundDeltas,
      });
      rows.push({
        testFile: cur.testFile,
        label: cur.label,
        metric,
        baseline: baseVal,
        current: curVal,
        delta,
        percent,
        perRoundDeltas,
        agreement,
        significant,
        pairedRoundsCount,
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
    unpairedTests,
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

function formatPairedRoundsNote(counts: Set<number>): string | null {
  if (counts.size === 0) return null;
  if (counts.size === 1) {
    const [count] = counts;
    // Only worth pointing out the agreement check when there's more than one
    // round per row — at one round per row the agreement check is auto-
    // satisfied and the message would mislead.
    if (count == null || count <= 1) return null;
    return `Comparison spans ${count} interleaved baseline/current rounds; a change is flagged only when the median exceeds the threshold and the per-round directions agree.`;
  }
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return `Compared rows used a mix of paired baseline/current round counts (${min}–${max} rounds). Rows with fewer paired rounds carry weaker agreement signal — see the per-test breakdown for the count behind each row.`;
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
  } = summary;
  const currentByKey = new Map<string, AggregatedResult>();
  for (const result of currentResults) {
    currentByKey.set(aggregatedKey(result), result);
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
  const pairedRoundsCounts = new Set(rows.map((r) => r.pairedRoundsCount));

  const lines: string[] = [];
  lines.push("## Performance");
  lines.push("");

  if (hasSignificantChanges) {
    lines.push(...formatSummaryTable(rows, significantKeys));
  } else if (rows.length === 0 && newTests.length > 0) {
    lines.push("No baseline results available for comparison.");
  } else if (
    rows.length === 0 &&
    newTests.length === 0 &&
    unpairedTests.length === 0
  ) {
    lines.push("No performance results found.");
  } else if (rows.length === 0 && unpairedTests.length > 0) {
    // No row was comparable, but the run isn't empty — every test produced
    // results on each side, just never in the same round. Surface that
    // directly so the headline doesn't claim "no results found" while the
    // breakdown lists tests below.
    lines.push("No comparable rounds across baseline and current.");
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

  if (unpairedTests.length > 0) {
    lines.push("### Tests without paired rounds");
    lines.push("");
    lines.push(
      "Baseline and current never produced the same round index for these tests, so no change is flagged.",
    );
    lines.push("");
    lines.push("| Test | Baseline rounds | Current rounds |");
    lines.push("|------|-----------------|----------------|");
    for (const result of unpairedTests) {
      lines.push(
        `| ${escapeTableCell(result.label)} | ${result.baselineRounds.join(", ") || "—"} | ${result.currentRounds.join(", ") || "—"} |`,
      );
    }
    lines.push("");
  }

  lines.push("</details>");
  lines.push("");
  lines.push(
    `:warning: = regression above ${THRESHOLD_PERCENT}% · :rocket: = improvement above ${THRESHOLD_PERCENT}%`,
  );
  const footerNote = formatPairedRoundsNote(pairedRoundsCounts);
  if (footerNote) {
    lines.push("");
    lines.push(footerNote);
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
    unpairedTests: summary.unpairedTests,
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
