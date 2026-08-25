import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const shortcuts = [
  [0, "Up Arrow"],
  [1, "Down Arrow"],
  [2, "Left Arrow"],
  [3, "Right Arrow"],
  [5, "Enter"],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7279
  test("exposes shortcut names to assistive technology", async ({ page }) => {
    const q = query(page);

    await q.button("With Tabs (2 columns)").click();

    const footer = page.locator("footer");
    const keys = footer.locator("kbd");
    await expect(keys).toHaveCount(shortcuts.length + 1);

    for (const [index, name] of shortcuts) {
      const snapshot = await keys.nth(index).ariaSnapshot();
      expect(snapshot).toContain(`text: ${name}`);
    }
  });
});
