import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tabs to the checked radio and checks the next one with an arrow key", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.radio("Newest first")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.radio("Oldest first")).toBeFocused();
    await test.expect(q.radio("Oldest first")).toBeChecked();
    await test.expect(q.radio("Newest first")).not.toBeChecked();
  });
});
