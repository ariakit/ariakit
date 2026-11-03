import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the reason when the keyboard reaches the tab", async ({
    q,
    page,
  }) => {
    await q.tab("Members").click();
    await page.keyboard.press("ArrowLeft");
    const tab = q.tab("Audit log");
    await test.expect(tab).toBeFocused();
    await test.expect(tab).toHaveAttribute("aria-selected", "false");
    await test.expect(q.tooltip()).toBeVisible();
    await test
      .expect(tab)
      .toHaveAccessibleDescription("Audit log is part of the Business plan.");
    await test.expect(q.tabpanel("Members")).toBeVisible();
  });
});
