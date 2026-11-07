import { withFramework } from "#app/test-utils/preview.ts";

// A phone has no fine pointer. Rows scroll by touch, and a classic carousel
// keeps its controls, as the carousel pattern needs on every device.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("hides the row buttons without a fine pointer", async ({ q }) => {
    const box = query(q.article("Filter row"));
    const row = box.toolbar("Filters");
    // The row overflows, so only the pointer keeps the buttons hidden.
    await test.expect
      .poll(() => row.evaluate((node) => node.scrollWidth > node.clientWidth))
      .toBe(true);
    await test
      .expect(box.button("Scroll forward", { includeHidden: true }))
      .toBeHidden();
    await test
      .expect(box.button("Scroll backward", { includeHidden: true }))
      .toBeHidden();
  });

  test("shows the slide buttons on every device", async ({ q }) => {
    const box = query(q.article("Slides"));
    await test.expect(box.button("Previous slide")).toBeVisible();
    await test.expect(box.button("Next slide")).toBeVisible();
  });
});
