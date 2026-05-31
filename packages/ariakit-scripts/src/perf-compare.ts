import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { mergeScriptProfiles, mergeSelectorProfiles } from "./perf.ts";
import type {
  PerfMetrics,
  PerfProfiles,
  PerfResult,
  PerfScriptProfileEntry,
  PerfSelectorProfileEntry,
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

interface BenchmarkReport {
  files?: BenchmarkReportFile[];
}

interface BenchmarkReportFile {
  filepath?: string;
  groups?: BenchmarkReportGroup[];
}

interface BenchmarkReportGroup {
  fullName?: string;
  benchmarks?: BenchmarkReportEntry[];
}

interface BenchmarkReportEntry {
  name?: string;
  hz?: number;
  mean?: number;
}

export interface PerfCompareOptions {
  node?: boolean;
}

export interface PerfCompareRunResult {
  summary: PersistedComparisonSummary;
  markdown: string;
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

function getPrimaryMetrics(options: PerfCompareOptions): MetricKey[] {
  return options.node ? ["total"] : PRIMARY_METRICS;
}

function getAllMetrics(options: PerfCompareOptions): MetricKey[] {
  return options.node ? ["total"] : ALL_METRICS;
}

function getResultName(options: PerfCompareOptions) {
  return options.node ? "Benchmark" : "Test";
}

function getResultsName(options: PerfCompareOptions) {
  return options.node ? "benchmarks" : "tests";
}

function getMinSignificantDelta(options: PerfCompareOptions) {
  return options.node ? 0 : MIN_SIGNIFICANT_DELTA_MS;
}

function getMetricLabel(metric: MetricKey, options: PerfCompareOptions) {
  if (options.node && metric === "total") {
    return "Ops/sec";
  }
  return METRIC_LABELS[metric];
}

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

function getNumber(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  return value;
}

function normalizeBenchmarkFilePath(filePath: string) {
  if (!filePath) return "";
  const rooted = filePath.match(/(?:^|[\\/])((?:packages|benchmark)[\\/].+)$/);
  if (rooted?.[1]) {
    return rooted[1];
  }
  return path.relative(process.cwd(), filePath);
}

function normalizeBenchmarkName(name: string) {
  return name.replace(/@\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/, "");
}

function normalizeBenchmarkGroupName(name: string, filePath: string) {
  const fileName = path.basename(filePath);
  return name
    .split(" > ")
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      if (part === fileName) return false;
      return normalizeBenchmarkFilePath(part) !== filePath;
    });
}

function formatBenchmarkLabel({
  file,
  groupName,
  name,
}: {
  file: string;
  groupName: string;
  name: string;
}) {
  const parts = [...normalizeBenchmarkGroupName(groupName, file), name].filter(
    Boolean,
  );
  return parts.join(" > ");
}

function createNodeMetrics({ hz, mean }: { hz: number; mean: number }) {
  const total = hz > 0 ? hz : mean > 0 ? 1000 / mean : 0;
  return {
    scripting: 0,
    layout: 0,
    styleRecalc: 0,
    painting: 0,
    rendering: 0,
    inp: 0,
    total,
  };
}

function resultsFromBenchmarkReport(report: BenchmarkReport): PerfResult[] {
  const results: PerfResult[] = [];
  for (const file of report.files ?? []) {
    const filePath = normalizeBenchmarkFilePath(file.filepath ?? "");
    for (const group of file.groups ?? []) {
      const groupName = group.fullName ?? "";
      for (const benchmark of group.benchmarks ?? []) {
        const name = benchmark.name ?? "";
        const normalizedName = normalizeBenchmarkName(name);
        const metrics = createNodeMetrics({
          hz: getNumber(benchmark.hz),
          mean: getNumber(benchmark.mean),
        });
        const label = formatBenchmarkLabel({
          file: filePath,
          groupName,
          name: normalizedName,
        });
        results.push({
          testFile: filePath,
          testTitle: groupName
            ? `${groupName} > ${normalizedName}`
            : normalizedName,
          label,
          metrics,
          raw: [metrics],
        });
      }
    }
  }
  return results;
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

function loadRounds(
  prefix: string,
  options: PerfCompareOptions,
): RoundPerfResult[] {
  const rounds: RoundPerfResult[] = [];
  for (const { filePath, roundIndex } of discoverRoundFiles(prefix)) {
    const data = readJsonFile(filePath);
    if (options.node && !Array.isArray(data)) {
      for (const result of resultsFromBenchmarkReport(
        data as BenchmarkReport,
      )) {
        rounds.push({ roundIndex, result });
      }
      continue;
    }
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
  minDelta,
  primary,
  percent,
  perRoundDeltas,
}: {
  baseline: number;
  current: number;
  minDelta: number;
  primary: boolean;
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
  const deltaOk = Math.abs(delta) >= minDelta;
  const zeroBaselineOk =
    baseline === 0 && current !== baseline && Math.abs(current) >= minDelta;
  const magnitudeOk = baseline === 0 ? zeroBaselineOk : percentOk && deltaOk;
  const agreementOk = agreement >= requiredAgreement(perRoundDeltas.length);

  return {
    agreement,
    significant: primary && magnitudeOk && agreementOk,
  };
}

function formatMs(value: number): string {
  return `${value.toFixed(1)}ms`;
}

function formatOpsPerSecond(value: number) {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return `${value.toLocaleString("en-US", { maximumFractionDigits })} ops/sec`;
}

function formatMetricValue(
  value: number,
  options: PerfCompareOptions,
  signed = false,
) {
  const sign = signed && value >= 0 ? "+" : "";
  if (options.node) {
    return `${sign}${formatOpsPerSecond(value)}`;
  }
  return `${sign}${formatMs(value)}`;
}

function formatDelta(
  delta: number,
  percent: number,
  baseline: number,
  options: PerfCompareOptions,
): string {
  if (baseline === 0) {
    return formatMetricValue(delta, options, true);
  }
  const sign = delta >= 0 ? "+" : "";
  return `${formatMetricValue(delta, options, true)} (${sign}${percent.toFixed(0)}%)`;
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

function isRegression(row: ComparisonRow, options: PerfCompareOptions) {
  return options.node ? row.delta < 0 : row.delta > 0;
}

function getSignificanceIcon(row: ComparisonRow, options: PerfCompareOptions) {
  if (!row.significant) return "";
  return isRegression(row, options) ? " :warning:" : " :rocket:";
}

function compare(options: PerfCompareOptions): ComparisonSummary {
  const baseline = aggregateByKey(loadRounds("baseline", options));
  const current = aggregateByKey(loadRounds("current", options));
  const primaryMetrics = getPrimaryMetrics(options);
  const allMetrics = getAllMetrics(options);
  const minDelta = getMinSignificantDelta(options);

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

    for (const metric of allMetrics) {
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
        minDelta,
        primary: primaryMetrics.includes(metric),
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

function groupRowsByKey(rows: ComparisonRow[]) {
  const grouped = new Map<string, ComparisonRow[]>();
  for (const row of rows) {
    const key = rowKey(row);
    const rowsForKey = grouped.get(key);
    if (rowsForKey) {
      rowsForKey.push(row);
    } else {
      grouped.set(key, [row]);
    }
  }
  return grouped;
}

function formatRoundList(rounds: number[]): string {
  if (rounds.length === 0) return "-";
  return rounds.join(", ");
}

function groupRowsByFile(rows: ComparisonRow[]) {
  const grouped = new Map<string, ComparisonRow[]>();
  for (const row of rows) {
    const rowsForFile = grouped.get(row.testFile);
    if (rowsForFile) {
      rowsForFile.push(row);
    } else {
      grouped.set(row.testFile, [row]);
    }
  }
  return grouped;
}

function groupResultsByFile(results: AggregatedPerfResult[]) {
  const grouped = new Map<string, AggregatedPerfResult[]>();
  for (const result of results) {
    const resultsForFile = grouped.get(result.result.testFile);
    if (resultsForFile) {
      resultsForFile.push(result);
    } else {
      grouped.set(result.result.testFile, [result]);
    }
  }
  return grouped;
}

function formatFileHeading(file: string) {
  return file || "Unknown file";
}

function sortEntriesByFile<T>(entries: Iterable<[string, T]>) {
  return [...entries].sort(([a], [b]) => a.localeCompare(b));
}

function formatNodeComparisonTables(
  rowsByKey: Map<string, ComparisonRow[]>,
  keys: string[],
  options: PerfCompareOptions,
) {
  const lines: string[] = [];
  const visibleRows: ComparisonRow[] = [];
  for (const key of keys) {
    const testRows = rowsByKey.get(key);
    if (!testRows) continue;
    for (const row of testRows) {
      if (row.metric !== "total") continue;
      visibleRows.push(row);
    }
  }
  for (const [file, fileRows] of sortEntriesByFile(
    groupRowsByFile(visibleRows),
  )) {
    lines.push(`#### ${formatFileHeading(file)}`);
    lines.push("");
    lines.push("| Benchmark | Baseline | Current | Change |");
    lines.push("|-----------|----------|---------|--------|");
    for (const row of fileRows) {
      const delta = formatDelta(row.delta, row.percent, row.baseline, options);
      const icon = getSignificanceIcon(row, options);
      lines.push(
        `| ${escapeTableCell(row.label)} | ${formatMetricValue(row.baseline, options)} | ${formatMetricValue(row.current, options)} | ${delta}${icon} |`,
      );
    }
    lines.push("");
  }
  return lines;
}

function formatNodeResultTables(
  results: AggregatedPerfResult[],
  options: PerfCompareOptions,
) {
  const lines: string[] = [];
  for (const [file, fileResults] of sortEntriesByFile(
    groupResultsByFile(results),
  )) {
    lines.push(`#### ${formatFileHeading(file)}`);
    lines.push("");
    lines.push(`| Benchmark | ${getMetricLabel("total", options)} |`);
    lines.push("|-----------|---------|");
    for (const { result } of fileResults) {
      lines.push(
        `| ${escapeTableCell(result.label)} | ${formatMetricValue(result.metrics.total, options)} |`,
      );
    }
    lines.push("");
  }
  return lines;
}

function formatSummaryTable(
  rowsByKey: Map<string, ComparisonRow[]>,
  keys: string[],
  options: PerfCompareOptions,
): string[] {
  if (options.node) {
    return formatNodeComparisonTables(rowsByKey, keys, options);
  }
  const lines: string[] = [];
  const primaryMetrics = getPrimaryMetrics(options);
  const headers = [
    getResultName(options),
    ...primaryMetrics.map((metric) => getMetricLabel(metric, options)),
  ];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);

  for (const key of keys) {
    const testRows = rowsByKey.get(key) ?? [];
    const label = testRows[0]?.label ?? key;
    const cells: string[] = [label];
    for (const metric of primaryMetrics) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) {
        cells.push("--");
        continue;
      }
      let cell = `${formatMetricValue(row.baseline, options)} \u2192 ${formatMetricValue(
        row.current,
        options,
      )}`;
      cell +=
        row.baseline === 0
          ? " (n/a)"
          : ` (${row.delta >= 0 ? "+" : ""}${row.percent.toFixed(0)}%)`;
      if (row.significant) {
        cell += getSignificanceIcon(row, options);
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

interface FormatDetailedBreakdownParams {
  rowsByKey: Map<string, ComparisonRow[]>;
  keys: string[];
  currentByKey: Map<string, AggregatedPerfResult>;
  options: PerfCompareOptions;
}

function formatDetailedBreakdown({
  rowsByKey,
  keys,
  currentByKey,
  options,
}: FormatDetailedBreakdownParams): string[] {
  if (options.node) {
    return formatNodeComparisonTables(rowsByKey, keys, options);
  }
  const lines: string[] = [];
  const allMetrics = getAllMetrics(options);
  for (const key of keys) {
    const testRows = rowsByKey.get(key) ?? [];
    const label = testRows[0]?.label ?? key;
    lines.push(`### ${label}`);
    lines.push("");
    lines.push("| Metric | Baseline | Current | Delta |");
    lines.push("|--------|----------|---------|-------|");
    for (const metric of allMetrics) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) continue;
      const prefix = RENDERING_SUB_METRICS.has(metric) ? "- " : "";
      const metricLabel = `${prefix}${getMetricLabel(metric, options)}`;
      const deltaStr = formatDelta(
        row.delta,
        row.percent,
        row.baseline,
        options,
      );
      const icon = getSignificanceIcon(row, options);
      lines.push(
        `| ${metricLabel} | ${formatMetricValue(row.baseline, options)} | ${formatMetricValue(row.current, options)} | ${deltaStr}${icon} |`,
      );
    }
    lines.push("");
    lines.push(...formatProfiles(currentByKey.get(key)?.result));
  }
  return lines;
}

function formatMarkdown(
  summary: ComparisonSummary,
  options: PerfCompareOptions,
): string {
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

  const rowsByKey = groupRowsByKey(rows);
  const allKeys = [...rowsByKey.keys()];
  const significantKeys = allKeys.filter((key) => {
    const testRows = rowsByKey.get(key);
    return testRows?.some((row) => row.significant) ?? false;
  });

  const totalTests =
    allKeys.length +
    newTests.length +
    removedTests.length +
    unpairedTests.length;
  const resultsName = getResultsName(options);
  const resultName = getResultName(options);

  const lines: string[] = [];
  lines.push("## Performance");
  lines.push("");

  if (hasSignificantChanges) {
    lines.push(...formatSummaryTable(rowsByKey, significantKeys, options));
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
    const label =
      unpairedTests.length === 1 ? resultName.toLowerCase() : resultsName;
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
  lines.push(
    `<summary>Full breakdown (${totalTests} ${resultsName})</summary>`,
  );
  lines.push("");
  lines.push(
    ...formatDetailedBreakdown({
      rowsByKey,
      keys: allKeys,
      currentByKey,
      options,
    }),
  );

  if (newTests.length > 0) {
    const primaryMetrics = getPrimaryMetrics(options);
    lines.push(`### New ${resultsName} (no baseline)`);
    lines.push("");
    if (options.node) {
      lines.push(...formatNodeResultTables(newTests, options));
    } else {
      const headers = [
        resultName,
        ...primaryMetrics.map((metric) => getMetricLabel(metric, options)),
      ];
      lines.push(`| ${headers.join(" | ")} |`);
      lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
      for (const { result } of newTests) {
        const cells: string[] = [result.label];
        for (const metric of primaryMetrics) {
          cells.push(formatMetricValue(result.metrics[metric], options));
        }
        lines.push(`| ${cells.join(" | ")} |`);
      }
      lines.push("");
    }

    for (const { result } of newTests) {
      const profileLines = formatProfiles(result);
      if (profileLines.length === 0) continue;
      lines.push(`#### ${result.label}`);
      lines.push("");
      lines.push(...profileLines);
    }
  }

  if (unpairedTests.length > 0) {
    lines.push(`### Unpaired ${resultsName}`);
    lines.push("");
    lines.push(
      `These ${resultsName} produced baseline and current results, but no shared round index.`,
    );
    lines.push("");
    lines.push(`| ${resultName} | Baseline rounds | Current rounds |`);
    lines.push("|------|-----------------|----------------|");
    for (const result of unpairedTests) {
      lines.push(
        `| ${escapeTableCell(result.label)} | ${formatRoundList(result.baselineRounds)} | ${formatRoundList(result.currentRounds)} |`,
      );
    }
    lines.push("");
  }

  if (removedTests.length > 0) {
    lines.push(`### Removed ${resultsName}`);
    lines.push("");
    if (options.node) {
      for (const [file, fileResults] of sortEntriesByFile(
        groupResultsByFile(removedTests),
      )) {
        lines.push(`#### ${formatFileHeading(file)}`);
        lines.push("");
        for (const { result } of fileResults) {
          lines.push(`- ${result.label}`);
        }
        lines.push("");
      }
    } else {
      for (const { result } of removedTests) {
        lines.push(`- ${result.label}`);
      }
      lines.push("");
    }
  }

  lines.push("</details>");
  lines.push("");

  lines.push(
    options.node
      ? `:warning: = regression above ${THRESHOLD_PERCENT}% · :rocket: = improvement above ${THRESHOLD_PERCENT}%`
      : `:warning: = regression above ${THRESHOLD_PERCENT}% and ${formatMs(MIN_SIGNIFICANT_DELTA_MS)} · :rocket: = improvement above ${THRESHOLD_PERCENT}% and ${formatMs(MIN_SIGNIFICANT_DELTA_MS)}`,
  );
  if (pairedRoundsCount == null) {
    lines.push("");
    lines.push(
      `Compared ${resultsName} used mixed interleaved round counts; a change is flagged only when the median exceeds the threshold and rounds agree on direction.`,
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

export function runPerfCompare(
  options: PerfCompareOptions = {},
): PerfCompareRunResult {
  const summary = compare(options);
  const persistedSummary = toPersistedSummary(summary);
  const markdown = formatMarkdown(summary, options);

  mkdirSync(RESULTS_DIR, { recursive: true });
  writeFileSync(
    path.join(RESULTS_DIR, "comparison.json"),
    JSON.stringify(persistedSummary, null, 2),
  );
  writeFileSync(path.join(RESULTS_DIR, "comparison.md"), markdown);

  return { summary: persistedSummary, markdown };
}
