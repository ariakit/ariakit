import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6300
withFramework(import.meta.dirname, async ({ test }) => {
  for (const key of ["Backspace", "Delete"]) {
    test(`keeps focus in the field after ${key} on an empty container field`, async ({
      page,
      q,
    }) => {
      const container = q.group("Empty font family");
      const input = q.textbox("Empty font family");

      await q.button("Before empty toolbar").focus();
      await page.keyboard.press("Tab");

      await test.expect(container).toBeFocused();
      await page.keyboard.press(key);
      await test.expect(input).toBeFocused();

      await page.keyboard.press("a");

      await test.expect(input).toHaveValue("a");
      await test.expect(input).toBeFocused();
    });
  }
});
