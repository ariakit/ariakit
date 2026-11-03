import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the width and the name during the feedback", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy link");
    const label = query(copy).text("Copy link");
    const feedback = query(copy).text("Copied");
    await test.expect(label).toHaveCSS("opacity", "1");
    await test.expect(feedback).toHaveCSS("opacity", "0");
    const before = await copy.boundingBox();
    await copy.click();
    await test.expect(q.status().first()).toHaveText("Copied");
    // Both texts stay in the button, so only their opacity tells them apart.
    await test.expect(label).toHaveCSS("opacity", "0");
    await test.expect(feedback).toHaveCSS("opacity", "1");
    await test.expect(copy).toHaveAccessibleName("Copy link");
    const after = await copy.boundingBox();
    test.expect(after?.width).toBe(before?.width);
    // Both texts render at all times, so the width above stays the same even
    // without the grid. Only a shared box proves that they share a cell.
    test
      .expect(await feedback.boundingBox())
      .toEqual(await label.boundingBox());
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("https://ariakit.com/invite/7f3k2");
  });

  test("doesn't show a tooltip", async ({ page, q }) => {
    const copy = q.button("Copy link");
    // Ariakit resets hover intent on scroll, so the button must be in view
    // before the pointer moves over it.
    await copy.scrollIntoViewIfNeeded();
    await copy.hover();
    // A tooltip would show after its hover delay of 500ms, and no state tracks
    // that delay while the tooltip stays absent.
    await page.waitForTimeout(600);
    await test.expect(q.tooltip()).toHaveCount(0);
  });
});
