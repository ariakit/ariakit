import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/3031
  test("hides the popover when focus moves to the parent document", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded combobox']"));
    await frame.combobox("Favorite food").click();
    await test.expect(frame.listbox("Suggestions")).toBeVisible();

    await page.keyboard.press("Tab");

    await test.expect(q.button("After iframe")).toBeFocused();
    await test.expect(frame.listbox("Suggestions")).not.toBeVisible();
  });
});
