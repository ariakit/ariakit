import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows and hides the popup with the disclosure button", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.button("Show popup"))
      .toHaveAttribute("aria-expanded", "false");
    await q.button("Show popup").click();
    await test.expect(q.listbox()).toBeVisible();
    await test
      .expect(q.button("Hide popup"))
      .toHaveAttribute("aria-expanded", "true");

    await page.keyboard.type("abc");
    await test.expect(q.combobox()).toBeFocused();
    await q.button("Hide popup").click();
    await test.expect(q.combobox()).toBeFocused();
    await test.expect(q.listbox()).toHaveCount(0);
  });

  test("shows and hides the popup with the combobox", async ({ page, q }) => {
    await q.combobox().click();
    await test.expect(q.listbox()).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.combobox()).toBeFocused();
    await test.expect(q.listbox()).toHaveCount(0);
  });
});
