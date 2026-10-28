import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow key on the closed legacy Select does not freeze the page when all following items have no value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite fruit");
    await select.click();
    await test.expect(q.option("Cherry")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Cherry")).toBeHidden();
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Cherry")).toBeVisible();
    await test.expect(q.option("Cherry")).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow keys on the closed legacy Select skip the trailing item without value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite color");
    await select.click();
    await test.expect(q.option("Green")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Green")).toBeHidden();
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Blue");
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Blue");
    await page.keyboard.press("ArrowUp");
    await test.expect(select).toContainText("Green");
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow keys on the closed legacy Select with focusLoop wrap past the item without value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite shape");
    await select.click();
    await test.expect(q.option("Triangle")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Triangle")).toBeHidden();
    await test.expect(select).toBeFocused();
    await test.expect(select).toContainText("Triangle");
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Square");
  });
});
