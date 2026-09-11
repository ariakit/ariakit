import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Moves real keyboard focus to a link: a Tab press, not a programmatic focus,
 * is what makes `:focus-visible` match in every engine. Stepping back and
 * forward returns to the link in each engine's own Tab order.
 */
async function tabTo(page: Page, link: Locator) {
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
}

// The ring depends on each engine's keyboard modality and Tab order, and Chrome
// gives links a user agent outline offset of its own, so this runs in every
// desktop project.
withFramework(
  import.meta.dirname,
  { route: "link" },
  async ({ query, test }) => {
    test("shows the focus ring on a link in running text", async ({
      page,
      q,
    }) => {
      const link = query(q.article("Default")).link("styling guide");
      await tabTo(page, link);
      await test.expect(link).toBeFocused();
      await test.expect(link).toHaveCSS("outline-style", "solid");
      await test.expect(link).toHaveCSS("outline-width", "2px");
    });

    test("offsets the focus ring on a standalone link", async ({ page, q }) => {
      const link = query(q.article("Offset focus ring")).link("View all");
      await tabTo(page, link);
      await test.expect(link).toBeFocused();
      await test.expect(link).toHaveCSS("outline-style", "solid");
      await test.expect(link).toHaveCSS("outline-offset", "2px");
    });
  },
);
