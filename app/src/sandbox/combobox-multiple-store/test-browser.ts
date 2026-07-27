import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("updates multiple selected values through the store", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.focus();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.option("Bacon"))
      .toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test
      .expect(q.option("Banana"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await test
      .expect(q.option("Banana"))
      .toHaveAttribute("aria-selected", "false");
  });
});
