import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders the default and changes it with a pointer", async ({ q }) => {
    await q.button("Sort").click();
    await test
      .expect(q.menuitemradio("Popular"))
      .toHaveAttribute("aria-checked", "true");
    await q.menuitemradio("Newest").click();
    await test
      .expect(q.menuitemradio("Newest"))
      .toHaveAttribute("aria-checked", "true");
  });

  for (const key of ["Enter", "Space"] as const) {
    test(`changes the radio value with ${key}`, async ({ page, q }) => {
      await q.button("Sort").press(key);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press(key);
      await test
        .expect(q.menuitemradio("Newest"))
        .toHaveAttribute("aria-checked", "true");
    });
  }
});
