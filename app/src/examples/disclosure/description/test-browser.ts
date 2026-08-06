import { withFramework } from "#app/test-utils/preview.ts";
import { viewports } from "#app/test-utils/visual.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open @visual", async ({ page, q, visual }) => {
    await q.button("Visa •••• •••• •••• 3421").click();
    await test.expect(q.heading("Recent charges")).toBeVisible();
    // Move the pointer away so the snapshot excludes the hover state.
    await page.mouse.move(0, 0);
    await visual({ viewports });
  });
});
