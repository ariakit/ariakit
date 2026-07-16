import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/4767
withFramework(import.meta.dirname, async ({ test }) => {
  test("clears focus-visible when focus moves to another option", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    const apple = q.option("Apple");
    await test.expect(apple).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const banana = q.option("Banana");
    await test.expect(banana).toBeFocused();
    await test.expect(banana).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");

    const orange = q.option("Orange");
    await test.expect(orange).toBeFocused();
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
    await test.expect(apple).not.toHaveAttribute("data-focus-visible");
    await test.expect(banana).not.toHaveAttribute("data-focus-visible");
  });
});
