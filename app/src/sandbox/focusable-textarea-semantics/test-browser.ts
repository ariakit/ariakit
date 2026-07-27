import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves textarea semantics and keyboard focus visibility", async ({
    page,
    q,
  }) => {
    const textarea = q.textbox("Comment");
    await test.expect(textarea).toHaveJSProperty("tagName", "TEXTAREA");
    await test
      .expect(textarea)
      .toHaveAttribute("placeholder", "Write your comment, be kind");

    await page.keyboard.press("Tab");
    await test.expect(textarea).toBeFocused();
    await test.expect(textarea).toHaveAttribute("data-focus-visible", "true");
  });
});
