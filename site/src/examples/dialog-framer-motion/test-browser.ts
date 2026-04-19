import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open dialog @visual", async ({ q, visual }) => {
    await visual();
    await q.button("Show modal").click();
    await test.expect(q.dialog()).toBeVisible();
    await test.expect(q.dialog()).toHaveCSS("opacity", "1");
    await visual();
  });
});
