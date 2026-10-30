import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tabs to each checkbox and toggles it with Space", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.checkbox("Comments")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.checkbox("Mentions")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.checkbox("Weekly digest")).toBeFocused();
    await page.keyboard.press("Space");
    await test.expect(q.checkbox("Weekly digest")).toBeChecked();
    await test.expect(q.checkbox("Comments")).toBeChecked();
  });
});
