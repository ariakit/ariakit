import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  computeMedianMetrics,
  median,
  mergeScriptProfiles,
  mergeSelectorProfiles,
} from "./perf.ts";
import type {
  PerfMetrics,
  PerfProfiles,
  PerfResult,
  PerfScriptProfileEntry,
  PerfSelectorProfileEntry,
} from "./perf.ts";
import { escapeRegExp } from "./regexp.ts";

const RESULTS_DIR = path.join(process.cwd(), ".perf-results");
const PROFILE_LIMIT = 10;
const THRESHOLD_PERCENT = 10;
const MIN_SIGNIFICANT_DELTA_MS = 5;
// Require at least 75% of each required round's pairwise raw-sample deltas to
// support the paired median direction before a browser comparison becomes
// significant.
const RAW_SAMPLE_SUPPORT_QUANTILE = 0.25;

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
  sampleSupport: number;
  threshold: boolean;
  significant: boolean;
  profileMode: boolean;
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

interface RoundMetricComparison {
  baseline: number;
  current: number;
  delta: number;
  sampleDeltas: number[];
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
    scriptProfile: results.some((result) => result.scriptProfile) || undefined,
    selectorProfile:
      results.some((result) => result.selectorProfile) || undefined,
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

function getMetricSamples(result: PerfResult, metric: MetricKey) {
  const raw = Array.isArray(result.raw) ? result.raw : [];
  const allMetrics = raw.length > 0 ? raw : [result.metrics];
  const values: number[] = [];
  for (const metrics of allMetrics) {
    const value = metrics?.[metric];
    if (Number.isFinite(value)) {
      values.push(value);
    }
  }
  if (values.length > 0) return values;
  const fallback = result.metrics[metric];
  return Number.isFinite(fallback) ? [fallback] : [0];
}

function getPairwiseDeltas(baseline: number[], current: number[]) {
  const deltas: number[] = [];
  for (const currentValue of current) {
    for (const baselineValue of baseline) {
      deltas.push(currentValue - baselineValue);
    }
  }
  return deltas;
}

function getQuantile(values: number[], quantile: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((sorted.length - 1) * quantile);
  return sorted[index] ?? 0;
}

function samplesSupportDirection(sampleDeltas: number[], direction: number) {
  if (sampleDeltas.length === 0) return false;
  if (direction > 0) {
    return getQuantile(sampleDeltas, RAW_SAMPLE_SUPPORT_QUANTILE) > 0;
  }
  return getQuantile(sampleDeltas, 1 - RAW_SAMPLE_SUPPORT_QUANTILE) < 0;
}

function getRoundMetricComparison(
  baseline: PerfResult,
  current: PerfResult,
  metric: MetricKey,
): RoundMetricComparison {
  const baselineSamples = getMetricSamples(baseline, metric);
  const currentSamples = getMetricSamples(current, metric);
  const baselineValue = median(baselineSamples);
  const currentValue = median(currentSamples);
  const delta = currentValue - baselineValue;
  return {
    baseline: baselineValue,
    current: currentValue,
    delta,
    sampleDeltas: getPairwiseDeltas(baselineSamples, currentSamples),
  };
}

function computeSignificance({
  baseline,
  current,
  minDelta,
  primary,
  percent,
  requireSampleSupport,
  roundComparisons,
}: {
  baseline: number;
  current: number;
  minDelta: number;
  primary: boolean;
  percent: number;
  requireSampleSupport: boolean;
  roundComparisons: RoundMetricComparison[];
}) {
  if (roundComparisons.length === 0) {
    return {
      agreement: 0,
      sampleSupport: 0,
      threshold: false,
      significant: false,
    };
  }

  const delta = current - baseline;
  const direction = Math.sign(delta);
  if (direction === 0) {
    return {
      agreement: 0,
      sampleSupport: 0,
      threshold: false,
      significant: false,
    };
  }

  let agreement = 0;
  let sampleSupport = 0;
  for (const comparison of roundComparisons) {
    if (Math.sign(comparison.delta) === direction) {
      agreement += 1;
    }
    if (samplesSupportDirection(comparison.sampleDeltas, direction)) {
      sampleSupport += 1;
    }
  }

  const percentOk = Math.abs(percent) > THRESHOLD_PERCENT;
  const deltaOk = Math.abs(delta) >= minDelta;
  const zeroBaselineOk =
    baseline === 0 && current !== baseline && Math.abs(current) >= minDelta;
  const magnitudeOk = baseline === 0 ? zeroBaselineOk : percentOk && deltaOk;
  const required = requiredAgreement(roundComparisons.length);
  const agreementOk = agreement >= required;
  const sampleSupportOk = !requireSampleSupport || sampleSupport >= required;

  return {
    agreement,
    sampleSupport,
    threshold: magnitudeOk,
    significant: primary && magnitudeOk && agreementOk && sampleSupportOk,
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

function getGitHubSourceBaseUrl(): string | undefined {
  const sourceBaseUrl = process.env.PERF_SOURCE_BASE_URL;
  if (sourceBaseUrl) return sourceBaseUrl.replace(/\/+$/, "");

  const { GITHUB_REPOSITORY, GITHUB_SHA } = process.env;
  if (!GITHUB_REPOSITORY || !GITHUB_SHA) return;

  const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
  return `${serverUrl.replace(/\/+$/, "")}/${GITHUB_REPOSITORY}/blob/${GITHUB_SHA}`;
}

function isRepoSourcePath(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/")) return false;
  if (/^[a-z]+:/i.test(url)) return false;
  if (url.includes("node_modules")) return false;
  return /^(?:app|benchmark|examples|nextjs|packages|scripts|templates|website)\//.test(
    url,
  );
}

function encodeSourcePath(url: string): string {
  return url.split("/").map(encodeURIComponent).join("/");
}

function escapeLinkText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/([[\]])/g, "\\$1")
    .replace(/\|/g, "\\|")
    .replace(/[\r\n\t]/g, " ")
    .trim();
}

function getGitHubSourceUrl(item: PerfScriptProfileEntry): string | undefined {
  const sourceBaseUrl = getGitHubSourceBaseUrl();
  if (!sourceBaseUrl || !isRepoSourcePath(item.url)) {
    return;
  }
  return `${sourceBaseUrl}/${encodeSourcePath(item.url)}#L${item.line}`;
}

function formatInlineCode(value: string): string {
  const fenceLength =
    Math.max(
      0,
      ...Array.from(value.matchAll(/`+/g), (match) => match[0].length),
    ) + 1;
  const fence = "`".repeat(fenceLength);
  return `${fence}${value}${fence}`;
}

function formatFunctionCell(item: PerfScriptProfileEntry): string {
  const name = formatInlineCode(item.functionName);
  const sourceUrl = getGitHubSourceUrl(item);
  if (!sourceUrl) {
    return escapeTableCell(name);
  }
  return `[${escapeLinkText(name)}](${sourceUrl})`;
}

function resultKey(result: PerfResult): string {
  return `${result.testFile}::${result.label}`;
}

function hasProfileData(
  result: PerfResult | undefined,
  profile: "script" | "selectors",
): boolean {
  return (result?.profiles?.[profile]?.length ?? 0) > 0;
}

function hasProfileMode(
  result: PerfResult | undefined,
  profile: "script" | "selectors",
): boolean {
  if (profile === "script") {
    return !!result?.scriptProfile || hasProfileData(result, profile);
  }
  return !!result?.selectorProfile || hasProfileData(result, profile);
}

function isProfileMode(result: PerfResult | undefined): boolean {
  return (
    hasProfileMode(result, "script") || hasProfileMode(result, "selectors")
  );
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
      const baselineHasProfile = hasProfileMode(base.result, profile);
      const currentHasProfile = hasProfileMode(cur.result, profile);
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

    const profileMode = isProfileMode(base.result) || isProfileMode(cur.result);
    const primary = !profileMode;
    for (const metric of allMetrics) {
      const baselineValues: number[] = [];
      const roundComparisons: RoundMetricComparison[] = [];
      for (const roundIndex of sharedRoundIndices) {
        const baselineRound = base.byRound.get(roundIndex);
        const currentRound = cur.byRound.get(roundIndex);
        if (!baselineRound || !currentRound) continue;
        const comparison = getRoundMetricComparison(
          baselineRound,
          currentRound,
          metric,
        );
        baselineValues.push(comparison.baseline);
        roundComparisons.push(comparison);
      }

      const baseVal = median(baselineValues);
      const delta = median(
        roundComparisons.map((comparison) => comparison.delta),
      );
      const curVal = baseVal + delta;
      const percent = baseVal > 0 ? (delta / baseVal) * 100 : 0;
      const { agreement, sampleSupport, threshold, significant } =
        computeSignificance({
          baseline: baseVal,
          current: curVal,
          minDelta,
          primary: primary && primaryMetrics.includes(metric),
          percent,
          requireSampleSupport: !options.node,
          roundComparisons,
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
        perRoundDeltas: roundComparisons.map((comparison) => comparison.delta),
        agreement,
        sampleSupport,
        threshold,
        significant,
        profileMode,
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

function formatSupport(row: ComparisonRow, options: PerfCompareOptions) {
  const rounds = `${row.agreement}/${row.pairedRoundsCount} rounds`;
  if (options.node) return rounds;
  return `${rounds}, raw ${row.sampleSupport}/${row.pairedRoundsCount}`;
}

function formatUnflaggedDiagnostics(
  rows: ComparisonRow[],
  options: PerfCompareOptions,
): string[] {
  const primaryMetrics = getPrimaryMetrics(options);
  const diagnostics = rows.filter((row) => {
    if (row.significant) return false;
    if (!row.threshold) return false;
    return primaryMetrics.includes(row.metric);
  });
  if (diagnostics.length === 0) return [];

  const details = diagnostics.map((row) => {
    const metric = getMetricLabel(row.metric, options);
    return `${metric} (${formatSupport(row, options)})`;
  });
  return [
    `<sub>Unflagged threshold-sized changes: ${details.join("; ")}.</sub>`,
    "",
  ];
}

function formatScriptProfile(result: PerfResult): string[] {
  const profile = result.profiles?.script;
  if (!profile) return [];
  if (profile.length === 0) return [];

  const lines: string[] = [];
  lines.push("#### Script profile");
  lines.push("");
  lines.push("| Function | Self | Total | Hits |");
  lines.push("|----------|------|-------|------|");

  for (const item of profile) {
    lines.push(
      `| ${formatFunctionCell(item)} | ${formatMs(item.selfTime)} | ${formatMs(item.totalTime)} | ${item.hitCount} |`,
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
    ":warning: Profile mode differs between baseline and current. Run both sides with the same profiling flags before comparing aggregate metrics.",
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
    const currentResult = currentByKey.get(key)?.result;
    const profileMode = testRows.some((row) => row.profileMode);
    const profileLines = formatProfiles(currentResult);
    if (profileMode && profileLines.length === 0) continue;
    lines.push(`### ${label}`);
    lines.push("");
    if (!profileMode) {
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
      lines.push(...formatUnflaggedDiagnostics(testRows, options));
    }
    lines.push(...profileLines);
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
  const supportClause = options.node
    ? "rounds agree on direction"
    : "rounds agree on direction and raw samples support it";

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
    const newTestsWithMetrics = newTests.filter(
      ({ result }) => !isProfileMode(result),
    );
    lines.push(`### New ${resultsName} (no baseline)`);
    lines.push("");
    if (options.node) {
      lines.push(...formatNodeResultTables(newTestsWithMetrics, options));
    } else if (newTestsWithMetrics.length > 0) {
      const headers = [
        resultName,
        ...primaryMetrics.map((metric) => getMetricLabel(metric, options)),
      ];
      lines.push(`| ${headers.join(" | ")} |`);
      lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
      for (const { result } of newTestsWithMetrics) {
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
      `Compared ${resultsName} used mixed interleaved round counts; a change is flagged only when the paired median delta exceeds the threshold, ${supportClause}.`,
    );
  } else if (pairedRoundsCount > 1) {
    lines.push("");
    lines.push(
      `Aggregated across ${pairedRoundsCount} interleaved rounds; a change is flagged only when the paired median delta exceeds the threshold, ${supportClause}.`,
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
