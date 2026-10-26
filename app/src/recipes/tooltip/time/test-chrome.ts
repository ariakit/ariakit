import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the exact time of a relative time", async ({ q }) => {
    const link = q.link("3 hours ago");
    await test
      .expect(link)
      .toHaveAccessibleDescription("October 25, 2026 at 12:10 PM");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await test.expect(q.tooltip("October 25, 2026 at 12:10 PM")).toBeVisible();
    await test.expect(q.link("yesterday")).toBeVisible();
    await test.expect(q.link("7 days ago")).toBeVisible();
  });
});
