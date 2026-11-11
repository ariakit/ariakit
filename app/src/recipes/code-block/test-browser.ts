import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("the scroll area is a tab stop before the copy button", async ({
    page,
    q,
  }) => {
    // Safari doesn't focus a scroll area without a tabindex, so this matters
    // most there. The copy button shows over the code, so it comes after it.
    await page.keyboard.press("Tab");
    await test.expect(q.region("Counter component")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy code")).toBeFocused();
  });
});
