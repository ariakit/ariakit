import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("skips the disabled segment with the arrow keys", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.radio("Month")).toBeChecked();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.radio("Year")).not.toBeChecked();
    await test.expect(q.radio("Day")).toBeChecked();
  });
});
