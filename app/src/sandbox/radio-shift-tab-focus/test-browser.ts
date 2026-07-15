import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
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

    // Safari may not tab to a button after programmatic focus in CI.
    await q.button("After").focus();
    await test.expect(q.button("After")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.radio("Option 2")).toBeFocused();
    await test.expect(q.radio("Option 2")).toBeChecked();
    await test.expect(q.radio("Option 3")).not.toBeChecked();
  });

  test("Shift+Tab moves focus back to the checked iframe radio", async ({
    page,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded options']"));

    await frame.radio("Option 1").click();
    await test.expect(frame.radio("Option 1")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await test.expect(frame.radio("Option 2")).toBeFocused();
    await test.expect(frame.radio("Option 2")).toBeChecked();

    await frame.radio("Option 3").focus();
    await test.expect(frame.radio("Option 3")).toBeFocused();
    await test.expect(frame.radio("Option 3")).not.toBeChecked();
    await test.expect(frame.radio("Option 2")).toBeChecked();

    await frame.button("After").focus();
    await test.expect(frame.button("After")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(frame.radio("Option 2")).toBeFocused();
    await test.expect(frame.radio("Option 2")).toBeChecked();
    await test.expect(frame.radio("Option 3")).not.toBeChecked();
  });
});
