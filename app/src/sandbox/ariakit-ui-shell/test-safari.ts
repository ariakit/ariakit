import { expect } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // https://github.com/ariakit/ariakit/issues/7532
  test("keeps the page scroll position when nested main content updates", async ({
    page,
    q,
  }) => {
    await selectScenario(q, "nested");
    const button = q.button("Add update");
    await button.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await expect(button).toBeInViewport();
    const scroll = await page.evaluate(() => window.scrollY);
    expect(scroll).toBeGreaterThan(0);
    await button.click();
    await expect(q.text("Updates: 1", { exact: true })).toBeVisible();
    // The update is committed above, but WebKit can reset scroll when the
    // resulting container query layout runs on the next rendered frame.
    await flushFrames(page);
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
  });
});
