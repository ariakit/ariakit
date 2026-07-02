import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/issues/6346
withFramework(import.meta.dirname, async ({ test }) => {
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
});
