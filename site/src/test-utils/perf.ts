import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CDPSession, Page, TestInfo } from "@playwright/test";

const RESULTS_DIR = path.join(process.cwd(), ".perf-results");
const DEFAULT_ITERATIONS = 10;
const DEFAULT_WARMUP = 1;

// CDP metric names (values are in seconds).
const SCRIPT_DURATION = "ScriptDuration";
const LAYOUT_DURATION = "LayoutDuration";
const RECALC_STYLE_DURATION = "RecalcStyleDuration";
const PAINTING_DURATION = "PaintingDuration";

export interface PerfMetrics {
  scripting: number;
  layout: number;
  styleRecalc: number;
  painting: number;
  rendering: number;
  inp: number;
  total: number;
}

export interface PerfMeasureOptions {
  /** Number of measured iterations (warmup runs are additional). */
  iterations?: number;
  /** Number of discarded warm-up runs before measurement begins. */
  warmup?: number;
  /** Override the auto-generated label for this measurement. */
  label?: string;
}

export interface PerfResult {
  testFile: string;
  testTitle: string;
  label: string;
  metrics: PerfMetrics;
  raw: PerfMetrics[];
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

/**
 * Runs a single interaction measurement cycle: snapshot CDP metrics before and
 * after the interaction, collect INP entries, and return the deltas.
 */
async function measureOnce(
  page: Page,
  cdp: CDPSession,
  interaction: () => Promise<void>,
): Promise<PerfMetrics> {
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

  return { scripting, layout, styleRecalc, painting, rendering, inp, total };
}

/**
 * Runs the interaction multiple times, discards warm-up runs, and returns the
 * median metrics. Each iteration re-navigates to the page URL for a clean
 * state.
 */
export async function createPerfMeasure(
  page: Page,
  interaction: () => Promise<void>,
  results: PerfResult[],
  testInfo: TestInfo,
  options: PerfMeasureOptions = {},
): Promise<PerfMetrics> {
  const {
    iterations = DEFAULT_ITERATIONS,
    warmup = DEFAULT_WARMUP,
    label,
  } = options;

  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new Error(`Invalid perf iterations: ${iterations}`);
  }
  if (!Number.isInteger(warmup) || warmup < 0) {
    throw new Error(`Invalid perf warmup: ${warmup}`);
  }

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");

  const allMetrics: PerfMetrics[] = [];

  try {
    const url = page.url();

    for (let i = 0; i < warmup + iterations; i++) {
      // Re-navigate for a clean state on every iteration.
      await page.goto(url, { waitUntil: "networkidle" });

      const metrics = await measureOnce(page, cdp, interaction);

      // Only keep measured (non-warmup) iterations.
      if (i >= warmup) {
        allMetrics.push(metrics);
      }
    }
  } finally {
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
  });

  return medianMetrics;
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
  if (existsSync(filePath)) {
    existing = JSON.parse(readFileSync(filePath, "utf-8"));
  }
  existing.push(...results);
  writeFileSync(filePath, JSON.stringify(existing, null, 2));
}
