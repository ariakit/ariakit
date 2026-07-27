import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-combobox-focus-within/test.ts
  test("tracks popover focus and exposes the cancel control", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    const search = q.combobox("Search foods");
    const cancel = q.button("Clear input");

    await select.click();
    await test.expect(search).toBeFocused();
    await test.expect(q.group()).toHaveClass(/focus-within/);
    await test.expect(cancel).toHaveAttribute("data-visible");

    await page.keyboard.type("ba");
    await test.expect(q.option("Bacon")).toHaveAttribute("data-active-item");
    await cancel.click();
    await test.expect(search).toHaveValue("");

    await page.keyboard.press("Shift+Tab");
    await test.expect(select).toBeFocused();
    await test.expect(q.group()).not.toHaveClass(/focus-within/);
  });
});
