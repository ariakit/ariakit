import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

async function largestStyleRecalculation(
  page: Page,
  action: () => Promise<void>,
) {
  const session = await page.context().newCDPSession(page);
  const counts: number[] = [];
  session.on("Tracing.dataCollected", ({ value }) => {
    for (const event of value) {
      if (event.name !== "UpdateLayoutTree") continue;
      const args: unknown = event.args;
      if (!args || typeof args !== "object") continue;
      if (!("elementCount" in args)) continue;
      const count = args.elementCount;
      if (typeof count !== "number") continue;
      counts.push(count);
    }
  });
  try {
    await session.send("Tracing.start", {
      categories: "devtools.timeline",
      transferMode: "ReportEvents",
    });
    await action();
    // Style invalidation is applied on the next rendering frame. The second
    // frame ensures that the trace includes it before recording stops.
    await flushFrames(page);
    const complete = new Promise<void>((resolve) => {
      session.once("Tracing.tracingComplete", () => resolve());
    });
    await session.send("Tracing.end");
    await complete;
    return Math.max(0, ...counts);
  } finally {
    await session.detach();
  }
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test.beforeEach(async ({ page }) => {
    // Size containers move style work into layout, where Chrome omits the
    // element count. Remove that boundary and motion for this count-only probe.
    await page.addStyleTag({
      content:
        "* { container-type: normal !important; transition: none !important; }",
    });
    // The probe stylesheet must finish its own invalidation before tracing.
    await flushFrames(page);
  });

  // https://github.com/ariakit/ariakit/issues/7806
  test("recalculates the changing rows when the hover glider moves", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Documentation sections");
    const links = query(nav);
    const first = links.link("Installation").first();
    const second = links.link("Quickstart").first();
    const hover = nav.locator(".glider:not(.selected):not(.focus)");
    await first.scrollIntoViewIfNeeded();
    await first.hover();
    await test.expect(hover).toBeVisible();
    // Finish the initial hover frame before measuring the next pointer move.
    await flushFrames(page);
    const count = await largestStyleRecalculation(page, async () => {
      await second.hover();
      await test.expect(hover).toBeVisible();
    });
    test.expect(count).toBeGreaterThan(0);
    test.expect(count).toBeLessThan((await nav.locator("*").count()) / 2);
  });

  // https://github.com/ariakit/ariakit/issues/7806
  test("keeps unrelated styles cached when a portal container is removed", async ({
    page,
    q,
  }) => {
    // A hidden container isolates the body-child mutation made by a portal from
    // the tooltip's own focus, layout, and animation work.
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.id = "portal-style-probe";
      container.hidden = true;
      document.body.insertBefore(container, document.body.lastElementChild);
    });
    // The insertion must finish its invalidation before measuring removal.
    await flushFrames(page);
    const count = await largestStyleRecalculation(page, () =>
      page.evaluate(() =>
        document.getElementById("portal-style-probe")?.remove(),
      ),
    );
    await test.expect(q.navigation("Documentation sections")).toBeVisible();
    test.expect(count).toBeLessThan((await page.locator("*").count()) / 2);
  });
});
