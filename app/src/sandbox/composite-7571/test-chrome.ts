import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/7572#discussion_r4067324712
  test("mounts a synchronized provider without Object.hasOwn", async ({
    page,
    q,
  }) => {
    // Load the real components without this newer JavaScript built-in.
    await page.addInitScript(() => {
      Reflect.deleteProperty(Object, "hasOwn");
    });
    await gotoAndSettle(page, page.url());
    await page.waitForFunction(isPreviewHydrated);
    await q.button("Focus italic").click();
    await test.expect(q.button("Italic", { exact: true })).toBeFocused();
  });
});
