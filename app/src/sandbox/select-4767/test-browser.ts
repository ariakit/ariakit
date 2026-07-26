import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4767
  test("keeps virtual focus on the select while moving through the items", async ({
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
  test("focuses the selected item when opening in real-focus mode", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Real focus fruit");
    await select.click();
    const apple = q.option("Apple");
    await test.expect(apple).toBeFocused();
    await test.expect(select).not.toBeFocused();
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

  test("focuses the input in a filterable select", async ({ q }) => {
    await q.combobox("Filterable fruit").click();

    await test.expect(q.combobox("Filter Filterable fruit")).toBeFocused();
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3652438488
  test("clears focus-visible from the filterable select trigger", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Filterable fruit");
    const input = q.combobox("Filter Filterable fruit");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(select).toBeFocused();
    await test.expect(select).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("Enter");
    await test.expect(input).toBeFocused();
    await test.expect(select).not.toHaveAttribute("data-focus-visible");
  });

  // https://github.com/ariakit/ariakit/pull/6832#discussion_r3649290438
  test("keeps focus on the items when typing in real-focus mode", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Real focus fruit");
    await select.click();

    await page.keyboard.press("ArrowDown");
    const banana = q.option("Banana");
    await test.expect(banana).toBeFocused();

    // Backspace would navigate the page back in WebKit, so the editing-key
    // half of this behavior is only exercised in the happy-dom duplicate.
    await page.keyboard.press("o");
    await test.expect(q.option("Orange")).toBeFocused();
    await test.expect(select).not.toBeFocused();
  });
});
