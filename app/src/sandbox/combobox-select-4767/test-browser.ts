import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
});
