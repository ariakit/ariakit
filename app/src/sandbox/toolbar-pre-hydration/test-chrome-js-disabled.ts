import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  test("keeps native items tabbable with undefined and null active IDs", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button("Undo")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("Bold")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("Italic")).toBeFocused();

    await page.keyboard.press("Tab");
    await test.expect(q.button("Underline")).toBeFocused();
  });
});
