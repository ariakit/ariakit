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
import type { Page } from "@playwright/test";
import { visual } from "./visual.ts";
import type { ScreenshotOptions } from "./visual.ts";

export interface PerfHelpers {
  page: Page;
  q: ReturnType<typeof query>;
}

/**
 * Callback invoked with the iteration's page and a query bound to it. Each
 * perf iteration runs in a fresh browser context, so callbacks must use the
 * helpers they receive instead of closing over the test's fixture `page` or
 * `q`.
 */
export type PerfCallback = (helpers: PerfHelpers) => Promise<void> | void;

export interface PerfOptions extends Omit<
  PerfMeasureOptions,
  "setup" | "verify"
> {
  setup?: PerfCallback;
  verify?: PerfCallback;
}

function toPageCallback(callback: PerfCallback) {
  // A zero-argument callback cannot be using the iteration helpers, so it is
  // almost certainly closing over the test's fixture `page` or `q` and would
  // drive a page other than the one being measured.
  if (callback.length === 0) {
    throw new Error(
      "Perf callbacks must accept the iteration helpers, such as ({ q }) => q.button().click()",
    );
  }
  return (page: Page) => callback({ page, q: query(page) });
}

function toPerfMeasureOptions(options: PerfOptions = {}): PerfMeasureOptions {
  const { setup, verify, ...rest } = options;
  return {
    ...rest,
    setup: setup && toPageCallback(setup),
    verify: verify && toPageCallback(verify),
  };
}

export const test = base.extend<{
  visual: (options?: ScreenshotOptions) => Promise<void>;
  perf: {
    measure: (
      interaction: PerfCallback,
      options?: PerfOptions,
    ) => Promise<PerfMetrics>;
    measurePageLoad: (options?: PerfOptions) => Promise<PerfMetrics>;
  };
  q: ReturnType<typeof query>;
}>({
  visual: async ({ page }, use, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await use((options) => visual(page, options, testInfo));
  },

  // Lazy fixture: no browser contexts or CDP sessions are created until
  // measure() is called, so existing visual tests pay zero overhead.
  perf: async ({ page }, use, testInfo) => {
    const results: PerfResult[] = [];
    await use({
      measure: (interaction, options) =>
        createPerfMeasure(
          page,
          toPageCallback(interaction),
          results,
          testInfo,
          toPerfMeasureOptions(options),
        ),
      measurePageLoad: (options) =>
        createPerfPageLoadMeasure(
          page,
          results,
          testInfo,
          toPerfMeasureOptions(options),
        ),
    });
    if (results.length > 0) {
      appendResults(results, testInfo);
    }
  },

  q: async ({ page }, use) => {
    await use(query(page));
  },
});
