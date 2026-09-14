import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectCentered,
  getBox,
  getContent,
  getShell,
  getSidebar,
  getSidebarBody,
} from "./test-helpers.ts";

// The server-rendered page with no JavaScript: the persisted open state, the
// sticky header and the centered main all come from the markup and the
// stylesheet.
withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  test("renders the docs layout with its persisted open state and centering", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const sidebar = getSidebar(q, "Documentation");
    await expect(sidebar).toHaveAttribute("data-open");
    await expect(sidebar).toHaveCSS("width", "256px");
    await expect(q.navigation("Documentation")).toBeVisible();
    await expect(q.navigation("On this page")).toBeHidden();
    await expectCentered(getContent(q), getShell(page));
    await page.evaluate(() => window.scrollTo(0, 600));
    expect((await getBox(q.banner())).y).toBe(0);
    expect((await getBox(getSidebarBody(sidebar))).y).toBe(52);
  });
});
