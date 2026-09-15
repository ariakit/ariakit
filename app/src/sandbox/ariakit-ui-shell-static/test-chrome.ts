import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // https://github.com/ariakit/ariakit/issues/7532
  test("renders closed from markup and opens with a plain class-based toggle", async ({
    page,
    q,
  }) => {
    const sidebar = page.locator("#sidebar");
    const toggle = q.button("Toggle sidebar");
    await expect(page.locator("astro-island")).toHaveCount(0);
    await expect(q.navigation("Documentation")).toHaveCount(0);
    await expect(
      query(sidebar).link("Sidebars", { includeHidden: true }),
    ).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-controls", "sidebar");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(query(sidebar).link("Sidebars")).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(
      query(sidebar).link("Sidebars", { includeHidden: true }),
    ).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    // https://github.com/ariakit/ariakit/issues/7532
    test("keeps the static closed sidebar out of the accessibility tree and tab order", async ({
      page,
      q,
    }) => {
      await expect(page.locator("astro-island")).toHaveCount(0);
      await expect(q.navigation("Documentation")).toHaveCount(0);
      const sidebar = page.locator("#sidebar");
      await expect(sidebar).toBeHidden();
      await expect(page.locator(".shell-sidebar")).toHaveCSS("width", "0px");
      await q.button("Toggle sidebar").focus();
      await page.keyboard.press("Tab");
      expect(
        await sidebar.evaluate((node) => node.contains(document.activeElement)),
      ).toBe(false);
    });
  });
});
