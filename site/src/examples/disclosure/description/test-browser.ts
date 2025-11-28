import { withFramework } from "#app/test-utils/preview.ts";
import { viewports } from "#app/test-utils/visual.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open @visual", async ({ q, visual }) => {
    await q.button("Visa •••• •••• •••• 3421").click();
    await test.expect(q.heading("Recent charges")).toBeVisible();
    await visual({ viewports });
  });
});
