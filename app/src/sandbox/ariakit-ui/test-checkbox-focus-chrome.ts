import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Moves focus to the element with the keyboard: the ring is keyboard-only, and
 * a Tab press is what puts the page in keyboard modality.
 */
async function tabTo(page: Page, element: Locator) {
  await element.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
}

withFramework(
  import.meta.dirname,
  { route: "checkbox" },
  async ({ test, query }) => {
    test("a field draws the ring on its box, not on the row", async ({
      page,
      q,
    }) => {
      const input = query(q.article("Checkbox field")).checkbox("Remember me");
      await tabTo(page, input);
      await test.expect(input).toBeFocused();
      await test.expect(input).toHaveCSS("outline-style", "solid");
      // The row is the label around the input.
      const row = input.locator("xpath=..");
      await test.expect(row).toHaveCSS("outline-style", "none");
    });

    test("a card draws the ring around the whole card", async ({ page, q }) => {
      const input = query(q.article("Checkbox card")).checkbox("Analytics");
      await tabTo(page, input);
      await test.expect(input).toBeFocused();
      // The input is visually hidden, so the card around it takes the ring.
      const card = input.locator("xpath=..");
      await test.expect(card).toHaveCSS("outline-style", "solid");
      await test.expect(card).toHaveCSS("outline-offset", "2px");
    });
  },
);
