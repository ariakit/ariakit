import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8089
  test("moves the shared tooltip from name to name", async ({ q }) => {
    const hana = q.link("Hana Kobayashi");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await hana.scrollIntoViewIfNeeded();
    await hana.hover();
    await test.expect(q.tooltip("Hana Kobayashi")).toBeVisible();
    await q.link("Tom Becker").hover();
    await test.expect(q.tooltip("Tom Becker")).toBeVisible();
    await q.link("3 more members").hover();
    await test.expect(q.tooltip("3 more members")).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
  });
});
