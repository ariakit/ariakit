import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6324
  test("focusOnMove={false} keeps focus while arrow keys move the active item", async ({
    page,
    q,
  }) => {
    await q.combobox("Fruit").click();
    await test.expect(q.option("Apple")).toBeFocused();

    await page.keyboard.press("ArrowDown");

    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await test.expect(q.option("Apple")).toBeFocused();
  });
});
