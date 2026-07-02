import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow key on the closed select does not freeze the page when all items after the active one have no value", async ({
    page,
    q,
  }) => {
    await q.combobox("Favorite fruit").click();
    await test.expect(q.option("Cherry")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Cherry")).toBeHidden();
    await test.expect(q.combobox("Favorite fruit")).toBeFocused();
    // On the buggy code, this key press freezes the page forever
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Cherry")).toBeVisible();
    await test.expect(q.option("Cherry")).toHaveAttribute("data-active-item");
  });

  test("arrow keys on the closed select skip the trailing item without value", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Favorite color");
    await combobox.click();
    await test.expect(q.option("Green")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Green")).toBeHidden();
    await test.expect(combobox).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(combobox).toContainText("Blue");
    // The only item after Blue has no value, so this should be a no-op
    await page.keyboard.press("ArrowDown");
    await test.expect(combobox).toContainText("Blue");
    await page.keyboard.press("ArrowUp");
    await test.expect(combobox).toContainText("Green");
  });
});
