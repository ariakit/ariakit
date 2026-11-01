import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("tabs to the checked segment and checks the next one with an arrow key", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.radio("System")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.radio("Light")).toBeFocused();
    await test.expect(q.radio("Light")).toBeChecked();
    await test.expect(q.radio("System")).not.toBeChecked();
  });

  test("checks a segment on click", async ({ q }) => {
    await q.radio("Dark").click();
    await test.expect(q.radio("Dark")).toBeChecked();
    await test.expect(q.radio("System")).not.toBeChecked();
  });
});
