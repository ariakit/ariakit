import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6299
withFramework(import.meta.dirname, async ({ test }) => {
  test("enters and traverses an RTL composite from the base element", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Text formatting");

    await page.keyboard.press("Tab");

    await test.expect(toolbar).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await test.expect(q.button("Bold")).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await test.expect(q.button("Italic")).toBeFocused();

    await toolbar.focus();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Underline")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Italic")).toBeFocused();
  });
});
