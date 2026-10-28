import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("arrow right in tab list moves to next tab, not to radio items", async ({
    page,
    q,
  }) => {
    await q.tab("Preferences").click();
    await test.expect(q.tab("Preferences")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Account")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Preferences")).toBeFocused();
  });
});
