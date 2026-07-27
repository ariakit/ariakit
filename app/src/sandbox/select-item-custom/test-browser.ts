import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-item-custom/test.ts
  test("renders custom values and restores a moved value on escape", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Account");
    await test.expect(select).toContainText("John Doe");
    await select.click();
    await page.keyboard.press("ArrowUp");
    await test.expect(select).toContainText("Jane Doe");
    await page.keyboard.press("Enter");

    await select.click();
    await page.keyboard.press("End");
    await test.expect(select).toContainText("Sonia Poe");
    await page.keyboard.press("Escape");
    await test.expect(select).toContainText("Jane Doe");
  });
});
