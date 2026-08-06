import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hover @visual", async ({ q, visual }) => {
    await q.button(/^What do "lifetime access"/).hover();
    await visual();
  });

  test("open @visual", async ({ page, q, visual }) => {
    await q.button(/^What do "lifetime access"/).click();
    await test.expect(q.text(/Lifetime access and/)).toBeVisible();
    // Move the pointer away so the snapshot excludes the hover state.
    await page.mouse.move(0, 0);
    await visual();
    await q.button(/^How does the Team license/).click();
    await test.expect(q.text(/When you purchase a team/)).toBeVisible();
    // Move the pointer away so the snapshot excludes the hover state.
    await page.mouse.move(0, 0);
    await visual();
    await q.button(/^What do "lifetime access"/).hover();
    await visual();
    await q.text(/Lifetime access and/).hover();
    await visual();
  });
});
