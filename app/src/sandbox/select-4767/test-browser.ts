import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/4767
withFramework(import.meta.dirname, async ({ test }) => {
  test("clears focus-visible when the virtual focus owner isn't focusable", async ({
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

  test("preserves virtual focus with a focusable owner", async ({
    page,
    q,
  }) => {
    await q.combobox("Virtual focus fruit").click();
    const listbox = q.listbox();
    await test.expect(listbox).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const banana = q.option("Banana");
    await test.expect(listbox).toBeFocused();
    await test
      .expect(listbox)
      .toHaveAttribute(
        "aria-activedescendant",
        (await banana.getAttribute("id"))!,
      );
    await test.expect(banana).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");
    const orange = q.option("Orange");
    await test.expect(listbox).toBeFocused();
    await test
      .expect(listbox)
      .toHaveAttribute(
        "aria-activedescendant",
        (await orange.getAttribute("id"))!,
      );
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
    await test.expect(banana).not.toHaveAttribute("data-focus-visible");
  });

  test("preserves real focus with a non-focusable owner", async ({
    page,
    q,
  }) => {
    await q.combobox("Real focus fruit").click();
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
