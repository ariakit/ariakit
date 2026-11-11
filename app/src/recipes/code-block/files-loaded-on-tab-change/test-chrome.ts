import type { Page, Route } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const cssUrl = "**/code-files/**/files-loaded-on-tab-change/toggle.css.json";

// Holds the requests for a URL until the test releases them, so the test can
// see the panel while the file loads.
async function holdRequests(page: Page, url: string) {
  const routes: Route[] = [];
  let count = 0;
  await page.route(url, (route) => {
    count++;
    routes.push(route);
  });
  return {
    getCount: () => count,
    release: async () => {
      for (const route of routes.splice(0)) {
        await route.continue();
      }
    },
  };
}

const slowNetwork = "Simulate a slow network";

withFramework(import.meta.dirname, async ({ test }) => {
  // The other tests hold or fail the requests themselves, so they turn off the
  // delay first.
  test("waits before it loads a file on a slow network", async ({
    page,
    q,
  }) => {
    const requests = await holdRequests(page, cssUrl);
    await test.expect(q.checkbox(slowNetwork)).toBeChecked();
    await q.tab("toggle.css").click();
    const panel = q.tabpanel("toggle.css");
    await test.expect(panel).toHaveAttribute("aria-busy", "true");
    // The request waits for the 1.5s delay of the slow network. A request
    // without the delay reaches the route well within half a second.
    await page.waitForTimeout(500);
    test.expect(requests.getCount()).toBe(0);
    await test.expect.poll(requests.getCount).toBe(1);
    await requests.release();
    await test.expect(panel).not.toHaveAttribute("aria-busy");
    await test.expect(panel).toContainText(".toggle {");
  });

  // Hidden panels don't show, so they aren't busy, and the page finishes
  // loading once the file that shows arrives.
  test("marks only the panel that loads as busy", async ({ page, q }) => {
    const busy = page.locator("[aria-busy='true']");
    await test.expect(busy).toHaveCount(0);
    await q.checkbox(slowNetwork).click();
    const requests = await holdRequests(page, cssUrl);
    await q.tab("toggle.css").click();
    await test
      .expect(q.tabpanel("toggle.css"))
      .toHaveAttribute("aria-busy", "true");
    await test.expect(busy).toHaveCount(1);
    await test.expect.poll(requests.getCount).toBe(1);
    await requests.release();
    await test.expect(busy).toHaveCount(0);
  });

  test("loads a file when its tab is selected", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.checkbox(slowNetwork).click();
    const requests = await holdRequests(page, cssUrl);
    await q.tab("use-toggle.ts").hover();
    test.expect(requests.getCount()).toBe(0);
    await q.tab("toggle.css").click();
    const panel = q.tabpanel("toggle.css");
    await test.expect(panel).toHaveAttribute("aria-busy", "true");
    await test.expect(q.text("Loading toggle.css")).toBeAttached();
    await test.expect(q.button("Copy toggle.css")).toBeDisabled();
    const loadingHeight = await panel.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    await requests.release();
    await test.expect(panel).not.toHaveAttribute("aria-busy");
    await test.expect(panel).toContainText(".toggle-content {");
    // The skeleton lines took the final height, so the block doesn't move.
    test
      .expect(
        await panel.evaluate(
          (element) => element.getBoundingClientRect().height,
        ),
      )
      .toBe(loadingHeight);
    await q.button("Copy toggle.css").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toMatch(/^\.toggle \{\n {2}display: grid;/);
  });

  test("loads each file once", async ({ page, q }) => {
    await q.checkbox(slowNetwork).click();
    const requests = await holdRequests(page, cssUrl);
    await q.tab("toggle.css").hover();
    await test.expect.poll(requests.getCount).toBe(1);
    await q.tab("toggle.css").click();
    await requests.release();
    await test.expect(q.tabpanel("toggle.css")).toContainText(".toggle {");
    await q.tab("toggle.tsx").click();
    await q.tab("toggle.css").click();
    await test.expect(q.tabpanel("toggle.css")).toContainText(".toggle {");
    test.expect(requests.getCount()).toBe(1);
  });

  test("keeps a file after a long time on another tab", async ({ page, q }) => {
    await q.checkbox(slowNetwork).click();
    let count = 0;
    await page.route(cssUrl, async (route) => {
      count++;
      await route.continue();
    });
    await page.clock.install();
    await q.tab("toggle.css").click();
    await test.expect(q.tabpanel("toggle.css")).toContainText(".toggle {");
    await q.tab("toggle.tsx").click();
    // TanStack Query drops a file that no panel reads after 5 minutes by
    // default, so the clock goes past that while another tab shows.
    await page.clock.fastForward("06:00");
    await q.tab("toggle.css").click();
    await test.expect(q.tabpanel("toggle.css")).toContainText(".toggle {");
    test.expect(count).toBe(1);
  });

  test("loads a file again after a failure", async ({ page, q }) => {
    await q.checkbox(slowNetwork).click();
    let failures = 1;
    await page.route(cssUrl, async (route) => {
      if (failures-- > 0) {
        await route.abort();
        return;
      }
      await route.continue();
    });
    await q.tab("toggle.css").click();
    await test.expect(q.text("Couldn't load toggle.css.")).toBeVisible();
    await q.button("Try again").click();
    await test.expect(q.tabpanel("toggle.css")).toContainText(".toggle {");
  });
});
