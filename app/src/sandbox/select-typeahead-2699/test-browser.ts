import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/2699
  test("matches custom item content and skips empty text while open", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await test.expect(q.option("Brazil")).toHaveAttribute("data-active-item");

    await page.keyboard.press("c");

    await test
      .expect(q.option("Citrus"))
      .not.toHaveAttribute("data-active-item");
    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });

  test("matches custom item content while closed", async ({ page, q }) => {
    await page.keyboard.press("Tab");

    await page.keyboard.press("c");

    await test.expect(q.combobox(/^Country$/)).toContainText("Canada");
    await test.expect(q.listbox()).not.toBeAttached();
  });

  test("updates custom item text", async ({ page, q }) => {
    await q.button("Use country aliases").click();
    await q.combobox(/^Country$/).click();

    await page.keyboard.press("d");

    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });

  test("matches custom content on an offscreen item", async ({ page, q }) => {
    await q.combobox(/^Virtualized country$/).click();
    await test.expect(q.option("Canada")).toHaveAttribute("data-offscreen");

    await page.keyboard.press("c");

    await test.expect(q.option("Canada")).toHaveAttribute("data-active-item");
  });
});
