import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const direction of ["LTR", "RTL"]) {
    const label = `${direction} Provider end`;
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781708
    test(`keeps ${label} at the viewport edge in a mobile portal`, async ({
      q,
      page,
    }) => {
      const toggle = q.button(`Toggle ${label}`);
      await test.expect(toggle).toHaveAttribute("aria-haspopup", "dialog");
      await toggle.click();
      const panel = q.dialog(`${label} panel`, { includeHidden: true });
      await test.expect(panel).toBeVisible();
      await test.expect(panel).toHaveCSS("translate", "none");
      await test.expect(panel).toHaveCSS("border-inline-start-width", "1px");
      await test.expect(panel).toHaveCSS("border-inline-end-width", "0px");
      await test.expect
        .poll(async () => {
          const box = await panel.boundingBox();
          const viewport = page.viewportSize();
          if (!box || !viewport) return Infinity;
          return direction === "LTR"
            ? box.x + box.width - viewport.width
            : box.x;
        })
        .toBeCloseTo(0, 0);
      await test
        .expect(panel)
        .toHaveCSS("height", `${page.viewportSize()?.height}px`);

      await q.button(`Close ${label}`).click();
      await test
        .expect(panel)
        .toHaveCSS("translate", direction === "LTR" ? "100%" : "-100%");
      await test.expect(panel).toBeHidden();
    });
  }
});
