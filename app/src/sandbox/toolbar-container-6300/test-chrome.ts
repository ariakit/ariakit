import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6300
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps focus in the field after Backspace clears the field first", async ({
    page,
    q,
  }) => {
    const container = q.group("Font family");
    const input = q.textbox("Font family");

    await q.button("Before filled toolbar").focus();
    await page.keyboard.press("Tab");

    await test.expect(container).toBeFocused();
    await page.keyboard.press("Backspace");
    await test.expect(input).toHaveValue("");
    await test.expect(container).toBeFocused();

    await page.keyboard.press("Backspace");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("a");

    await test.expect(input).toHaveValue("a");
    await test.expect(input).toBeFocused();
  });
});
