import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names the group with its label and checks the default sort", async ({
    q,
  }) => {
    const group = query(q.radiogroup("Sort comments by"));
    await test.expect(group.radio("Newest first")).toBeChecked();
    await test.expect(group.radio("Oldest first")).not.toBeChecked();
  });

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
