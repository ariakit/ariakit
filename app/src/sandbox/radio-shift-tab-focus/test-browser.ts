import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("Shift+Tab moves focus back to the checked radio", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.radio("Option 1")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(q.radio("Option 2")).toBeFocused();
    await test.expect(q.radio("Option 2")).toBeChecked();

    await q.radio("Option 3").focus();
    await test.expect(q.radio("Option 3")).toBeFocused();
    await test.expect(q.radio("Option 3")).not.toBeChecked();
    await test.expect(q.radio("Option 2")).toBeChecked();

    await page.keyboard.press("Tab");
    await test.expect(q.button("After")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.radio("Option 2")).toBeFocused();
    await test.expect(q.radio("Option 2")).toBeChecked();
    await test.expect(q.radio("Option 3")).not.toBeChecked();
  });
});
