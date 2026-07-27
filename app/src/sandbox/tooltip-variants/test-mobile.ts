import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not show the label tooltip on tap", async ({ page, q }) => {
    const tooltip = q.tooltip("Bold label");
    await test.expect(tooltip).not.toBeVisible();
    await q.button("Bold").tap();
    await page.waitForTimeout(50);
    await test.expect(tooltip).not.toBeVisible();
  });
});
