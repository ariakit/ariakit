import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4767
  test("clears focus-visible with a non-focusable list", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();
    const apple = q.option("Apple");
    await test.expect(select).toBeFocused();
    await test
      .expect(select)
      .toHaveAttribute(
        "aria-activedescendant",
        (await apple.getAttribute("id"))!,
      );

    await page.keyboard.press("ArrowDown");
    const banana = q.option("Banana");
    await test.expect(select).toBeFocused();
    await test.expect(banana).toHaveAttribute("data-active-item");
    await test
      .expect(select)
      .toHaveAttribute(
        "aria-activedescendant",
        (await banana.getAttribute("id"))!,
      );
    await test.expect(banana).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");

    const orange = q.option("Orange");
    await test.expect(select).toBeFocused();
    await test
      .expect(select)
      .toHaveAttribute(
        "aria-activedescendant",
        (await orange.getAttribute("id"))!,
      );
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
    await test.expect(apple).not.toHaveAttribute("data-focus-visible");
    await test.expect(banana).not.toHaveAttribute("data-focus-visible");
  });

  // https://github.com/ariakit/ariakit/issues/4767
  test("preserves virtual focus with a focusable owner", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Virtual focus fruit");
    await select.click();
    await test.expect(select).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const banana = q.option("Banana");
    await test.expect(select).toBeFocused();
    await test
      .expect(select)
      .toHaveAttribute(
        "aria-activedescendant",
        (await banana.getAttribute("id"))!,
      );
    await test.expect(banana).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("ArrowDown");
    const orange = q.option("Orange");
    await test.expect(select).toBeFocused();
    await test.expect(orange).toHaveAttribute("data-active-item");
    await test
      .expect(select)
      .toHaveAttribute(
        "aria-activedescendant",
        (await orange.getAttribute("id"))!,
      );
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
    await test.expect(banana).not.toHaveAttribute("data-focus-visible");
  });

  // https://github.com/ariakit/ariakit/issues/4767
  test("preserves real focus with a non-focusable list", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Real focus fruit");
    await select.click();
    const apple = q.option("Apple");
    await test.expect(select).toBeFocused();
    await test.expect(apple).toHaveAttribute("data-active-item");

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
