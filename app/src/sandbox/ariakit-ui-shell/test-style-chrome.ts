import { withFramework } from "#app/test-utils/preview.ts";
import { largestStyleRecalculation } from "#app/test-utils/style.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8026
  // A Chromium bug can make some page loads restyle the whole main content, so
  // this test can fail intermittently until it is fixed.
  // https://github.com/ariakit/ariakit/issues/8084
  // https://issues.chromium.org/issues/577199085
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
