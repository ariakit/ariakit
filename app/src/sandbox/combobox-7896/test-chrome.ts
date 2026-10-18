import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7896
  test("keyboard navigation follows reordered items", async ({ page, q }) => {
    const combobox = q.combobox("Project");
    await combobox.click();
    const popover = q.listbox("Projects");
    await test.expect(popover).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Beta")).toHaveAttribute("data-active-item");

    await q.button("Refresh results").click();
    await test
      .expect(query(popover).option())
      .toHaveText(["Alpha", "Beta", "Delta", "Charlie"]);
    await test.expect(combobox).toBeFocused();
    await test.expect(q.option("Beta")).toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Delta")).toHaveAttribute("data-active-item");

    await page.keyboard.press("Enter");
    await test.expect(q.status()).toHaveText("Delta");
  });
});
