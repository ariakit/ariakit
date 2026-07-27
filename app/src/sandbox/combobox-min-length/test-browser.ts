import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("opens only after the combobox becomes dirty", async ({ page, q }) => {
    const combobox = q.combobox();
    await combobox.click();
    await test.expect(q.listbox()).toHaveCount(0);
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox()).toHaveCount(0);

    await page.keyboard.type("a");
    await test.expect(q.listbox()).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toHaveCount(0);

    await combobox.click();
    await test.expect(q.listbox()).toBeVisible();
    await test
      .expect(q.option(/Apple/))
      .not.toHaveAttribute("data-active-item");
  });
});
