import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("shows the feedback in the label and keeps the width", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy link");
    await test.expect(query(copy).text("Copy link")).toBeVisible();
    await test.expect(query(copy).text("Copied")).toBeHidden();
    const before = await copy.boundingBox();
    await copy.click();
    // The feedback names the button while it shows.
    const copied = q.button("Copied");
    const label = query(copied).text("Copy link");
    const feedback = query(copied).text("Copied");
    await test.expect(feedback).toBeVisible();
    await test.expect(label).toBeHidden();
    const after = await copied.boundingBox();
    test.expect(after?.width).toBe(before?.width);
    // Both texts render at all times, so the width above stays the same even
    // without the grid. Only a shared box proves that they share a cell.
    test
      .expect(await feedback.boundingBox())
      .toEqual(await label.boundingBox());
    const text = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(text).toBe("https://ariakit.com/invite/7f3k2");
    await test.expect(copy).toBeVisible({ timeout: 4000 });
  });

  test("reports the copy on a short label with a longer name", async ({
    context,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = q.button("Copy URL");
    await test.expect(copy).toBeVisible();
    await copy.click();
    await test.expect(q.button("Copied")).toBeVisible();
    await test.expect(copy).toHaveCount(0);
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
