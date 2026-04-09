import type { CDPSession, TestInfo } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface ChromeMetrics {
  layoutCount: number;
  layoutDurationMs: number;
  recalcStyleCount: number;
  recalcStyleDurationMs: number;
  scriptDurationMs: number;
  taskDurationMs: number;
}

interface PerfSample {
  layoutCount: number;
  layoutDurationMs: number;
  recalcStyleCount: number;
  recalcStyleDurationMs: number;
  scriptDurationMs: number;
  taskDurationMs: number;
  wallTimeMs: number;
}

interface PerfSummary {
  framework: string;
  iterations: number;
  replicas: number;
  sampleCount: number;
  totalSectionCount: number;
  targetSectionCount: number;
  median: PerfSample;
  samples: PerfSample[];
}

interface PerfSetupResult {
  totalSectionCount: number;
  targetSectionCount: number;
}

interface PerfBenchmarkResult {
  checksum: number;
  wallTimeMs: number;
}

interface PerfBudget {
  layoutDurationMs?: number;
  recalcStyleDurationMs?: number;
}

const DEFAULT_ITERATIONS = 24;
const DEFAULT_REPLICAS = 1;
const DEFAULT_SAMPLE_COUNT = 3;
const DEFAULT_WARMUP_ITERATIONS = 8;
const DEFAULT_TARGET_COUNT = 48;

function getOptionalNumberEnv(name: string) {
  const value = process.env[name];
  if (value == null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  throw new Error(`${name} must be a finite number`);
}

function getNumberEnv(name: string, fallback: number) {
  return getOptionalNumberEnv(name) ?? fallback;
}

function getIntegerEnv(name: string, fallback: number) {
  const value = getNumberEnv(name, fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function getTargetCountEnv(name: string, fallback: number) {
  const value = getIntegerEnv(name, fallback);
  if (value <= 1) {
    throw new Error(`${name} must be greater than 1`);
  }
  return value;
}

function getBudget(): PerfBudget {
  return {
    layoutDurationMs: getOptionalNumberEnv("TAILWIND_LAYOUT_BUDGET_MS"),
    recalcStyleDurationMs: getOptionalNumberEnv("TAILWIND_STYLE_BUDGET_MS"),
  };
}

function toMs(seconds: number) {
  return Math.round(seconds * 1000 * 100) / 100;
}

function getMetric(metrics: { name: string; value: number }[], name: string) {
  const metric = metrics.find((item) => item.name === name);
  return metric?.value ?? 0;
}

async function readChromeMetrics(cdp: CDPSession): Promise<ChromeMetrics> {
  const response = await cdp.send("Performance.getMetrics");
  return {
    layoutCount: getMetric(response.metrics, "LayoutCount"),
    layoutDurationMs: toMs(getMetric(response.metrics, "LayoutDuration")),
    recalcStyleCount: getMetric(response.metrics, "RecalcStyleCount"),
    recalcStyleDurationMs: toMs(
      getMetric(response.metrics, "RecalcStyleDuration"),
    ),
    scriptDurationMs: toMs(getMetric(response.metrics, "ScriptDuration")),
    taskDurationMs: toMs(getMetric(response.metrics, "TaskDuration")),
  };
}

function diffChromeMetrics(
  before: ChromeMetrics,
  after: ChromeMetrics,
  benchmark: PerfBenchmarkResult,
): PerfSample {
  return {
    layoutCount: after.layoutCount - before.layoutCount,
    layoutDurationMs: after.layoutDurationMs - before.layoutDurationMs,
    recalcStyleCount: after.recalcStyleCount - before.recalcStyleCount,
    recalcStyleDurationMs:
      after.recalcStyleDurationMs - before.recalcStyleDurationMs,
    scriptDurationMs: after.scriptDurationMs - before.scriptDurationMs,
    taskDurationMs: after.taskDurationMs - before.taskDurationMs,
    wallTimeMs: benchmark.wallTimeMs,
  };
}

function getMedian(values: number[]) {
  if (!values.length) {
    throw new Error("Expected at least one value");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted[middle] ?? 0;
}

function summarizeSamples(samples: PerfSample[]): PerfSample {
  if (!samples.length) {
    throw new Error("Expected at least one sample");
  }
  return {
    layoutCount: getMedian(samples.map((sample) => sample.layoutCount)),
    layoutDurationMs: getMedian(
      samples.map((sample) => sample.layoutDurationMs),
    ),
    recalcStyleCount: getMedian(
      samples.map((sample) => sample.recalcStyleCount),
    ),
    recalcStyleDurationMs: getMedian(
      samples.map((sample) => sample.recalcStyleDurationMs),
    ),
    scriptDurationMs: getMedian(
      samples.map((sample) => sample.scriptDurationMs),
    ),
    taskDurationMs: getMedian(samples.map((sample) => sample.taskDurationMs)),
    wallTimeMs: getMedian(samples.map((sample) => sample.wallTimeMs)),
  };
}

async function attachPerfSummary(testInfo: TestInfo, summary: PerfSummary) {
  await testInfo.attach("ariakit-tailwind-perf.json", {
    body: Buffer.from(JSON.stringify(summary, null, 2)),
    contentType: "application/json",
  });
}

function assertPerfBudget(summary: PerfSummary, budget: PerfBudget) {
  if (budget.layoutDurationMs != null) {
    expect(summary.median.layoutDurationMs).toBeLessThan(
      budget.layoutDurationMs,
    );
  }
  if (budget.recalcStyleDurationMs != null) {
    expect(summary.median.recalcStyleDurationMs).toBeLessThan(
      budget.recalcStyleDurationMs,
    );
  }
}

withFramework(import.meta.dirname, async ({ framework, test }) => {
  test("performance metrics", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const iterations = getIntegerEnv(
      "TAILWIND_PERF_ITERATIONS",
      DEFAULT_ITERATIONS,
    );
    const replicas = getIntegerEnv("TAILWIND_PERF_REPLICAS", DEFAULT_REPLICAS);
    const sampleCount = getIntegerEnv(
      "TAILWIND_PERF_SAMPLE_COUNT",
      DEFAULT_SAMPLE_COUNT,
    );
    const warmupIterations = getIntegerEnv(
      "TAILWIND_PERF_WARMUP_ITERATIONS",
      DEFAULT_WARMUP_ITERATIONS,
    );
    const targetCount = getTargetCountEnv(
      "TAILWIND_PERF_TARGET_COUNT",
      DEFAULT_TARGET_COUNT,
    );
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Performance.enable");

    const setup = await page.evaluate(
      ({
        replicas,
        targetCount,
      }: {
        replicas: number;
        targetCount: number;
      }): PerfSetupResult => {
        const root = document.body.firstElementChild;
        if (!(root instanceof HTMLElement)) {
          throw new Error("Could not find sandbox root element");
        }
        const getTargetSections = (
          sections: HTMLElement[],
          maxCount: number,
        ): HTMLElement[] => {
          if (sections.length <= maxCount) {
            return sections;
          }
          const result: HTMLElement[] = [];
          for (let i = 0; i < maxCount; i += 1) {
            const ratio = i / (maxCount - 1);
            const index = Math.round(ratio * (sections.length - 1));
            const section = sections[index];
            if (!section || result.includes(section)) {
              continue;
            }
            result.push(section);
          }
          return result;
        };
        const host = document.createElement("div");
        host.id = "ariakit-tailwind-perf-root";
        host.style.display = "grid";
        host.style.gap = "16px";
        const template = root.cloneNode(true);
        for (let i = 0; i < replicas; i += 1) {
          host.append(template.cloneNode(true));
        }
        root.replaceWith(host);
        const style = document.createElement("style");
        style.textContent = `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.append(style);
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>("section[aria-labelledby]"),
        );
        const targets = getTargetSections(sections, targetCount);
        for (const target of targets) {
          target.dataset.akPerfTarget = "true";
        }
        return {
          totalSectionCount: sections.length,
          targetSectionCount: targets.length,
        };
      },
      { replicas, targetCount },
    );

    const runBenchmark = async (iterations: number) => {
      return page.evaluate(
        ({ iterations }): PerfBenchmarkResult => {
          const sections = Array.from(
            document.querySelectorAll<HTMLElement>("[data-ak-perf-target]"),
          );
          if (!sections.length) {
            throw new Error("Could not find sandbox perf targets to benchmark");
          }
          const host = document.getElementById("ariakit-tailwind-perf-root");
          if (!(host instanceof HTMLElement)) {
            throw new Error("Could not find sandbox perf host");
          }
          let checksum = 0;
          const start = performance.now();
          for (let i = 0; i < iterations; i += 1) {
            const phase = i % 2 === 0;
            for (const section of sections) {
              section.classList.toggle("ak-frame-p-0", !phase);
              section.classList.toggle("ak-frame-p-4", phase);
              section.classList.toggle("ak-frame-cover", !phase);
              section.classList.toggle("ak-frame-overflow", phase);
              section.classList.toggle("ak-layer-20", !phase);
              section.classList.toggle("ak-layer-80", phase);
              section.classList.toggle("ak-layer-contrast-20", !phase);
              section.classList.toggle("ak-layer-contrast-80", phase);
            }
            checksum += host.offsetHeight + host.offsetWidth;
          }
          return {
            checksum,
            wallTimeMs: performance.now() - start,
          };
        },
        { iterations },
      );
    };

    await runBenchmark(warmupIterations);

    const samples: PerfSample[] = [];
    for (let i = 0; i < sampleCount; i += 1) {
      const before = await readChromeMetrics(cdp);
      const benchmark = await runBenchmark(iterations);
      const after = await readChromeMetrics(cdp);
      expect(benchmark.checksum).toBeGreaterThan(0);
      samples.push(diffChromeMetrics(before, after, benchmark));
    }

    await cdp.send("Performance.disable");

    const summary: PerfSummary = {
      framework,
      iterations,
      replicas,
      sampleCount,
      totalSectionCount: setup.totalSectionCount,
      targetSectionCount: setup.targetSectionCount,
      median: summarizeSamples(samples),
      samples,
    };

    await attachPerfSummary(testInfo, summary);
    expect(summary.totalSectionCount).toBeGreaterThan(0);
    expect(summary.targetSectionCount).toBeGreaterThan(0);
    assertPerfBudget(summary, getBudget());
  });
});
