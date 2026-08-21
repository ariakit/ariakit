import { withFramework } from "#app/test-utils/preview.ts";

// happy-dom implements no document named getter, so only a real browser makes
// the form answer the `activeElement` read. The three desktop projects all
// reproduce it.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7230
  test("follows the selected tab with focus past a named activeElement form", async ({
    page,
    q,
  }) => {
    const focusHistory = q.status("Focus history");
    await test.expect(focusHistory).toHaveText("none");

    await q.tab("Overview").click();
    await test.expect(focusHistory).toHaveText("Overview");

    await page.keyboard.press("3");

    await test
      .expect(q.tab("Billing"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(focusHistory).toHaveText("Overview → Billing");
  });
});
