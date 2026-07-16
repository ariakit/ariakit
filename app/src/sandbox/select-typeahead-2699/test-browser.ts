import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/2699
  test("matches custom item content while open", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await test.expect(q.option("Brazil")).toHaveAttribute("data-active-item");

    await page.keyboard.press("c");

    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });

  test("matches custom item content while closed", async ({ page, q }) => {
    await page.keyboard.press("Tab");

    await page.keyboard.press("c");

    await test.expect(q.combobox("Country")).toContainText("Canada");
    await test.expect(q.listbox()).not.toBeAttached();
  });
});
