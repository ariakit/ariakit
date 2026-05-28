import {
  appendResults,
  createPerfMeasure,
  createPerfPageLoadMeasure,
} from "@ariakit/scripts/perf";
import type {
  PerfMeasureOptions,
  PerfMetrics,
  PerfResult,
} from "@ariakit/scripts/perf";
import { query } from "@ariakit/test/playwright";
import { test as base } from "@playwright/test";
import { visual } from "./visual.ts";
import type { ScreenshotOptions } from "./visual.ts";

export const test = base.extend<{
  visual: (options?: ScreenshotOptions) => Promise<void>;
  perf: {
    measure: (
      interaction: () => Promise<void>,
      options?: PerfMeasureOptions,
    ) => Promise<PerfMetrics>;
    measurePageLoad: (options?: PerfMeasureOptions) => Promise<PerfMetrics>;
  };
  q: ReturnType<typeof query>;
}>({
  visual: async ({ page }, use, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await use((options) => visual(page, options, testInfo));
  },

  // Lazy fixture: no CDP session is opened until measure() is called, so
  // existing visual tests pay zero overhead.
  perf: async ({ page }, use, testInfo) => {
    const results: PerfResult[] = [];
    await use({
      measure: (interaction, options) =>
        createPerfMeasure(page, interaction, results, testInfo, options),
      measurePageLoad: (options) =>
        createPerfPageLoadMeasure(page, results, testInfo, options),
    });
    if (results.length > 0) {
      appendResults(results, testInfo);
    }
  },

  q: async ({ page }, use) => {
    await use(query(page));
  },
});
