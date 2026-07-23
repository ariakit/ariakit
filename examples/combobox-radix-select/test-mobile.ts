import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

// https://github.com/ariakit/ariakit/issues/3274
test("keeps the select open when the viewport resizes", async ({ page }) => {
  const q = query(page);
  const select = q.combobox("Language");
  const input = q.combobox("Search languages");
  const dialog = q.dialog("Languages");

  await select.tap();
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();

  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Expected the page to have a viewport");

  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height - 200,
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );

  await expect(dialog).toBeVisible();
  await expect(dialog).toBeInViewport({ ratio: 1 });
  await expect(input).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(select).toBeFocused();
});
