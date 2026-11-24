import { query } from "@ariakit/test/playwright";
import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { gotoAndHydrate, withFramework } from "#app/test-utils/preview.ts";
import { largestStyleRecalculation } from "#app/test-utils/style.ts";
import { getPanel, getSidebar } from "./test-helpers.ts";

interface SidebarToggleRestyles {
  closing: number;
  opening: number;
  limit: number;
}

interface ArrivalOptions {
  /** The first element that is missing, the part or an earlier sibling. */
  firstMissing?: Locator;
  /** Runs while the part is missing, after the browser resolves styles. */
  whileMissing?: () => Promise<void>;
}

interface PreviewHelpers {
  page: Page;
  q: ReturnType<typeof query>;
}

function isCached({ closing, opening, limit }: SidebarToggleRestyles) {
  return closing < limit && opening < limit;
}

/** Returns the custom properties that the element of a locator computes. */
function readCustomProperties(locator: Locator) {
  return locator.evaluate((element) => {
    const entries: Array<[string, string]> = [];
    for (const [property, values] of element.computedStyleMap()) {
      if (!property.startsWith("--")) continue;
      entries.push([property, Array.from(values, String).join(" ")]);
    }
    return Object.fromEntries(entries);
  });
}

/**
 * Returns the custom property names in the stylesheets and inline styles of the
 * page. Runs in the browser.
 */
function readCustomPropertyNames() {
  const texts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      texts.push(rule.cssText);
    }
  }
  for (const element of Array.from(document.querySelectorAll("[style]"))) {
    if (!(element instanceof HTMLElement)) continue;
    texts.push(element.style.cssText);
  }
  const names = new Set<string>();
  for (const text of texts) {
    for (const [name] of text.matchAll(/--[\w-]+/g)) {
      names.add(name);
    }
  }
  return Array.from(names);
}

/**
 * Creates the custom property names before the page loads its stylesheets. Runs
 * in the browser as an init script.
 */
function createCustomPropertyNames(names: string[]) {
  const style = document.createElement("div").style;
  for (const name of names) {
    style.setProperty(name, "0");
  }
  // Keeps the names in memory for the life of the page.
  Object.assign(window, { customPropertyNames: style });
}

// TODO: Measure only once when the Chromium bug is fixed. The bug restyles the
// whole content on some page loads, depending on where custom property names
// land in memory. An Ariakit regression shows on every load, so a test measures
// again in a new renderer process (a reload keeps the process) that creates
// every name before the stylesheets load. Which creation order avoids the bug
// depends on the stylesheet, so each new process tries another order.
// https://github.com/ariakit/ariakit/issues/8350
// https://github.com/ariakit/ariakit/issues/8084
// https://issues.chromium.org/issues/577199085
async function measureOnPageLoads(
  page: Page,
  measure: (helpers: PreviewHelpers) => Promise<SidebarToggleRestyles>,
) {
  let restyles = await measure({ page, q: query(page) });
  if (isCached(restyles)) return restyles;
  const browser = page.context().browser();
  invariant(browser, "The test page must belong to a browser");
  const names = await page.evaluate(readCustomPropertyNames);
  const orders = [names, [...names].reverse(), [...names].sort()];
  for (const order of orders) {
    // Inside a test, Playwright applies the project and test.use() context
    // options to every new context, so it matches the test page.
    await using context = await browser.newContext();
    await context.addInitScript(createCustomPropertyNames, order);
    const freshPage = await context.newPage();
    await gotoAndHydrate(freshPage, page.url());
    // Awaits before `context` is disposed at the end of the iteration.
    restyles = await measure({ page: freshPage, q: query(freshPage) });
    if (isCached(restyles)) return restyles;
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
        const readAreaValues = (name: string) =>
          readCustomProperties(q.group(name).locator("> div"));
        await q.combobox("Scenario").selectOption("areas");
        // Below either area's count. The trace can miss a value that only
        // inherits into a bar, so the checks below compare the values
        // themselves.
        const limit = Math.min(
          await page.locator('[aria-label="Header area"] *').count(),
          await page.locator('[aria-label="Main header area"] *').count(),
        );
        const headerValues = await readAreaValues("Header area");
        const mainHeaderValues = await readAreaValues("Main header area");
        const closing = await largestStyleRecalculation(page, () =>
          toggle.uncheck(),
        );
        await test.expect(sidebar).toBeHidden();
        test.expect(await readAreaValues("Header area")).toEqual(headerValues);
        test
          .expect(await readAreaValues("Main header area"))
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

  for (const direct of [false, true]) {
    const place = direct ? "directly inside the outer shell" : "in a panel";
    test(`keeps the chat styles cached when a window sidebar closes and opens with the chat ${place}`, async ({
      page,
    }) => {
      const { closing, opening, limit } = await measureOnPageLoads(
        page,
        async ({ page, q }) => {
          await q.combobox("Scenario").selectOption("center");
          if (direct) {
            await q.checkbox("Directly inside").check();
          }
          const toggle = q.checkbox("Start sidebar");
          const sidebar = q.navigation("Start sidebar");
          // The chat follows the window sidebars, so its shell and parts
          // restyle, but not the messages.
          const limit = await q.group("Conversation").locator("*").count();
          const closing = await largestStyleRecalculation(page, () =>
            toggle.uncheck(),
          );
          await test.expect(sidebar).toBeHidden();
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
  }

  test("keeps the note styles cached when a window sidebar closes and opens with the body in a panel", async ({
    page,
  }) => {
    const { closing, opening, limit } = await measureOnPageLoads(
      page,
      async ({ page, q }) => {
        await q.combobox("Scenario").selectOption("reveal");
        // The end sidebar has few links, so its own restyles stay below the
        // limit.
        const toggle = q.checkbox("End sidebar");
        const sidebar = q.complementary("End sidebar");
        // The body follows the window sidebars, so it restyles, but not the
        // note.
        const limit = await q.group("Note").locator("*").count();
        const closing = await largestStyleRecalculation(page, () =>
          toggle.uncheck(),
        );
        await test.expect(sidebar).toBeHidden();
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

  test("keeps the sidebar link styles cached while a zoom sidebar opens", async ({
    page,
  }) => {
    const { opening, limit } = await measureOnPageLoads(
      page,
      async ({ page, q }) => {
        await q.combobox("Scenario").selectOption("reveal");
        const toggle = q.checkbox("Start sidebar");
        const panel = q.navigation("Start sidebar", { includeHidden: true });
        const getOpacity = () =>
          panel.evaluate((element) => getComputedStyle(element).opacity);
        // The panel fades on each frame of the fold, but the links don't
        // restyle.
        const limit = await panel.locator("*").count();
        // The action waits for the end of the fold, so the trace has every
        // frame of it. A sidebar that closes restyles its links once, also
        // without `$reveal`, so only the opening is measured.
        const opening = await largestStyleRecalculation(page, async () => {
          await toggle.check();
          await test.expect.poll(getOpacity).toBe("1");
        });
        return { closing: 0, opening, limit };
      },
    );
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
        const readCenterValues = () =>
          readCustomProperties(q.group("Area center"));
        await q.combobox("Scenario").selectOption("page");
        const limit = await q.group("Header area").locator("*").count();
        const values = await readCenterValues();
        const closing = await largestStyleRecalculation(page, () =>
          toggle.uncheck(),
        );
        await test.expect(sidebar).toBeHidden();
        test.expect(await readCenterValues()).toEqual(values);
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

  // While HTML streams in, the browser can resolve styles before the parser
  // adds a part. This removes the part and the elements after it, resolves
  // styles, and adds the part back last, as the parser does. The first missing
  // element can come before the part when the part comes later in the source.
  const measureArrival = async (
    page: Page,
    part: Locator,
    { firstMissing = part, whileMissing }: ArrivalOptions = {},
  ) => {
    await using arriving = await part.elementHandle();
    await using missing = await firstMissing.elementHandle();
    await using parent = await missing.evaluateHandle(
      (element) => element.parentElement,
    );
    await missing.evaluate((element) => {
      while (element.nextSibling) {
        element.nextSibling.remove();
      }
      element.remove();
    });
    // Resolving styles keeps the removal out of the trace.
    await parent.evaluate(
      (element) => element && getComputedStyle(element).width,
    );
    await test.expect(part).toHaveCount(0);
    await whileMissing?.();
    const restyles = await largestStyleRecalculation(page, () =>
      parent.evaluate((element, child) => element?.append(child), arriving),
    );
    await test.expect(part).toHaveCount(1);
    return restyles;
  };

  test("keeps main content styles cached when the footer arrives after the content", async ({
    page,
  }) => {
    const { opening: arriving, limit } = await measureOnPageLoads(
      page,
      async ({ page, q }) => {
        const limit = await q.main().locator("*").count();
        const arriving = await measureArrival(page, q.contentinfo());
        await test.expect(q.contentinfo()).toBeVisible();
        return { closing: 0, opening: arriving, limit };
      },
    );
    test.expect(arriving).toBeLessThan(limit);
  });

  const sidebarArrivals = [
    { name: "Documentation", kind: "a start sidebar", width: 1280 },
    // Below its show range, the sidebar publishes that it doesn't fit.
    {
      name: "Documentation",
      kind: "a start sidebar off its range",
      width: 600,
    },
    // Like the table of contents of the site, which comes before main. In the
    // sandbox, it comes after main, so main and the later parts are missing
    // when it arrives.
    {
      name: "On this page",
      kind: "an end sidebar",
      width: 1280,
      afterMain: true,
    },
  ];

  for (const { name, kind, width, afterMain } of sidebarArrivals) {
    test(`keeps the header styles cached when ${kind} arrives before main at ${width}px`, async ({
      page,
    }) => {
      const { opening: arriving, limit } = await measureOnPageLoads(
        page,
        async ({ page, q }) => {
          await page.setViewportSize({ width, height: 800 });
          const limit = await q.banner().locator("*").count();
          const firstMissing = afterMain ? q.main() : undefined;
          const arriving = await measureArrival(page, getSidebar(q, name), {
            firstMissing,
          });
          return { closing: 0, opening: arriving, limit };
        },
      );
      test.expect(arriving).toBeLessThan(limit);
    });
  }

  // `5xl` and `max-5xl` set each end of the show range, and `never` hides the
  // header at every width.
  const mainHeaderVisibilities = [
    { visibility: "5xl", kind: "that shows from 5xl" },
    { visibility: "max-5xl", kind: "that shows below 5xl" },
    { visibility: "never", kind: "that never shows" },
  ];

  for (const { visibility, kind } of mainHeaderVisibilities) {
    test(`keeps the sidebar styles cached when a static main header ${kind} arrives`, async ({
      page,
    }) => {
      const { opening: arriving, limit } = await measureOnPageLoads(
        page,
        async ({ page, q }) => {
          await q.combobox("Scenario").selectOption("parts");
          await q.checkbox("Sticky main header").uncheck();
          // Sets `$p` on the main header. The fixture always sets `$border`.
          await q.checkbox("Compact local headers").check();
          await q.combobox("Main header visibility").selectOption(visibility);
          const panel = getPanel(q, "Part navigation");
          const header = q.main().locator(":scope > .ui-shell-main-header");
          const limit = await panel.locator("*").count();
          let values: Record<string, string> = {};
          const arriving = await measureArrival(page, header, {
            whileMissing: async () => {
              values = await readCustomProperties(panel);
            },
          });
          // A static main header publishes nothing on the shell, so an earlier
          // part keeps its values. The values also cover elements that the
          // browser doesn't style, which the trace misses.
          test.expect(await readCustomProperties(panel)).toEqual(values);
          return { closing: 0, opening: arriving, limit };
        },
      );
      test.expect(arriving).toBeLessThan(limit);
    });
  }
});
