import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the row through ordinary cells and paints pinned cells", async ({
    q,
  }) => {
    const row = q.row();
    const ordinary = q.text("Row surface");
    const pinned = q.text("Pinned name");
    const custom = q.text("Custom surface");
    const modified = q.text("Modified surface");
    const disabled = q.text("Disabled surface");
    const selected = q.checkbox("Select row");
    // Transparent layers retain their color channels and serialize as OKLCH.
    const transparentColor = /^(?:rgba\(.+, 0\)|oklch\(.+ \/ 0\))$/;
    const expectRowSurface = async () => {
      await test
        .expect(ordinary)
        .toHaveCSS("background-color", transparentColor);
      await test
        .expect(disabled)
        .toHaveCSS("background-color", transparentColor);
      await test.expect
        .poll(async () => {
          const rowBackground = await row.evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          );
          const pinnedBackground = await pinned.evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          );
          return pinnedBackground === rowBackground;
        })
        .toBe(true);
    };
    await test.expect(ordinary).toBeVisible();
    await expectRowSurface();
    const restingBackground = await row.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await test.expect(pinned).toHaveCSS("background-color", restingBackground);
    await test
      .expect(custom)
      .not.toHaveCSS("background-color", restingBackground);
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974548937
    await test
      .expect(modified)
      .not.toHaveCSS("background-color", transparentColor);
    await test
      .expect(modified)
      .not.toHaveCSS("background-color", restingBackground);

    await ordinary.hover();
    await test.expect(row).not.toHaveCSS("background-color", restingBackground);
    await expectRowSurface();

    await selected.check();
    await test.expect(row).toHaveAttribute("aria-selected", "true");
    await test.expect(row).not.toHaveCSS("background-color", restingBackground);
    await expectRowSurface();
  });
});
