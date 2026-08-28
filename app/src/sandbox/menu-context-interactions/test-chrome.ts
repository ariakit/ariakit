import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // The dialog names the focused control as a fallback disclosure, but that
  // control isn't a menu button and can't be assumed to close the menu, so the
  // menu keeps the fallback dismiss button. The happy-dom duplicate also
  // asserts that the control stays out of the modal context, which Playwright
  // can't express because its queries ignore `inert`. Safari reaches the
  // capture through a different branch, since it leaves `BODY` as the active
  // element for a native button without an explicit tab index, and giving the
  // button one here would move this test off the branch it covers.
  // https://github.com/ariakit/ariakit/issues/4270
  test("context menu opened from a focused control keeps a dismiss button", async ({
    q,
  }) => {
    await q.button("Open menu").click();
    const menu = q.menu();
    await test.expect(menu).toBeVisible();
    await test.expect(query(menu).button("Dismiss popup")).toBeVisible();
  });
});
