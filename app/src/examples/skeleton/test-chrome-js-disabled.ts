import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  // https://github.com/ariakit/ariakit/pull/7993#discussion_r4317370417
  test("skips the filled button before hydration", async ({ page, q }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button("Reload profile")).toBeFocused();
  });
});
