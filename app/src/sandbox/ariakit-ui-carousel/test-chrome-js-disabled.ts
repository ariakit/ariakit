import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup. The fades and the row
// buttons come from scroll-driven animations, so the first paint already shows
// where more content lies.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("shows the fades and buttons of a row with no script", async ({ q }) => {
    const box = query(q.article("Filter row"));
    const row = box.toolbar("Filters");
    await test.expect(row).toBeVisible();
    await test
      .expect(box.button("Scroll forward", { includeHidden: true }))
      .toBeVisible();
    await test
      .expect(box.button("Scroll backward", { includeHidden: true }))
      .toBeHidden();
    // The end fades while the start, where nothing lies, stays opaque.
    const mask = await row.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        start: style.getPropertyValue("--carousel-start"),
        end: style.getPropertyValue("--carousel-end"),
      };
    });
    test.expect(Number(mask.start)).toBe(0);
    test.expect(Number(mask.end)).toBe(1);
  });

  // The tabs come from the markup, so the first paint already has them, and
  // nothing moves when script runs.
  test("renders the slide tabs with no script", async ({ q }) => {
    const box = query(q.article("Slides"));
    const tabs = query(box.tablist("Slides"));
    await test.expect(tabs.tab()).toHaveCount(7);
    await test
      .expect(tabs.tab("Slide 1"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(tabs.tab("Slide 2"))
      .toHaveAttribute("aria-selected", "false");
  });
});
