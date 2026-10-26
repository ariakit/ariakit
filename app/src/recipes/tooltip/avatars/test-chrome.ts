import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8089
  test("moves the shared tooltip from name to name", async ({ q }) => {
    const ada = q.link("Ada Lovelace");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await ada.scrollIntoViewIfNeeded();
    await ada.hover();
    await test.expect(q.tooltip("Ada Lovelace")).toBeVisible();
    await q.link("Grace Hopper").hover();
    await test.expect(q.tooltip("Grace Hopper")).toBeVisible();
    await q.link("3 more members").hover();
    await test.expect(q.tooltip("3 more members")).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
  });
});
