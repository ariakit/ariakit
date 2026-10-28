import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6324
  test("focusOnMove={false} keeps focus while arrow keys move the active item", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Fruit");
    await select.click();
    await test.expect(select).toBeFocused();

    await page.keyboard.press("ArrowDown");

    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await test.expect(select).toBeFocused();
  });
});
