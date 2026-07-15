// See https://github.com/ariakit/ariakit/issues/5696
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("supports object overflow padding in CSS sizing", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    const popover = q.listbox();
    await test.expect(popover).toBeVisible();
    await test.expect(popover).toHaveCSS("width", "736px");

    const combobox = q.combobox("Favorite fruit");
    await combobox.click();
    await combobox.press("Escape");
    await test.expect(popover).toBeHidden();
    await combobox.click();
    await test.expect(popover).toBeVisible();
    await test.expect(popover).toHaveCSS("width", "736px");
  });
});
