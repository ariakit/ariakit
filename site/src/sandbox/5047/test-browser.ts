import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("selected item is focused when reopening popover", async ({
    page,
    q,
  }) => {
    // Select "Orange" via the combobox
    await q.combobox("Favorite fruit").click();
    await page.keyboard.type("or");
    await test.expect(q.option("Orange")).toBeVisible();
    await q.option("Orange").click();
    await test.expect(q.combobox("Favorite fruit")).toContainText("Orange");
    // Reopen the popover - the selected item should be auto-focused
    await q.combobox("Favorite fruit").click();
    await test.expect(q.option("Orange")).toHaveAttribute("data-active-item");
  });
});
