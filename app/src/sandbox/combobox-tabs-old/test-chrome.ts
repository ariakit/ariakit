import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const shortcutNames = [
  "Up Arrow",
  "Down Arrow",
  "Left Arrow",
  "Right Arrow",
  "Enter",
];

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7279
  test("exposes shortcut names to assistive technology", async ({ page }) => {
    const q = query(page);

    await q.combobox().click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    const footer = page.locator(".popover-footer");
    const shortcuts = footer.locator("kbd");
    await expect(shortcuts).toHaveCount(shortcutNames.length);

    for (const [index, name] of shortcutNames.entries()) {
      const snapshot = await shortcuts.nth(index).ariaSnapshot();
      expect(snapshot).toContain(`text: ${name}`);
    }
  });
});
