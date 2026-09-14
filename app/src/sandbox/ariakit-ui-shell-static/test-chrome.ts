import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// The shell from its recipes in an Astro page: no component JavaScript, one
// inline script that flips the open attribute.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("renders open from the markup and folds from a plain toggle", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const sidebar = page.locator("#sidebar");
    const toggle = q.button("Toggle sidebar");
    await expect(page.locator("astro-island")).toHaveCount(0);
    await expect(sidebar).toHaveCSS("width", "256px");
    await expect(q.navigation("Documentation")).toBeVisible();
    await toggle.click();
    await expect(sidebar).toHaveCSS("width", "0px");
    await expect(query(sidebar).link("Sidebars")).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(sidebar).toHaveCSS("width", "256px");
    await expect(query(sidebar).link("Sidebars")).toBeVisible();
  });
});
