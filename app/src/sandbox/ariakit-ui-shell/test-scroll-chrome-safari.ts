import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("continues scrolling the page at the sidebar body's scroll limit", async ({
    q,
    page,
  }) => {
    await selectScenario(q, "parts");
    const body = q.navigation("Part navigation").locator(".shell-sidebar-body");
    await body.evaluate((node) => node.scrollTo(0, node.scrollHeight));
    await expect(q.link("Section 60", { exact: true })).toBeInViewport();
    await body.hover();
    await page.mouse.wheel(0, 500);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });
});
