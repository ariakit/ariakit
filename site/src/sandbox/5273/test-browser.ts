import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("arrow right in tab list moves to next tab, not to radio items", async ({
    page,
    q,
  }) => {
    await q.tab("Preferences").click();
    await test.expect(q.tab("Preferences")).toBeFocused();
    // Arrow right should move to the Account tab, not to a FormRadio item
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Account")).toBeFocused();
    // Arrow right again should wrap back to the first tab
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Preferences")).toBeFocused();
  });
});
