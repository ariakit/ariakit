import { query } from "@ariakit/test/playwright";
import { invariant } from "@ariakit/utils";
import type { Page } from "@playwright/test";
import { gotoAndHydrate, withFramework } from "#app/test-utils/preview.ts";
import { largestStyleRecalculation } from "#app/test-utils/style.ts";

interface SidebarToggleRestyles {
  closing: number;
  opening: number;
  limit: number;
}

interface PreviewHelpers {
  page: Page;
  q: ReturnType<typeof query>;
}

// A Chromium bug makes some renderer processes restyle the whole content on
// every sidebar toggle, and a reload keeps the process. An Ariakit regression
// shows in every process, so a test measures again in a new context first.
// TODO: Measure only once when the Chromium bug is fixed.
// https://github.com/ariakit/ariakit/issues/8350
// https://github.com/ariakit/ariakit/issues/8084
// https://issues.chromium.org/issues/577199085
const PAGE_LOADS = 3;

function isCached({ closing, opening, limit }: SidebarToggleRestyles) {
  return closing < limit && opening < limit;
}

/**
 * Runs `measure` on the test page, then on up to `PAGE_LOADS - 1` previews in
 * new browser contexts while the result exceeds its limit. Returns the first
 * result below its limit, or the last result.
 */
async function measureOnPageLoads(
  page: Page,
  measure: (helpers: PreviewHelpers) => Promise<SidebarToggleRestyles>,
) {
  const browser = page.context().browser();
  invariant(browser, "The test page must belong to a browser");
  let restyles = await measure({ page, q: query(page) });
  for (let load = 1; load < PAGE_LOADS; load++) {
    if (isCached(restyles)) break;
    // Inside a test, Playwright applies the project and test.use() context
    // options to every new context, so it matches the test page.
    await using context = await browser.newContext();
    const freshPage = await context.newPage();
    await gotoAndHydrate(freshPage, page.url());
    restyles = await measure({ page: freshPage, q: query(freshPage) });
  }
  return restyles;
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8026
  test("keeps main content styles cached when a sidebar closes and opens", async ({
    page,
  }) => {
    const { closing, opening, limit } = await measureOnPageLoads(
      page,
      async ({ page, q }) => {
        const toggle = q.button("Toggle sidebar");
        const sidebar = q.navigation("Documentation");
        const limit = await q.main().locator("*").count();
        const closing = await largestStyleRecalculation(page, () =>
          toggle.click(),
        );
        await test.expect(sidebar).toBeHidden();
        const opening = await largestStyleRecalculation(page, () =>
          toggle.click(),
        );
        await test.expect(sidebar).toBeVisible();
        return { closing, opening, limit };
      },
    );
    test.expect(closing).toBeLessThan(limit);
    test.expect(opening).toBeLessThan(limit);
  });

  test("keeps content area styles cached when a sidebar closes and opens", async ({
    page,
  }) => {
    const { closing, opening, limit } = await measureOnPageLoads(
      page,
      async ({ page, q }) => {
        const toggle = q.checkbox("Start sidebar");
        const sidebar = q.navigation("Start sidebar");
        const readCustomProperties = (name: string) =>
          q
            .group(name)
            .locator("> div")
            .evaluate((element) => {
              const entries: Array<[string, string]> = [];
              for (const [property, values] of element.computedStyleMap()) {
                if (!property.startsWith("--")) continue;
                entries.push([property, Array.from(values, String).join(" ")]);
              }
              return Object.fromEntries(entries);
            });
        await q.combobox("Scenario").selectOption("areas");
        // Below either area's count. The trace can miss a value that only
        // inherits into a bar, so the checks below compare the values
        // themselves.
        const limit = Math.min(
          await page.locator('[aria-label="Header area"] *').count(),
          await page.locator('[aria-label="Main header area"] *').count(),
        );
        const headerValues = await readCustomProperties("Header area");
        const mainHeaderValues = await readCustomProperties("Main header area");
        const closing = await largestStyleRecalculation(page, () =>
          toggle.uncheck(),
        );
        await test.expect(sidebar).toBeHidden();
        test
          .expect(await readCustomProperties("Header area"))
          .toEqual(headerValues);
        test
          .expect(await readCustomProperties("Main header area"))
          .toEqual(mainHeaderValues);
        const opening = await largestStyleRecalculation(page, () =>
          toggle.check(),
        );
        await test.expect(sidebar).toBeVisible();
        return { closing, opening, limit };
      },
    );
    test.expect(closing).toBeLessThan(limit);
    test.expect(opening).toBeLessThan(limit);
  });

  test("keeps the header area styles cached when a sidebar in the page box closes and opens", async ({
    page,
  }) => {
    const { closing, opening, limit } = await measureOnPageLoads(
      page,
      async ({ page, q }) => {
        await page.setViewportSize({ width: 1600, height: 900 });
        const toggle = q.checkbox("Start sidebar");
        const sidebar = q.navigation("Start sidebar");
        const readCustomProperties = () =>
          q.group("Area center").evaluate((element) => {
            const entries: Array<[string, string]> = [];
            for (const [property, values] of element.computedStyleMap()) {
              if (!property.startsWith("--")) continue;
              entries.push([property, Array.from(values, String).join(" ")]);
            }
            return Object.fromEntries(entries);
          });
        await q.combobox("Scenario").selectOption("page");
        const limit = await q.group("Header area").locator("*").count();
        const values = await readCustomProperties();
        const closing = await largestStyleRecalculation(page, () =>
          toggle.uncheck(),
        );
        await test.expect(sidebar).toBeHidden();
        test.expect(await readCustomProperties()).toEqual(values);
        const opening = await largestStyleRecalculation(page, () =>
          toggle.check(),
        );
        await test.expect(sidebar).toBeVisible();
        return { closing, opening, limit };
      },
    );
    test.expect(closing).toBeLessThan(limit);
    test.expect(opening).toBeLessThan(limit);
  });
});
