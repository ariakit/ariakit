import { withFramework } from "#app/test-utils/preview.ts";
import { largestStyleRecalculation } from "#app/test-utils/style.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8026
  test("keeps main content styles cached when a sidebar closes and opens", async ({
    page,
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    const sidebar = q.navigation("Documentation");
    const contentCount = await q.main().locator("*").count();
    const closing = await largestStyleRecalculation(page, () => toggle.click());
    await test.expect(sidebar).toBeHidden();
    const opening = await largestStyleRecalculation(page, () => toggle.click());
    await test.expect(sidebar).toBeVisible();
    test.expect(closing).toBeLessThan(contentCount);
    test.expect(opening).toBeLessThan(contentCount);
  });
});
