import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectCentered,
  getBox,
  getContent,
  getShell,
  getSidebar,
  getSidebarBody,
} from "./helpers.ts";

// The server-rendered page with no JavaScript: the persisted open state, the
// sticky header, the centered main and the overlay drawer all come from the
// markup and the stylesheet.
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
    await expect(q.banner()).toHaveAttribute("data-sticky");
    await expectCentered(getContent(q), getShell(page));
    await page.evaluate(() => window.scrollTo(0, 600));
    expect((await getBox(q.banner())).y).toBe(0);
    expect((await getBox(getSidebarBody(sidebar))).y).toBe(52);
  });

  test("renders the overlay drawer on a phone from the stylesheet alone", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const sidebar = getSidebar(q, "Documentation");
    await expect(sidebar).toHaveCSS("width", "0px");
    await expect(getSidebarBody(sidebar)).toBeVisible();
    expect((await getBox(getSidebarBody(sidebar))).width).toBe(256);
    // Not modal before hydration: nothing is inert and there is no dialog.
    await expect(q.dialog("Documentation")).toHaveCount(0);
    await expect(q.main()).not.toHaveAttribute("inert");
  });
});
