import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CDPSession, Page, TestInfo } from "@playwright/test";

const RESULTS_DIR = path.join(process.cwd(), ".perf-results");
const DEFAULT_ITERATIONS = 10;
const DEFAULT_WARMUP = 1;
const DEFAULT_PROFILE_LIMIT = 10;
const SCRIPT_PROFILE_INTERVAL = 100;
const initializedResultFiles = new Set<string>();

// CDP metric names (values are in seconds).
const SCRIPT_DURATION = "ScriptDuration";
const LAYOUT_DURATION = "LayoutDuration";
const RECALC_STYLE_DURATION = "RecalcStyleDuration";
const PAINTING_DURATION = "PaintingDuration";

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
  layout: number;
  styleRecalc: number;
  painting: number;
  rendering: number;
  inp: number;
  total: number;
}

export interface PerfScriptProfileEntry {
  functionName: string;
  url: string;
  line: number;
  column: number;
  selfTime: number;
  totalTime: number;
  hitCount: number;
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

export interface PerfMeasureOptions {
  /** Number of measured iterations (warmup runs are additional). */
  iterations?: number;
  /** Number of discarded warm-up runs before measurement begins. */
  warmup?: number;
  /** Override the auto-generated label for this measurement. */
  label?: string;
  /** Collect the most expensive JS functions during measured iterations. */
  scriptProfile?: boolean;
  /** Collect the most expensive CSS selectors during measured iterations. */
  selectorProfile?: boolean;
  /** Maximum number of profile entries stored per profile type. */
  profileLimit?: number;
}

interface CreatePerfMeasureOptions extends PerfMeasureOptions {
  /** Re-navigate to the current page URL before each measured interaction. */
  resetPage?: boolean;
}

export interface PerfResult {
  testFile: string;
  testTitle: string;
  label: string;
  metrics: PerfMetrics;
  raw: PerfMetrics[];
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

interface CssStyleSheetHeader {
  styleSheetId: string;
  sourceURL?: string;
}

interface CssStyleSheetAddedEvent {
  header: CssStyleSheetHeader;
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
  profileLimit: number;
  styleSheetUrls: Map<string, string>;
}

interface MeasureOnceResult {
  metrics: PerfMetrics;
  profiles?: PerfProfiles;
}

interface MutableSelectorProfileEntry extends PerfSelectorProfileEntry {
  fastRejectCount: number;
}

function getMetricValue(
  metrics: Array<{ name: string; value: number }>,
  name: string,
): number {
  const metric = metrics.find((m) => m.name === name);
  if (!metric) return 0;
  return metric.value;
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

function isTruthyEnv(name: string): boolean {
  return process.env[name] === "true" || process.env[name] === "1";
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
    selfTime: 0,
    totalTime: 0,
    hitCount: 0,
  };
  entries.set(key, entry);
  return entry;
}

function parseScriptProfile(
  profile: CdpProfile,
  limit: number,
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

    let currentNode: CdpProfileNode | undefined = sampleNode;
    while (currentNode) {
      if (shouldIncludeScriptFrame(currentNode.callFrame)) {
        const entry = getScriptProfileEntry(entries, currentNode.callFrame);
        entry.totalTime += timeMs;
      }
      const parentId = parents.get(currentNode.id);
      if (parentId == null) break;
      currentNode = nodes.get(parentId);
    }
  }

  return [...entries.values()]
    .sort((a, b) => b.selfTime - a.selfTime || b.totalTime - a.totalTime)
    .slice(0, limit);
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
  limit: number,
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
    .slice(0, limit)
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
  limit: number,
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
        return parseSelectorTrace(events, styleSheetUrls, limit);
      } finally {
        cdp.off("Tracing.dataCollected", onDataCollected);
        cdp.off("Tracing.tracingComplete", onTracingComplete);
      }
    },
  };
}

function mergeScriptProfiles(
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

function mergeSelectorProfiles(
  profiles: PerfSelectorProfileEntry[][],
  limit: number,
): PerfSelectorProfileEntry[] {
  const entries = new Map<string, PerfSelectorProfileEntry>();

  for (const profile of profiles) {
    for (const item of profile) {
      const key = `${item.styleSheetId}\0${item.selector}`;
      const existingItem = entries.get(key);
      if (existingItem) {
        existingItem.elapsed += item.elapsed;
        existingItem.matchAttempts += item.matchAttempts;
        existingItem.matchCount += item.matchCount;
        existingItem.invalidationCount += item.invalidationCount;
        continue;
      }
      entries.set(key, { ...item });
    }
  }

  for (const item of entries.values()) {
    const originalItems = profiles.flatMap((profile) =>
      profile.filter(
        (entry) =>
          entry.styleSheetId === item.styleSheetId &&
          entry.selector === item.selector,
      ),
    );
    const weightedSlowPathNonMatches = originalItems.reduce((sum, entry) => {
      return sum + entry.matchAttempts * entry.slowPathNonMatchPercent;
    }, 0);
    item.slowPathNonMatchPercent =
      item.matchAttempts > 0
        ? weightedSlowPathNonMatches / item.matchAttempts
        : 0;
  }

  return [...entries.values()]
    .sort((a, b) => b.elapsed - a.elapsed)
    .slice(0, limit);
}

function createProfiles(
  scriptProfiles: PerfScriptProfileEntry[][],
  selectorProfiles: PerfSelectorProfileEntry[][],
  limit: number,
): PerfProfiles | undefined {
  const profiles: PerfProfiles = {};
  if (scriptProfiles.length > 0) {
    profiles.script = mergeScriptProfiles(scriptProfiles, limit);
  }
  if (selectorProfiles.length > 0) {
    profiles.selectors = mergeSelectorProfiles(selectorProfiles, limit);
  }
  if (!profiles.script && !profiles.selectors) return;
  return profiles;
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
    observer.observe({ type: "event", buffered: false });
    w.__perfObserver = observer;
  });

  const before = await cdp.send("Performance.getMetrics");
  const selectorTrace = options.selectorProfile
    ? await startSelectorTrace(
        cdp,
        options.styleSheetUrls,
        options.profileLimit,
      )
    : undefined;

  if (options.scriptProfile) {
    await cdp.send("Profiler.start");
  }

  let interactionError: unknown;

  try {
    await interaction();

    // Let paint and layout settle.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        }),
    );
    await page.waitForTimeout(50);
  } catch (error) {
    interactionError = error;
  }

  const profiles: PerfProfiles = {};

  try {
    if (options.scriptProfile) {
      const response: ProfilerStopResponse = await cdp.send("Profiler.stop");
      profiles.script = parseScriptProfile(
        response.profile,
        options.profileLimit,
      );
    }
  } finally {
    if (selectorTrace) {
      profiles.selectors = await selectorTrace.stop();
    }
  }

  if (interactionError) {
    await page.evaluate(() => {
      const w = window as any;
      if (w.__perfObserver) {
        w.__perfObserver.disconnect();
      }
    });
    throw interactionError;
  }

  const after = await cdp.send("Performance.getMetrics");

  // Collect INP entries and disconnect the observer.
  const inpValues: number[] = await page.evaluate(() => {
    const w = window as any;
    if (w.__perfObserver) {
      w.__perfObserver.disconnect();
    }
    return w.__perfInpEntries ?? [];
  });

  const scriptBefore = getMetricValue(before.metrics, SCRIPT_DURATION);
  const scriptAfter = getMetricValue(after.metrics, SCRIPT_DURATION);
  const layoutBefore = getMetricValue(before.metrics, LAYOUT_DURATION);
  const layoutAfter = getMetricValue(after.metrics, LAYOUT_DURATION);
  const styleBefore = getMetricValue(before.metrics, RECALC_STYLE_DURATION);
  const styleAfter = getMetricValue(after.metrics, RECALC_STYLE_DURATION);
  const paintBefore = getMetricValue(before.metrics, PAINTING_DURATION);
  const paintAfter = getMetricValue(after.metrics, PAINTING_DURATION);

  // CDP values are in seconds; convert to milliseconds.
  const scripting = (scriptAfter - scriptBefore) * 1000;
  const layout = (layoutAfter - layoutBefore) * 1000;
  const styleRecalc = (styleAfter - styleBefore) * 1000;
  const painting = (paintAfter - paintBefore) * 1000;
  const rendering = layout + styleRecalc + painting;
  const inp = inpValues.length > 0 ? Math.max(...inpValues) : 0;
  const total = scripting + rendering;

  const metrics = {
    scripting,
    layout,
    styleRecalc,
    painting,
    rendering,
    inp,
    total,
  };

  return {
    metrics,
    profiles: profiles.script || profiles.selectors ? profiles : undefined,
  };
}

/**
 * Runs the interaction multiple times, discards warm-up runs, and returns the
 * median metrics. By default, each iteration re-navigates to the page URL for
 * a clean state.
 */
export async function createPerfMeasure(
  page: Page,
  interaction: () => Promise<void>,
  results: PerfResult[],
  testInfo: TestInfo,
  options: CreatePerfMeasureOptions = {},
): Promise<PerfMetrics> {
  const {
    iterations = DEFAULT_ITERATIONS,
    warmup = DEFAULT_WARMUP,
    resetPage = true,
    label,
    profileLimit = DEFAULT_PROFILE_LIMIT,
  } = options;
  const scriptProfile =
    options.scriptProfile ?? isTruthyEnv("PERF_SCRIPT_PROFILE");
  const selectorProfile =
    options.selectorProfile ??
    (isTruthyEnv("PERF_SELECTOR_PROFILE") ||
      isTruthyEnv("PERF_CSS_SELECTOR_PROFILE"));

  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new Error(`Invalid perf iterations: ${iterations}`);
  }
  if (!Number.isInteger(warmup) || warmup < 0) {
    throw new Error(`Invalid perf warmup: ${warmup}`);
  }
  if (!Number.isInteger(profileLimit) || profileLimit <= 0) {
    throw new Error(`Invalid perf profile limit: ${profileLimit}`);
  }

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");

  const allMetrics: PerfMetrics[] = [];
  const scriptProfiles: PerfScriptProfileEntry[][] = [];
  const selectorProfiles: PerfSelectorProfileEntry[][] = [];
  const styleSheetUrls = new Map<string, string>();
  const onStyleSheetAdded = (event: CssStyleSheetAddedEvent) => {
    const { styleSheetId, sourceURL = "" } = event.header;
    styleSheetUrls.set(styleSheetId, sourceURL);
  };

  try {
    if (scriptProfile) {
      await cdp.send("Profiler.enable");
      await cdp.send("Profiler.setSamplingInterval", {
        interval: SCRIPT_PROFILE_INTERVAL,
      });
    }
    if (selectorProfile) {
      cdp.on("CSS.styleSheetAdded", onStyleSheetAdded);
      await cdp.send("DOM.enable");
      await cdp.send("CSS.enable");
    }

    const url = page.url();

    for (let i = 0; i < warmup + iterations; i++) {
      if (resetPage) {
        // Re-navigate for a clean state on every iteration.
        await page.goto(url, { waitUntil: "networkidle" });
      }

      const result = await measureOnce(page, cdp, interaction, {
        scriptProfile,
        selectorProfile,
        profileLimit,
        styleSheetUrls,
      });

      // Only keep measured (non-warmup) iterations.
      if (i >= warmup) {
        allMetrics.push(result.metrics);
        if (result.profiles?.script) {
          scriptProfiles.push(result.profiles.script);
        }
        if (result.profiles?.selectors) {
          selectorProfiles.push(result.profiles.selectors);
        }
      }
    }
  } finally {
    cdp.off("CSS.styleSheetAdded", onStyleSheetAdded);
    await cdp.send("Profiler.disable").catch(() => {});
    await cdp.send("CSS.disable").catch(() => {});
    await cdp.send("DOM.disable").catch(() => {});
    await cdp.send("Performance.disable").catch(() => {});
    await cdp.detach().catch(() => {});
  }

  const medianMetrics = computeMedianMetrics(allMetrics);

  const testTitle = testInfo.titlePath.filter(Boolean).join(" > ");
  const baseLabel = label ?? testTitle;
  const duplicateCount = results.filter(
    (r) => r.label === baseLabel || r.label.startsWith(`${baseLabel} #`),
  ).length;
  const resolvedLabel =
    duplicateCount === 0 ? baseLabel : `${baseLabel} #${duplicateCount + 1}`;

  results.push({
    testFile: path.relative(process.cwd(), testInfo.file),
    testTitle,
    label: resolvedLabel,
    metrics: medianMetrics,
    raw: allMetrics,
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
    async () => {
      await page.goto(url, { waitUntil: "networkidle" });
    },
    results,
    testInfo,
    {
      ...options,
      resetPage: false,
    },
  );
}

/**
 * Appends collected results to a worker-specific JSON file inside the results
 * directory. Using per-worker files avoids write conflicts when Playwright runs
 * tests in parallel.
 */
export function appendResults(results: PerfResult[], testInfo: TestInfo) {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const prefix =
    process.env.PERF_RESULTS_FILE?.replace(/\.json$/, "") ?? "current";
  const fileName = `${prefix}-worker${testInfo.workerIndex}.json`;
  const filePath = path.join(RESULTS_DIR, fileName);
  let existing: PerfResult[] = [];
  if (initializedResultFiles.has(filePath) && existsSync(filePath)) {
    existing = JSON.parse(readFileSync(filePath, "utf-8"));
  }
  initializedResultFiles.add(filePath);
  existing.push(...results);
  writeFileSync(filePath, JSON.stringify(existing, null, 2));
}
