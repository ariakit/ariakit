import { Buffer } from "node:buffer";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GREATEST_LOWER_BOUND,
  TraceMap,
  originalPositionFor,
} from "@jridgewell/trace-mapping";
import type { SourceMapInput } from "@jridgewell/trace-mapping";
import { errors } from "@playwright/test";
import type {
  Browser,
  BrowserContextOptions,
  CDPSession,
  Page,
  TestInfo,
} from "@playwright/test";

const DEFAULT_PROFILE_LIMIT = 10;
const DEFAULT_PERF_ITERATIONS = 10;
const DEFAULT_PERF_WARMUP = 1;
const DEFAULT_SCRIPT_PROFILE_ITERATIONS = 3;
const DEFAULT_SCRIPT_PROFILE_WARMUP = 0;
// Upper bound for a single iteration navigation. Healthy CI page loads finish
// in a few seconds even on contended runners; a navigation that runs this
// long means the browser wedged (the server keeps serving a fresh browser
// right away), so fail it fast and retry in a new context instead of letting
// the pending navigation consume the remaining test budget.
const ITERATION_NAVIGATION_TIMEOUT = 30_000;
// Upper bound for closing an iteration context on a wedged browser; see the
// close handling in measureIteration.
const CONTEXT_CLOSE_TIMEOUT = 10_000;
const initializedResultFiles = new Set<string>();

// CDP metric names (values are in seconds).
const SCRIPT_DURATION = "ScriptDuration";
const LAYOUT_DURATION = "LayoutDuration";
const RECALC_STYLE_DURATION = "RecalcStyleDuration";

const SELECTOR_TRACE_CATEGORIES = [
  "-*",
  "devtools.timeline",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-blink.debug",
  "disabled-by-default-devtools.timeline.invalidationTracking",
];

const INTERNAL_SCRIPT_FUNCTIONS = new Set([
  "(garbage collector)",
  "(idle)",
  "(program)",
  "(root)",
]);

export interface PerfMetrics {
  scripting: number;
  /** Layout plus style recalc time. */
  rendering: number;
  inp: number;
  total: number;
}

export interface PerfScriptProfileEntry {
  functionName: string;
  url: string;
  line: number;
  column: number;
  generatedFunctionName?: string;
  generatedUrl?: string;
  generatedLine?: number;
  generatedColumn?: number;
  generatedScriptId?: string;
  sourceMapUrl?: string;
  selfTime: number;
  totalTime: number;
  hitCount: number;
}

export interface SourceMapResolverOptions {
  sourceMapUrls?: ReadonlyMap<string, string>;
  traceMapCache?: Map<string, Promise<TraceMap | undefined>>;
  workspaceRoot?: string;
  loadScript?: (url: string) => Promise<string | undefined>;
  loadSourceMap?: (url: string) => Promise<SourceMapInput | undefined>;
}

export interface PerfSelectorProfileEntry {
  selector: string;
  styleSheetId: string;
  styleSheetUrl: string;
  elapsed: number;
  matchAttempts: number;
  matchCount: number;
  slowPathNonMatchPercent: number;
  invalidationCount: number;
}

export interface PerfProfiles {
  script?: PerfScriptProfileEntry[];
  selectors?: PerfSelectorProfileEntry[];
}

/**
 * Callback invoked with the iteration's page. Each iteration runs in a fresh
 * browser context, so callbacks must use the page they receive instead of
 * closing over the test's fixture page.
 */
export type PerfMeasureCallback = (page: Page) => Promise<void> | void;

export interface PerfMeasureOptions {
  /** Number of measured iterations (warmup runs are additional). */
  iterations?: number;
  /** Number of discarded warm-up runs before measurement begins. */
  warmup?: number;
  /**
   * Unmeasured setup callback run before every iteration's measured
   * interaction. For interaction measurements it runs after the iteration
   * page loads; for page-load measurements it runs on the blank page before
   * the measured navigation. Useful for getting the page into the state the
   * measured interaction expects, such as opening a dialog before measuring
   * how long it takes to close it.
   */
  setup?: PerfMeasureCallback;
  /**
   * Unmeasured verification callback run after the metrics snapshot for each
   * iteration. Use this for assertions so Playwright polling is not counted as
   * application work.
   */
  verify?: PerfMeasureCallback;
  /** Override the auto-generated label for this measurement. */
  label?: string;
  /**
   * Collect expensive JS functions. Explicit options on regular labels keep
   * measured metrics unprofiled by collecting profiles in extra diagnostic
   * iterations. Profile-only labels and env-driven profiling collect during
   * measured iterations and add overhead to those metrics.
   */
  scriptProfile?: boolean;
  /**
   * Collect expensive CSS selectors. Explicit options on regular labels keep
   * measured metrics unprofiled by collecting profiles in extra diagnostic
   * iterations. Profile-only labels and env-driven profiling collect during
   * measured iterations and add overhead to those metrics.
   */
  selectorProfile?: boolean;
  /** Maximum number of profile entries stored per profile type. */
  profileLimit?: number;
}

interface CreatePerfMeasureOptions extends PerfMeasureOptions {
  /**
   * Navigate each iteration page to the measured URL before the interaction.
   * Page-load measurements disable this and navigate inside the measured
   * interaction instead.
   */
  loadPage?: boolean;
}

interface PerfSamplingOptions {
  iterations?: number;
  warmup?: number;
  scriptProfile?: boolean;
}

interface PerfSamplingResult {
  iterations: number;
  warmup: number;
}

interface PerfProfileModeOptions {
  label: string;
  scriptProfile?: boolean;
  selectorProfile?: boolean;
}

interface PerfProfileModeResult {
  profileOnly: boolean;
  scriptProfile: boolean;
  selectorProfile: boolean;
  timingScriptProfile: boolean;
  timingSelectorProfile: boolean;
  diagnosticScriptProfile: boolean;
  diagnosticSelectorProfile: boolean;
}

export interface PerfResult {
  testFile: string;
  testTitle: string;
  label: string;
  /** Escaped Vitest task pattern used to select a Node benchmark. */
  benchmarkPattern?: string;
  metrics: PerfMetrics;
  raw: PerfMetrics[];
  profileOnly?: boolean;
  scriptProfile?: boolean;
  selectorProfile?: boolean;
  profiles?: PerfProfiles;
}

interface CdpCallFrame {
  functionName: string;
  scriptId: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
}

interface CdpProfileNode {
  id: number;
  callFrame: CdpCallFrame;
  hitCount?: number;
  children?: number[];
}

interface CdpProfile {
  nodes: CdpProfileNode[];
  samples?: number[];
  timeDeltas?: number[];
}

interface ProfilerStopResponse {
  profile: CdpProfile;
}

interface PerformanceEventObserverInit extends PerformanceObserverInit {
  durationThreshold?: number;
}

interface CssStyleSheetHeader {
  styleSheetId: string;
  sourceURL?: string;
}

interface CssStyleSheetAddedEvent {
  header: CssStyleSheetHeader;
}

interface DebuggerScriptParsedEvent {
  scriptId: string;
  url?: string;
  sourceMapURL?: string;
}

interface CdpTraceEvent {
  name?: string;
  args?: {
    selector_stats?: {
      selector_timings?: CdpSelectorTiming[];
    };
  };
}

interface TracingDataCollectedEvent {
  value?: CdpTraceEvent[];
}

interface CdpSelectorTiming {
  "elapsed (us)": number;
  fast_reject_count?: number;
  match_attempts?: number;
  selector?: string;
  style_sheet_id?: string;
  match_count?: number;
  invalidation_count?: number;
}

interface SelectorTraceSession {
  stop: () => Promise<PerfSelectorProfileEntry[]>;
}

interface MeasureOnceOptions {
  scriptProfile: boolean;
  selectorProfile: boolean;
  styleSheetUrls: Map<string, string>;
  scriptSourceMapResolver: SourceMapResolverOptions;
  scriptSourceMapUrls: ReadonlyMap<string, string>;
}

interface MeasureOnceResult {
  metrics: PerfMetrics;
  profiles?: PerfProfiles;
}

interface MutableSelectorProfileEntry extends PerfSelectorProfileEntry {
  fastRejectCount: number;
}

interface SelectorProfileAccumulator extends PerfSelectorProfileEntry {
  weightedSlowPathSum: number;
}

interface MetricsResponse {
  metrics: Array<{ name: string; value: number }>;
}

function getMetricValue(
  metrics: Array<{ name: string; value: number }>,
  name: string,
): number {
  const metric = metrics.find((m) => m.name === name);
  if (!metric) return 0;
  return metric.value;
}

export function median(values: number[]): number {
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

export function computeMedianMetrics(all: PerfMetrics[]): PerfMetrics {
  return {
    scripting: median(all.map((m) => m.scripting)),
    rendering: median(all.map((m) => m.rendering)),
    inp: median(all.map((m) => m.inp)),
    total: median(all.map((m) => m.total)),
  };
}

export function getUniquePerfLabel(
  labels: Iterable<string>,
  baseLabel: string,
): string {
  const used = new Set(labels);
  if (!used.has(baseLabel)) return baseLabel;

  let suffix = 2;
  while (used.has(`${baseLabel} #${suffix}`)) {
    suffix += 1;
  }

  return `${baseLabel} #${suffix}`;
}

function isTruthyEnv(name: string): boolean {
  return process.env[name] === "true" || process.env[name] === "1";
}

interface IntegerEnvOptions {
  min?: number;
}

export function getIntegerEnv(
  name: string,
  fallback: number,
  options: IntegerEnvOptions = {},
): number {
  const value = process.env[name];
  if (value == null) return fallback;
  if (value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  if (options.min != null && parsed < options.min) return fallback;
  return parsed;
}

export function getPerfSamplingOptions({
  iterations,
  warmup,
  scriptProfile,
}: PerfSamplingOptions = {}): PerfSamplingResult {
  // Script profiles are diagnostic and much more expensive than the unprofiled
  // timing run, so keep their default sample count lower.
  const defaultIterations = scriptProfile
    ? getIntegerEnv(
        "PERF_SCRIPT_PROFILE_ITERATIONS",
        DEFAULT_SCRIPT_PROFILE_ITERATIONS,
        { min: 1 },
      )
    : getIntegerEnv("PERF_ITERATIONS", DEFAULT_PERF_ITERATIONS, { min: 1 });
  const defaultWarmup = scriptProfile
    ? getIntegerEnv(
        "PERF_SCRIPT_PROFILE_WARMUP",
        DEFAULT_SCRIPT_PROFILE_WARMUP,
        { min: 0 },
      )
    : getIntegerEnv("PERF_WARMUP", DEFAULT_PERF_WARMUP, { min: 0 });

  return {
    iterations: iterations === undefined ? defaultIterations : iterations,
    warmup: warmup === undefined ? defaultWarmup : warmup,
  };
}

export function formatPerfTitlePath(titlePath: string[]): string {
  const titleParts: string[] = [];
  for (const title of titlePath) {
    if (!title) continue;
    const pathParts = /\.tsx?$/.test(title) ? title.split(/[\\/]/) : [title];
    const sandboxIndex = pathParts.lastIndexOf("sandbox");
    const visibleParts =
      sandboxIndex >= 0 ? pathParts.slice(sandboxIndex + 1) : pathParts;
    for (const part of visibleParts) {
      if (!part) continue;
      if (part === "perf-chrome.ts") continue;
      titleParts.push(part);
    }
  }
  return titleParts.join(" > ");
}

const PROFILE_LABEL_SUFFIXES = [" (script profile)", " (selector profile)"];

/**
 * Removes suffixes that mark dedicated profile-only measurements. These legacy
 * labels run with profiler overhead, use profile sampling defaults, and are
 * merged into their base label without contributing metrics to comparisons.
 */
export function getPerfProfileBaseLabel(label: string): string {
  for (const suffix of PROFILE_LABEL_SUFFIXES) {
    if (label.endsWith(suffix)) {
      return label.slice(0, -suffix.length);
    }
  }
  return label;
}

/**
 * Detects labels that opt into profile-only behavior through their suffix. A
 * profile-only measurement runs with profiler overhead and is excluded from
 * timing comparisons.
 */
export function isPerfProfileLabel(label: string): boolean {
  return getPerfProfileBaseLabel(label) !== label;
}

/**
 * Resolves whether profiling runs in the measured iteration or in separate
 * diagnostic iterations. Env-driven profiling keeps the old quick measured
 * path with profiler overhead; explicit profiling options on regular labels
 * keep timing metrics unprofiled.
 */
export function getPerfProfileMode({
  label,
  scriptProfile: scriptProfileOption,
  selectorProfile: selectorProfileOption,
}: PerfProfileModeOptions): PerfProfileModeResult {
  const envScriptProfile =
    scriptProfileOption == null && isTruthyEnv("PERF_SCRIPT_PROFILE");
  const envSelectorProfile =
    selectorProfileOption == null &&
    (isTruthyEnv("PERF_SELECTOR_PROFILE") ||
      isTruthyEnv("PERF_CSS_SELECTOR_PROFILE"));
  const scriptProfile = scriptProfileOption ?? envScriptProfile;
  const selectorProfile = selectorProfileOption ?? envSelectorProfile;
  const profileOnly = isPerfProfileLabel(label);
  const timingScriptProfile =
    scriptProfile && (profileOnly || envScriptProfile);
  const timingSelectorProfile =
    selectorProfile && (profileOnly || envSelectorProfile);
  return {
    profileOnly,
    scriptProfile,
    selectorProfile,
    timingScriptProfile,
    timingSelectorProfile,
    diagnosticScriptProfile: scriptProfile && !timingScriptProfile,
    diagnosticSelectorProfile: selectorProfile && !timingSelectorProfile,
  };
}

function normalizeProfileUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "file:") {
      return path.relative(process.cwd(), fileURLToPath(parsedUrl));
    }
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url;
  }
}

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function getWorkspaceRoot(): string {
  let dir = process.cwd();
  while (true) {
    if (
      existsSync(path.join(dir, "pnpm-workspace.yaml")) ||
      existsSync(path.join(dir, ".git"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

function normalizeSourceMapSource(source: string, workspaceRoot: string) {
  let file = source.split("\u0000").join("");

  try {
    const parsedUrl = new URL(file);
    if (parsedUrl.protocol === "file:") {
      file = fileURLToPath(parsedUrl);
    } else {
      file = decodeURIComponent(parsedUrl.pathname);
    }
  } catch {}

  file = normalizeFilePath(file.split(/[?#]/, 1)[0] ?? file);

  if (file.startsWith("/@fs/")) {
    file = file.slice("/@fs".length);
  }

  if (
    file.startsWith("/src/") &&
    existsSync(path.join(workspaceRoot, "app", file))
  ) {
    return `app${file}`;
  }

  if (path.isAbsolute(file)) {
    const relative = normalizeFilePath(path.relative(workspaceRoot, file));
    if (!relative.startsWith("../") && !path.isAbsolute(relative)) {
      return relative;
    }
  }

  const rootedMatch = file.match(
    /(?:^|\/)((?:app|benchmark|examples|nextjs|packages|scripts|templates|website)\/.+)$/,
  );
  if (rootedMatch?.[1]) {
    return rootedMatch[1];
  }

  file = file.replace(/^(?:\.\.?\/)+/, "");
  if (
    file.startsWith("src/") &&
    existsSync(path.join(workspaceRoot, "app", file))
  ) {
    return `app/${file}`;
  }
  return file;
}

function extractSourceMappingUrl(script: string): string | undefined {
  let sourceMapUrl: string | undefined;
  const sourceMapPattern =
    /(?:\/\/|\/\*)[#@]\s*sourceMappingURL=([^\s*]+)(?:\s*\*\/)?/g;
  for (const match of script.matchAll(sourceMapPattern)) {
    sourceMapUrl = match[1];
  }
  return sourceMapUrl;
}

function resolveSourceMapUrl(sourceMapUrl: string, generatedUrl: string) {
  if (sourceMapUrl.startsWith("data:")) return sourceMapUrl;
  try {
    return new URL(sourceMapUrl, generatedUrl).href;
  } catch {
    return sourceMapUrl;
  }
}

function decodeDataSourceMap(url: string): SourceMapInput | undefined {
  const commaIndex = url.indexOf(",");
  if (commaIndex === -1) return;

  const metadata = url.slice(0, commaIndex).toLowerCase();
  const payload = url.slice(commaIndex + 1);
  const text = metadata.endsWith(";base64")
    ? Buffer.from(payload, "base64").toString("utf-8")
    : decodeURIComponent(payload);
  return JSON.parse(text) as SourceMapInput;
}

async function defaultLoadText(url: string): Promise<string | undefined> {
  const response = await fetch(url);
  if (!response.ok) return;
  return response.text();
}

async function defaultLoadSourceMap(
  url: string,
): Promise<SourceMapInput | undefined> {
  if (url.startsWith("data:")) {
    return decodeDataSourceMap(url);
  }
  const text = await defaultLoadText(url);
  if (!text) return;
  return JSON.parse(text) as SourceMapInput;
}

function createCachedLoader<T>(load: (url: string) => Promise<T | undefined>) {
  const cache = new Map<string, Promise<T | undefined>>();
  return (url: string) => {
    let promise = cache.get(url);
    if (!promise) {
      promise = load(url).catch(() => undefined);
      cache.set(url, promise);
    }
    return promise;
  };
}

function shouldIncludeScriptFrame(callFrame: CdpCallFrame): boolean {
  if (!callFrame.url) return false;
  if (INTERNAL_SCRIPT_FUNCTIONS.has(callFrame.functionName)) return false;
  if (callFrame.url.startsWith("node:")) return false;
  if (callFrame.url.startsWith("chrome:")) return false;
  if (callFrame.url.startsWith("chrome-extension:")) return false;
  if (callFrame.url.includes("__playwright_evaluation_script__")) {
    return false;
  }
  return true;
}

function scriptProfileKey(callFrame: CdpCallFrame): string {
  return [
    callFrame.functionName || "(anonymous)",
    callFrame.url,
    callFrame.lineNumber,
    callFrame.columnNumber,
  ].join("\0");
}

function getScriptProfileEntry(
  entries: Map<string, PerfScriptProfileEntry>,
  callFrame: CdpCallFrame,
) {
  const key = scriptProfileKey(callFrame);
  const existingEntry = entries.get(key);
  if (existingEntry) {
    return existingEntry;
  }

  const entry: PerfScriptProfileEntry = {
    functionName: callFrame.functionName || "(anonymous)",
    url: normalizeProfileUrl(callFrame.url),
    line: callFrame.lineNumber + 1,
    column: callFrame.columnNumber + 1,
    generatedFunctionName: callFrame.functionName || "(anonymous)",
    generatedUrl: callFrame.url,
    generatedLine: callFrame.lineNumber + 1,
    generatedColumn: callFrame.columnNumber + 1,
    generatedScriptId: callFrame.scriptId,
    selfTime: 0,
    totalTime: 0,
    hitCount: 0,
  };
  entries.set(key, entry);
  return entry;
}

export function parseScriptProfile(
  profile: CdpProfile,
): PerfScriptProfileEntry[] {
  const nodes = new Map<number, CdpProfileNode>();
  const parents = new Map<number, number>();

  for (const node of profile.nodes) {
    nodes.set(node.id, node);
    for (const childId of node.children ?? []) {
      parents.set(childId, node.id);
    }
  }

  const entries = new Map<string, PerfScriptProfileEntry>();
  const samples = profile.samples ?? [];
  const timeDeltas = profile.timeDeltas ?? [];

  for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex++) {
    const sampleId = samples[sampleIndex];
    if (sampleId == null) continue;

    const timeDelta = timeDeltas[sampleIndex] ?? 0;
    const timeMs = timeDelta / 1000;
    const sampleNode = nodes.get(sampleId);
    if (!sampleNode) continue;

    if (shouldIncludeScriptFrame(sampleNode.callFrame)) {
      const entry = getScriptProfileEntry(entries, sampleNode.callFrame);
      entry.selfTime += timeMs;
      entry.hitCount += 1;
    }

    const totalTimeKeys = new Set<string>();
    let currentNode: CdpProfileNode | undefined = sampleNode;
    while (currentNode) {
      if (shouldIncludeScriptFrame(currentNode.callFrame)) {
        const key = scriptProfileKey(currentNode.callFrame);
        if (!totalTimeKeys.has(key)) {
          totalTimeKeys.add(key);
          const entry = getScriptProfileEntry(entries, currentNode.callFrame);
          entry.totalTime += timeMs;
        }
      }
      const parentId = parents.get(currentNode.id);
      if (parentId == null) break;
      currentNode = nodes.get(parentId);
    }
  }

  return [...entries.values()].sort(
    (a, b) => b.selfTime - a.selfTime || b.totalTime - a.totalTime,
  );
}

export async function resolveScriptProfileSourceMaps(
  entries: PerfScriptProfileEntry[],
  options: SourceMapResolverOptions = {},
): Promise<PerfScriptProfileEntry[]> {
  const workspaceRoot = options.workspaceRoot ?? getWorkspaceRoot();
  const loadScript = options.loadScript ?? defaultLoadText;
  const loadSourceMap = options.loadSourceMap ?? defaultLoadSourceMap;
  const traceMapCache =
    options.traceMapCache ?? new Map<string, Promise<TraceMap | undefined>>();

  const loadTraceMap = async (sourceMapUrl: string) => {
    let promise = traceMapCache.get(sourceMapUrl);
    if (!promise) {
      promise = (async () => {
        const sourceMap = await loadSourceMap(sourceMapUrl);
        if (!sourceMap) return;
        return new TraceMap(sourceMap, sourceMapUrl);
      })().catch(() => undefined);
      traceMapCache.set(sourceMapUrl, promise);
    }
    return promise;
  };

  const getEntrySourceMapUrl = async (entry: PerfScriptProfileEntry) => {
    const generatedUrl = entry.generatedUrl ?? entry.url;
    const sourceMapUrl =
      entry.sourceMapUrl ??
      (entry.generatedScriptId
        ? options.sourceMapUrls?.get(entry.generatedScriptId)
        : undefined);
    if (sourceMapUrl) {
      return resolveSourceMapUrl(sourceMapUrl, generatedUrl);
    }

    const script = await loadScript(generatedUrl).catch(() => undefined);
    const extractedUrl = script ? extractSourceMappingUrl(script) : undefined;
    if (!extractedUrl) return;
    return resolveSourceMapUrl(extractedUrl, generatedUrl);
  };

  return Promise.all(
    entries.map(async (entry) => {
      try {
        const sourceMapUrl = await getEntrySourceMapUrl(entry);
        if (!sourceMapUrl) return entry;

        const traceMap = await loadTraceMap(sourceMapUrl);
        if (!traceMap) return entry;

        const generatedLine = entry.generatedLine ?? entry.line;
        const generatedColumn = (entry.generatedColumn ?? entry.column) - 1;
        const original = originalPositionFor(traceMap, {
          line: generatedLine,
          column: Math.max(0, generatedColumn),
          bias: GREATEST_LOWER_BOUND,
        });
        if (
          !original.source ||
          original.line == null ||
          original.column == null
        ) {
          return { ...entry, sourceMapUrl };
        }

        return {
          ...entry,
          functionName: original.name || entry.functionName,
          url: normalizeSourceMapSource(original.source, workspaceRoot),
          line: original.line,
          column: original.column + 1,
          sourceMapUrl,
        };
      } catch {
        return entry;
      }
    }),
  );
}

function selectorProfileKey(timing: CdpSelectorTiming): string {
  return `${timing.style_sheet_id ?? ""}\0${timing.selector ?? ""}`;
}

function getSelectorProfileEntry(
  entries: Map<string, MutableSelectorProfileEntry>,
  timing: CdpSelectorTiming,
  styleSheetUrls: Map<string, string>,
) {
  const key = selectorProfileKey(timing);
  const existingEntry = entries.get(key);
  if (existingEntry) {
    return existingEntry;
  }

  const styleSheetId = timing.style_sheet_id ?? "";
  const entry: MutableSelectorProfileEntry = {
    selector: timing.selector ?? "",
    styleSheetId,
    styleSheetUrl: normalizeProfileUrl(styleSheetUrls.get(styleSheetId) ?? ""),
    elapsed: 0,
    matchAttempts: 0,
    matchCount: 0,
    slowPathNonMatchPercent: 0,
    invalidationCount: 0,
    fastRejectCount: 0,
  };
  entries.set(key, entry);
  return entry;
}

function parseSelectorTrace(
  events: CdpTraceEvent[],
  styleSheetUrls: Map<string, string>,
): PerfSelectorProfileEntry[] {
  const entries = new Map<string, MutableSelectorProfileEntry>();

  for (const event of events) {
    if (event.name !== "SelectorStats") continue;

    const timings = event.args?.selector_stats?.selector_timings ?? [];
    for (const timing of timings) {
      if (!timing.selector) continue;
      if (timing.style_sheet_id === "ua-style-sheet") continue;

      const entry = getSelectorProfileEntry(entries, timing, styleSheetUrls);
      entry.elapsed += timing["elapsed (us)"] / 1000;
      entry.matchAttempts += timing.match_attempts ?? 0;
      entry.matchCount += timing.match_count ?? 0;
      entry.fastRejectCount += timing.fast_reject_count ?? 0;
      entry.invalidationCount += timing.invalidation_count ?? 0;
    }
  }

  for (const entry of entries.values()) {
    const slowPathNonMatches = Math.max(
      0,
      entry.matchAttempts - entry.matchCount - entry.fastRejectCount,
    );
    entry.slowPathNonMatchPercent =
      entry.matchAttempts > 0
        ? (slowPathNonMatches / entry.matchAttempts) * 100
        : 0;
  }

  return [...entries.values()]
    .sort((a, b) => b.elapsed - a.elapsed)
    .map((entry) => ({
      selector: entry.selector,
      styleSheetId: entry.styleSheetId,
      styleSheetUrl: entry.styleSheetUrl,
      elapsed: entry.elapsed,
      matchAttempts: entry.matchAttempts,
      matchCount: entry.matchCount,
      slowPathNonMatchPercent: entry.slowPathNonMatchPercent,
      invalidationCount: entry.invalidationCount,
    }));
}

async function startSelectorTrace(
  cdp: CDPSession,
  styleSheetUrls: Map<string, string>,
): Promise<SelectorTraceSession> {
  const events: CdpTraceEvent[] = [];
  let resolveTracingComplete: () => void = () => {};
  const tracingComplete = new Promise<void>((resolve) => {
    resolveTracingComplete = resolve;
  });

  const onDataCollected = (event: TracingDataCollectedEvent) => {
    events.push(...(event.value ?? []));
  };

  const onTracingComplete = () => {
    resolveTracingComplete();
  };

  cdp.on("Tracing.dataCollected", onDataCollected);
  cdp.on("Tracing.tracingComplete", onTracingComplete);

  try {
    await cdp.send("Tracing.start", {
      categories: SELECTOR_TRACE_CATEGORIES.join(","),
      transferMode: "ReportEvents",
    });
  } catch (error) {
    cdp.off("Tracing.dataCollected", onDataCollected);
    cdp.off("Tracing.tracingComplete", onTracingComplete);
    throw error;
  }

  return {
    stop: async () => {
      try {
        await cdp.send("Tracing.end");
        await tracingComplete;
        return parseSelectorTrace(events, styleSheetUrls);
      } finally {
        cdp.off("Tracing.dataCollected", onDataCollected);
        cdp.off("Tracing.tracingComplete", onTracingComplete);
      }
    },
  };
}

export function mergeScriptProfiles(
  profiles: PerfScriptProfileEntry[][],
  limit: number,
): PerfScriptProfileEntry[] {
  const entries = new Map<string, PerfScriptProfileEntry>();

  for (const profile of profiles) {
    for (const item of profile) {
      const key = [item.functionName, item.url, item.line, item.column].join(
        "\0",
      );
      const existingItem = entries.get(key);
      if (existingItem) {
        existingItem.selfTime += item.selfTime;
        existingItem.totalTime += item.totalTime;
        existingItem.hitCount += item.hitCount;
        continue;
      }
      entries.set(key, { ...item });
    }
  }

  return [...entries.values()]
    .sort((a, b) => b.selfTime - a.selfTime || b.totalTime - a.totalTime)
    .slice(0, limit);
}

export function mergeSelectorProfiles(
  profiles: PerfSelectorProfileEntry[][],
  limit: number,
): PerfSelectorProfileEntry[] {
  const entries = new Map<string, SelectorProfileAccumulator>();

  for (const profile of profiles) {
    for (const item of profile) {
      const key = `${item.styleSheetId}\0${item.selector}`;
      const weightedSlowPathSum =
        item.matchAttempts * item.slowPathNonMatchPercent;
      const existingItem = entries.get(key);
      if (existingItem) {
        existingItem.elapsed += item.elapsed;
        existingItem.matchAttempts += item.matchAttempts;
        existingItem.matchCount += item.matchCount;
        existingItem.invalidationCount += item.invalidationCount;
        existingItem.weightedSlowPathSum += weightedSlowPathSum;
        continue;
      }
      entries.set(key, { ...item, weightedSlowPathSum });
    }
  }

  return [...entries.values()]
    .sort((a, b) => b.elapsed - a.elapsed)
    .slice(0, limit)
    .map(({ weightedSlowPathSum, ...item }) => ({
      ...item,
      slowPathNonMatchPercent:
        item.matchAttempts > 0 ? weightedSlowPathSum / item.matchAttempts : 0,
    }));
}

function hasProfileEntries(profiles: PerfProfiles): boolean {
  return (
    (profiles.script != null && profiles.script.length > 0) ||
    (profiles.selectors != null && profiles.selectors.length > 0)
  );
}

function createProfiles(
  scriptProfiles: PerfScriptProfileEntry[][],
  selectorProfiles: PerfSelectorProfileEntry[][],
  limit: number,
): PerfProfiles | undefined {
  const profiles: PerfProfiles = {};
  if (scriptProfiles.length > 0) {
    const script = mergeScriptProfiles(scriptProfiles, limit);
    if (script.length > 0) {
      profiles.script = script;
    }
  }
  if (selectorProfiles.length > 0) {
    const selectors = mergeSelectorProfiles(selectorProfiles, limit);
    if (selectors.length > 0) {
      profiles.selectors = selectors;
    }
  }
  if (!hasProfileEntries(profiles)) return;
  return profiles;
}

async function disconnectPerfObserver(page: Page) {
  await page
    .evaluate(() => {
      const w = window as any;
      if (w.__perfObserver) {
        w.__perfObserver.disconnect();
      }
    })
    .catch(() => {});
}

async function collectInpValues(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const w = window as any;
    if (w.__perfObserver) {
      for (const entry of w.__perfObserver.takeRecords()) {
        if (entry.interactionId) {
          w.__perfInpEntries.push(entry.duration);
        }
      }
      w.__perfObserver.disconnect();
    }
    return w.__perfInpEntries ?? [];
  });
}

/**
 * Navigates to `url` and waits for it to be ready for a browser test. Waits for
 * the bounded `load` event rather than `networkidle`: under CI contention,
 * networkidle's unbounded "no requests for 500ms" wait can stall past the test
 * timeout. After `load`, still wait for network idle so late work (such as
 * `client:load` island hydration) settles, but cap it so a stalled or chatty
 * request degrades to a short wait instead of consuming the test budget. Only
 * the bounded settle timing out is expected; rethrow real failures such as the
 * page or context closing.
 *
 * Kept in sync with the copy in `app/src/test-utils/preview.ts`.
 */
async function gotoAndSettle(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch((error) => {
      if (!(error instanceof errors.TimeoutError)) throw error;
    });
}

export interface SettleQuiescentOptions {
  /** Milliseconds between metric polls. */
  pollInterval?: number;
  /** Minimum tracked-work increase in ms between polls that counts as activity. */
  epsilon?: number;
  /** Consecutive quiet polls required before the page counts as settled. */
  quietPolls?: number;
  /**
   * Cap in ms on the polling phase, so busy pages cannot stall runs. Polling
   * runs in whole `pollInterval` steps, so a non-divisible cap is rounded up
   * to the next whole poll.
   */
  maxWait?: number;
}

/**
 * Main-thread work in ms tracked for settle quiescence. Any deferred work that
 * produces paint also shows up here first as script, style recalc, or layout
 * time, so paint work needs no tracking of its own.
 */
function getTrackedWork(
  metrics: Array<{ name: string; value: number }>,
): number {
  const scripting = getMetricValue(metrics, SCRIPT_DURATION);
  const layout = getMetricValue(metrics, LAYOUT_DURATION);
  const styleRecalc = getMetricValue(metrics, RECALC_STYLE_DURATION);
  return (scripting + layout + styleRecalc) * 1000;
}

/**
 * Lets the work triggered by an interaction settle before the closing metrics
 * snapshot. A fixed post-paint wait undercounts deferred work that lands late
 * on contended CI runners (such as a dialog inert-marking the page after it
 * opens), which made per-iteration metrics bimodal. Instead, flush the pending
 * frame, then poll CDP metrics until the tracked main-thread work stops
 * increasing for `quietPolls` consecutive polls, within the `maxWait` cap.
 */
export async function settleQuiescent(
  page: Page,
  cdp: CDPSession,
  options: SettleQuiescentOptions = {},
) {
  const {
    pollInterval = 50,
    epsilon = 2,
    quietPolls = 3,
    maxWait = 2000,
  } = options;
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      }),
  );
  const readTrackedWork = async () => {
    const response: MetricsResponse = await cdp.send("Performance.getMetrics");
    return getTrackedWork(response.metrics);
  };
  const maxPolls = Math.ceil(maxWait / pollInterval);
  let previous = await readTrackedWork();
  let quiet = 0;
  for (let i = 0; i < maxPolls; i++) {
    await page.waitForTimeout(pollInterval);
    const current = await readTrackedWork();
    if (current - previous < epsilon) {
      quiet += 1;
      if (quiet >= quietPolls) return;
    } else {
      quiet = 0;
    }
    previous = current;
  }
}

/**
 * Runs a single interaction measurement cycle: snapshot CDP metrics before and
 * after the interaction, collect INP entries, and return the deltas.
 */
async function measureOnce(
  page: Page,
  cdp: CDPSession,
  interaction: () => Promise<void>,
  options: MeasureOnceOptions,
): Promise<MeasureOnceResult> {
  // Install INP observer before the interaction.
  await page.evaluate(() => {
    const w = window as any;
    w.__perfInpEntries = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).interactionId) {
          w.__perfInpEntries.push(entry.duration);
        }
      }
    });
    // Event Timing observers default to 104ms. These measurements track fast
    // deliberate interactions, so use the spec-minimum threshold.
    const observerOptions: PerformanceEventObserverInit = {
      type: "event",
      durationThreshold: 16,
      buffered: false,
    };
    observer.observe(observerOptions);
    w.__perfObserver = observer;
  });

  let before: MetricsResponse | undefined;
  let selectorTrace: SelectorTraceSession | undefined;
  let scriptProfilerStarted = false;
  let measureError: unknown;
  let profilingError: unknown;
  const profiles: PerfProfiles = {};

  try {
    before = await cdp.send("Performance.getMetrics");
    if (options.selectorProfile) {
      selectorTrace = await startSelectorTrace(cdp, options.styleSheetUrls);
    }
    if (options.scriptProfile) {
      await cdp.send("Profiler.start");
      scriptProfilerStarted = true;
    }

    await interaction();
    await settleQuiescent(page, cdp);
  } catch (error) {
    measureError = error;
  }

  if (scriptProfilerStarted) {
    try {
      const response: ProfilerStopResponse = await cdp.send("Profiler.stop");
      profiles.script = await resolveScriptProfileSourceMaps(
        parseScriptProfile(response.profile),
        {
          ...options.scriptSourceMapResolver,
          sourceMapUrls: options.scriptSourceMapUrls,
        },
      );
    } catch (error) {
      profilingError = error;
    }
  }

  if (selectorTrace) {
    try {
      profiles.selectors = await selectorTrace.stop();
    } catch (error) {
      profilingError ??= error;
    }
  }

  if (measureError) {
    await disconnectPerfObserver(page);
    throw measureError;
  }

  if (profilingError) {
    await disconnectPerfObserver(page);
    throw profilingError;
  }

  if (!before) {
    await disconnectPerfObserver(page);
    throw new Error("Missing perf metrics snapshot.");
  }

  let after: MetricsResponse;
  let inpValues: number[];

  try {
    after = await cdp.send("Performance.getMetrics");
    inpValues = await collectInpValues(page);
  } catch (error) {
    await disconnectPerfObserver(page);
    throw error;
  }

  const scriptBefore = getMetricValue(before.metrics, SCRIPT_DURATION);
  const scriptAfter = getMetricValue(after.metrics, SCRIPT_DURATION);
  const layoutBefore = getMetricValue(before.metrics, LAYOUT_DURATION);
  const layoutAfter = getMetricValue(after.metrics, LAYOUT_DURATION);
  const styleBefore = getMetricValue(before.metrics, RECALC_STYLE_DURATION);
  const styleAfter = getMetricValue(after.metrics, RECALC_STYLE_DURATION);

  // CDP values are in seconds; convert to milliseconds.
  const scripting = (scriptAfter - scriptBefore) * 1000;
  const layout = (layoutAfter - layoutBefore) * 1000;
  const styleRecalc = (styleAfter - styleBefore) * 1000;
  const rendering = layout + styleRecalc;
  const inp = inpValues.length > 0 ? Math.max(...inpValues) : 0;
  const total = scripting + rendering;

  const metrics = {
    scripting,
    rendering,
    inp,
    total,
  };

  return {
    metrics,
    profiles: hasProfileEntries(profiles) ? profiles : undefined,
  };
}

/**
 * Context options mirrored from the test project configuration so iteration
 * contexts match the fixture page environment. `browser.newContext` starts
 * from Playwright's built-in defaults rather than the project's `use` block,
 * so the context-relevant options are forwarded explicitly. Only project-level
 * options are visible here: a per-file `test.use()` override would apply to
 * the fixture page but not to iteration contexts.
 */
function getContextOptions(testInfo: TestInfo): BrowserContextOptions {
  const use = testInfo.project.use;
  return {
    baseURL: use.baseURL,
    colorScheme: use.colorScheme,
    deviceScaleFactor: use.deviceScaleFactor,
    hasTouch: use.hasTouch,
    isMobile: use.isMobile,
    // The test runner defaults the fixture page's locale to en-US, while raw
    // contexts default to the system locale; pin it so they match.
    locale: use.locale ?? "en-US",
    timezoneId: use.timezoneId,
    userAgent: use.userAgent,
    viewport: use.viewport,
  };
}

interface MeasureIterationParams {
  browser: Browser;
  contextOptions: BrowserContextOptions;
  testInfo: TestInfo;
  url: string;
  loadPage: boolean;
  interaction: PerfMeasureCallback;
  setup?: PerfMeasureCallback;
  verify?: PerfMeasureCallback;
  scriptProfile: boolean;
  selectorProfile: boolean;
  scriptSourceMapResolver: SourceMapResolverOptions;
}

/**
 * The runner's `screenshot: "only-on-failure"` captures the fixture page,
 * which never receives the interaction; attach the iteration page so failures
 * show the page that was actually measured. Best-effort: the original error
 * matters more than a failed screenshot.
 */
async function attachFailureScreenshot(testInfo: TestInfo, page: Page) {
  try {
    // Bound the screenshot so a hung renderer cannot delay the rethrow of
    // the original, more informative error.
    const body = await page.screenshot({ timeout: 5000 });
    await testInfo.attach("perf-iteration-failure", {
      body,
      contentType: "image/png",
    });
  } catch {}
}

/**
 * Runs one measurement iteration in a dedicated browser context. A fresh
 * context gets a fresh renderer process, so no browser state accumulated by
 * previous iterations leaks into this measurement. Re-navigating the same tab
 * is not enough: renderer state accumulated across same-URL navigations makes
 * some interactions cost over 2x more scripting time from roughly the fourth
 * navigation onward, which made per-iteration metrics bimodal.
 */
async function measureIteration(
  params: MeasureIterationParams,
): Promise<MeasureOnceResult> {
  const context = await params.browser.newContext(params.contextOptions);
  // Raw contexts do not inherit the test runner's navigationTimeout, so bound
  // navigations here; see ITERATION_NAVIGATION_TIMEOUT.
  context.setDefaultNavigationTimeout(ITERATION_NAVIGATION_TIMEOUT);
  try {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const styleSheetUrls = new Map<string, string>();
    const scriptSourceMapUrls = new Map<string, string>();
    const onStyleSheetAdded = (event: CssStyleSheetAddedEvent) => {
      const { styleSheetId, sourceURL = "" } = event.header;
      styleSheetUrls.set(styleSheetId, sourceURL);
    };
    const onScriptParsed = (event: DebuggerScriptParsedEvent) => {
      const { scriptId, sourceMapURL = "" } = event;
      if (sourceMapURL) {
        scriptSourceMapUrls.set(scriptId, sourceMapURL);
      }
    };

    // Track durations in thread CPU time instead of wall-clock time so time
    // the renderer main thread spends preempted by other processes on a
    // contended runner is not counted. The time domain must be set when the
    // domain is enabled.
    await cdp.send("Performance.enable", { timeDomain: "threadTicks" });
    if (params.scriptProfile) {
      cdp.on("Debugger.scriptParsed", onScriptParsed);
      await cdp.send("Debugger.enable");
      await cdp.send("Profiler.enable");
    }
    if (params.selectorProfile) {
      cdp.on("CSS.styleSheetAdded", onStyleSheetAdded);
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
    }

    if (params.loadPage) {
      await gotoAndSettle(page, params.url);
    }

    if (params.setup) {
      // Run the unmeasured setup and let its work settle so it doesn't leak
      // into the metrics snapshot taken right before the interaction.
      await params.setup(page);
      await settleQuiescent(page, cdp);
    }

    const interaction = async () => {
      await params.interaction(page);
    };
    const result = await measureOnce(page, cdp, interaction, {
      scriptProfile: params.scriptProfile,
      selectorProfile: params.selectorProfile,
      scriptSourceMapResolver: params.scriptSourceMapResolver,
      styleSheetUrls,
      scriptSourceMapUrls,
    });

    if (params.verify) {
      await params.verify(page);
    }

    return result;
  } catch (error) {
    const page = context.pages()[0];
    if (page) {
      await attachFailureScreenshot(params.testInfo, page);
    }
    throw error;
  } finally {
    // Swallow close failures: by this point the result is already computed or
    // a more informative error is in flight. Still log them: a context that
    // fails to close stays open in the shared browser, and accumulated leaks
    // precede wedged navigations in later iterations. `close()` has no
    // timeout of its own and can also hang on a wedged browser, which would
    // eat the budget the bounded navigation just saved, so give it a bounded
    // window and abandon it otherwise.
    const closed = context.close().then(
      () => true,
      (error) => {
        console.warn(
          `Failed to close perf iteration context: ${String(error)}`,
        );
        return true;
      },
    );
    const closeTimer = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), CONTEXT_CLOSE_TIMEOUT).unref?.();
    });
    const didClose = await Promise.race([closed, closeTimer]);
    if (!didClose) {
      console.warn("Perf iteration context close timed out; abandoning it.");
    }
  }
}

/**
 * Whether `error` is a Playwright timeout thrown by a navigation. Only
 * navigations are retried: other timeouts, such as interaction or verify
 * steps, can reflect real behavior of the code under measurement. Page-load
 * measures are the one case where the measured interaction is itself a
 * navigation, so a page load that legitimately exceeds the navigation bound
 * is retried too; that stays safe because the failed attempt records nothing
 * and the retry fails the same way.
 */
export function isNavigationTimeoutError(error: unknown) {
  if (!(error instanceof errors.TimeoutError)) return false;
  return error.message.includes("page.goto");
}

/**
 * Runs `measureIteration`, retrying once in a brand-new context when the
 * iteration's navigation times out. A browser under repeated context churn
 * occasionally wedges so that a new context's navigation never resolves even
 * though the server stays healthy (a replacement browser passes against the
 * same server immediately). The failed attempt recorded nothing, so the
 * retried iteration is an independent, equally valid sample.
 */
async function measureIterationWithRetry(
  params: MeasureIterationParams,
): Promise<MeasureOnceResult> {
  try {
    return await measureIteration(params);
  } catch (error) {
    if (!isNavigationTimeoutError(error)) throw error;
    console.warn(
      "Perf iteration navigation timed out; retrying in a new context.",
    );
    return measureIteration(params);
  }
}

/**
 * Runs the interaction multiple times, discards warm-up runs, and returns the
 * median metrics. Each iteration runs in a fresh browser context so the
 * samples are independent; see `measureIteration`.
 */
export async function createPerfMeasure(
  page: Page,
  interaction: PerfMeasureCallback,
  results: PerfResult[],
  testInfo: TestInfo,
  options: CreatePerfMeasureOptions = {},
): Promise<PerfMetrics> {
  const {
    loadPage = true,
    setup,
    verify,
    label,
    profileLimit = DEFAULT_PROFILE_LIMIT,
  } = options;
  const testTitle = formatPerfTitlePath(testInfo.titlePath);
  const baseLabel = label ?? testTitle;
  const {
    profileOnly,
    timingScriptProfile,
    timingSelectorProfile,
    diagnosticScriptProfile,
    diagnosticSelectorProfile,
  } = getPerfProfileMode({
    label: baseLabel,
    scriptProfile: options.scriptProfile,
    selectorProfile: options.selectorProfile,
  });
  const { iterations, warmup } = getPerfSamplingOptions({
    iterations: options.iterations,
    warmup: options.warmup,
    scriptProfile: timingScriptProfile,
  });

  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new Error(`Invalid perf iterations: ${iterations}`);
  }
  if (!Number.isInteger(warmup) || warmup < 0) {
    throw new Error(`Invalid perf warmup: ${warmup}`);
  }
  if (!Number.isInteger(profileLimit) || profileLimit <= 0) {
    throw new Error(`Invalid perf profile limit: ${profileLimit}`);
  }

  const browser = page.context().browser();
  if (!browser) {
    throw new Error("Perf measurements require a browser-launched page.");
  }

  const contextOptions = getContextOptions(testInfo);
  // The test navigated the fixture page to the measured URL; each iteration
  // page visits the same URL in its own context.
  const url = page.url();

  const allMetrics: PerfMetrics[] = [];
  const scriptProfiles: PerfScriptProfileEntry[][] = [];
  const selectorProfiles: PerfSelectorProfileEntry[][] = [];
  // Source map fetches are cached across iterations; the URLs are stable
  // because every iteration loads the same build output.
  const scriptSourceMapResolver: SourceMapResolverOptions = {
    loadScript: createCachedLoader(defaultLoadText),
    loadSourceMap: createCachedLoader(defaultLoadSourceMap),
    traceMapCache: new Map(),
  };

  const runIterations = async ({
    iterationCount,
    warmupCount,
    scriptProfile,
    selectorProfile,
    collectMetrics,
  }: {
    iterationCount: number;
    warmupCount: number;
    scriptProfile: boolean;
    selectorProfile: boolean;
    collectMetrics: boolean;
  }) => {
    for (let i = 0; i < warmupCount + iterationCount; i++) {
      const result = await measureIterationWithRetry({
        browser,
        contextOptions,
        testInfo,
        url,
        loadPage,
        interaction,
        setup,
        verify,
        scriptProfile,
        selectorProfile,
        scriptSourceMapResolver,
      });

      // Only keep measured (non-warmup) iterations.
      if (i < warmupCount) continue;
      if (collectMetrics) {
        allMetrics.push(result.metrics);
      }
      if (result.profiles?.script && result.profiles.script.length > 0) {
        scriptProfiles.push(result.profiles.script);
      }
      if (result.profiles?.selectors && result.profiles.selectors.length > 0) {
        selectorProfiles.push(result.profiles.selectors);
      }
    }
  };

  await runIterations({
    iterationCount: iterations,
    warmupCount: warmup,
    scriptProfile: timingScriptProfile,
    selectorProfile: timingSelectorProfile,
    collectMetrics: true,
  });

  if (diagnosticScriptProfile || diagnosticSelectorProfile) {
    const profileSampling = getPerfSamplingOptions({ scriptProfile: true });
    await runIterations({
      iterationCount: profileSampling.iterations,
      warmupCount: profileSampling.warmup,
      scriptProfile: diagnosticScriptProfile,
      selectorProfile: diagnosticSelectorProfile,
      collectMetrics: false,
    });
  }

  const medianMetrics = computeMedianMetrics(allMetrics);

  const resolvedLabel = getUniquePerfLabel(
    results.map((result) => result.label),
    baseLabel,
  );

  results.push({
    testFile: path.relative(process.cwd(), testInfo.file),
    testTitle,
    label: resolvedLabel,
    metrics: medianMetrics,
    raw: allMetrics,
    profileOnly: profileOnly || undefined,
    scriptProfile: timingScriptProfile || undefined,
    selectorProfile: timingSelectorProfile || undefined,
    profiles: createProfiles(scriptProfiles, selectorProfiles, profileLimit),
  });

  return medianMetrics;
}

export async function createPerfPageLoadMeasure(
  page: Page,
  results: PerfResult[],
  testInfo: TestInfo,
  options: PerfMeasureOptions = {},
): Promise<PerfMetrics> {
  const url = page.url();
  return createPerfMeasure(
    page,
    (iterationPage) => gotoAndSettle(iterationPage, url),
    results,
    testInfo,
    {
      ...options,
      loadPage: false,
    },
  );
}

interface RemoveStaleAttemptResultsParams {
  resultsDir: string;
  prefix: string;
  fileName: string;
  results: PerfResult[];
}

/**
 * Drops the tests in `results` from the run's other worker files. A test can
 * only appear in two worker files of one run when an earlier attempt recorded
 * results and the test was retried anyway (for example a pass whose later
 * fixture teardown failed, flipping the attempt's final status after the perf
 * fixture already appended). Keeping both attempts would double-count the
 * test in the run's collected results.
 */
function removeStaleAttemptResults({
  resultsDir,
  prefix,
  fileName,
  results,
}: RemoveStaleAttemptResultsParams) {
  const testKey = (result: PerfResult) =>
    `${result.testFile}\n${result.testTitle}`;
  const appendedKeys = new Set(results.map(testKey));
  if (!appendedKeys.size) return;
  for (const siblingName of readdirSync(resultsDir)) {
    if (siblingName === fileName) continue;
    if (!siblingName.startsWith(`${prefix}-worker`)) continue;
    if (!siblingName.endsWith(".json")) continue;
    const siblingPath = path.join(resultsDir, siblingName);
    try {
      const entries: PerfResult[] = JSON.parse(
        readFileSync(siblingPath, "utf-8"),
      );
      const kept = entries.filter((entry) => !appendedKeys.has(testKey(entry)));
      if (kept.length === entries.length) continue;
      if (kept.length) {
        writeFileSync(siblingPath, JSON.stringify(kept, null, 2));
      } else {
        rmSync(siblingPath);
      }
    } catch (error) {
      // A malformed sibling file should not fail the passing attempt that is
      // recording its results.
      console.warn(
        `Failed to prune stale perf results in ${siblingName}: ${String(error)}`,
      );
    }
  }
}

/**
 * Appends collected results to a worker-specific JSON file inside the results
 * directory. Using per-worker files avoids write conflicts when Playwright runs
 * tests in parallel. A retried test runs in a fresh worker with a new worker
 * index, so any results an earlier attempt left in another worker file are
 * pruned first; see `removeStaleAttemptResults`.
 */
export function appendResults(results: PerfResult[], testInfo: TestInfo) {
  // Resolved at call time (not module load) so tests can point it at a
  // temporary working directory.
  const resultsDir = path.join(process.cwd(), ".perf-results");
  mkdirSync(resultsDir, { recursive: true });
  const prefix =
    process.env.PERF_RESULTS_FILE?.replace(/\.json$/, "") ?? "current";
  const fileName = `${prefix}-worker${testInfo.workerIndex}.json`;
  const filePath = path.join(resultsDir, fileName);
  removeStaleAttemptResults({ resultsDir, prefix, fileName, results });
  let existing: PerfResult[] = [];
  if (initializedResultFiles.has(filePath) && existsSync(filePath)) {
    existing = JSON.parse(readFileSync(filePath, "utf-8"));
  }
  initializedResultFiles.add(filePath);
  existing.push(...results);
  writeFileSync(filePath, JSON.stringify(existing, null, 2));
}
