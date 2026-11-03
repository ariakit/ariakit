import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("changes the stats with the selected time range", async ({
    q,
    page,
  }) => {
    await test.expect(q.tabpanel("Week")).toContainText("8,912");
    await q.tab("Month").click();
    await test.expect(q.tabpanel("Month")).toContainText("36,450");
    await test.expect(q.tabpanel("Week")).toHaveCount(0);
    await page.keyboard.press("Home");
    await test.expect(q.tab("Day")).toBeFocused();
    await test.expect(q.tabpanel("Day")).toContainText("1,204");
  });
});
