import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/6346
  test("activates the tab selected by setSelectedId after the popover opens", async ({
    q,
  }) => {
    await q.combobox("Grocery").click();
    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");

    await q.button("Browse vegetables").click();

    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Vegetables")).toHaveAttribute("data-active-item");
    await test
      .expect(q.tab("Vegetables"))
      .not.toHaveAttribute("tabindex", "-1");

    await q.button("Browse fruits").click();

    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Fruits")).toHaveAttribute("data-active-item");
    await test.expect(q.tab("Fruits")).not.toHaveAttribute("tabindex", "-1");
  });

  // https://github.com/ariakit/ariakit/issues/6346
  test("activates the tab selected by setSelectedId after the popover toggles", async ({
    q,
  }) => {
    await q.combobox("Grocery").click();
    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");

    await q.button("Browse vegetables").click();
    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");

    await q.combobox("Grocery").click();
    await test
      .expect(q.combobox("Grocery"))
      .toHaveAttribute("aria-expanded", "false");

    await q.combobox("Grocery").click();
    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");

    await q.button("Browse vegetables").click();

    await test
      .expect(q.tab("Vegetables"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Vegetables")).toHaveAttribute("data-active-item");
    await test
      .expect(q.tab("Vegetables"))
      .not.toHaveAttribute("tabindex", "-1");

    await q.button("Browse fruits").click();

    await test.expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Fruits")).toHaveAttribute("data-active-item");
    await test.expect(q.tab("Fruits")).not.toHaveAttribute("tabindex", "-1");
  });

  test("scopes keyboard navigation to the focused list", async ({
    page,
    q,
  }) => {
    await q.combobox("Grocery").click();
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");

    await q.button("Browse vegetables").click();
    const list = q.listbox("Vegetables");
    await list.focus();
    await page.keyboard.press("ArrowDown");

    await test.expect(query(list).option("Carrot")).toBeFocused();
  });
});
