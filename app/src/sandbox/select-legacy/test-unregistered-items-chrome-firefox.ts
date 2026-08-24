import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps an unregistered multi-value SelectItem clickable", async ({
    q,
  }) => {
    await q.button("Show public-select-multiple-unregistered").click();
    const item = q.option("Cake");
    await test.expect(item).toHaveAttribute("aria-selected", "false");

    await item.click();

    await test.expect(item).toHaveAttribute("aria-selected", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps an unregistered multi-value ComboboxItem clickable", async ({
    q,
  }) => {
    await q.button("Show public-combobox-multiple-unregistered").click();
    const item = q.option("Cake");
    await test.expect(item).toHaveAttribute("aria-selected", "false");

    await item.click();

    await test.expect(item).toHaveAttribute("aria-selected", "true");
  });
});
