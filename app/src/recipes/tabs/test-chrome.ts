import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the panel of each tab", async ({ q }) => {
    await test.expect(q.tabpanel("Overview")).toContainText("June release");
    await q.tab("Activity").click();
    await test.expect(q.tabpanel("Activity")).toContainText("Maya Chen");
    await test.expect(q.tabpanel("Overview")).toHaveCount(0);
  });

  test("moves between tabs and selects them with the arrow keys", async ({
    q,
    page,
  }) => {
    await q.tab("Overview").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Activity")).toBeFocused();
    await test.expect(q.tabpanel("Activity")).toBeVisible();
    await page.keyboard.press("End");
    await test.expect(q.tab("Members")).toBeFocused();
    await test.expect(q.tabpanel("Members")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Overview")).toBeFocused();
  });
});
