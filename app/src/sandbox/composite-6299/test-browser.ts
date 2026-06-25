import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6299
withFramework(import.meta.dirname, async ({ test }) => {
  test("enters an RTL composite from the base element with ArrowLeft", async ({
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
  });

  // Use a fresh render so the toolbar has no active item when focused.
  test("enters an RTL composite from the base element with ArrowRight", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Text formatting");

    await page.keyboard.press("Tab");

    await test.expect(toolbar).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Underline")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Italic")).toBeFocused();
  });
});
