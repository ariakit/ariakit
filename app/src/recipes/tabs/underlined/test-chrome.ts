import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the panel of the selected flat tab", async ({ q, page }) => {
    await test.expect(q.tabpanel("Profile")).toContainText("Your name");
    await q.tab("Security").click();
    await test.expect(q.tabpanel("Security")).toContainText("Two-step");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Billing")).toBeFocused();
    await test.expect(q.tabpanel("Billing")).toContainText("plan renews");
  });
});
