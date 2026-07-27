import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-listbox/test.ts
  test("moves and selects within a persistent SelectList", async ({
    page,
    q,
  }) => {
    const listbox = q.listbox("Favorite fruit");
    await listbox.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test
      .expect(q.option("Banana"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(listbox).toBeFocused();
  });
});
