import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("calls onFocus only when focus enters the combobox", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    await page.keyboard.type("Applee");
    await test
      .expect(page.locator("body"))
      .toContainText("Number of onFocus calls: 1");

    await page.locator("body").click({ position: { x: 4, y: 4 } });
    await test.expect(combobox).not.toBeFocused();
    await combobox.click();
    await test
      .expect(page.locator("body"))
      .toContainText("Number of onFocus calls: 2");
  });
});
