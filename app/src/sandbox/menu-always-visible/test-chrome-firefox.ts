import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6986
  test("moves focus through the menu while its store is closed", async ({
    page,
    q,
  }) => {
    const save = q.menuitem("Save");
    const close = q.menuitem("Close");

    await save.click();
    await test.expect(save).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    await test.expect(close).toHaveAttribute("data-active-item");
    await test.expect(close).toBeFocused();
  });
});
