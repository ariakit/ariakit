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

  // A tap sends its mousedown after the finger lifts, before the focus, and a
  // text field that a tap focuses matches :focus-visible.
  test("focuses a field with a tap without scrolling the row", async ({
    q,
  }) => {
    const box = query(q.article("Row with fields"));
    const viewport = box.group("Fields");
    const field = box.textbox("Company");
    const getScrollLeft = () => viewport.evaluate((node) => node.scrollLeft);
    // A phone shows only the first fields, so the row scrolls, as a swipe
    // would, until the start of the field shows just before the end fade.
    await viewport.evaluate((node) => {
      const item = node.querySelector("[aria-label='Company']");
      if (!item) return;
      const box = node.getBoundingClientRect();
      const offset = item.getBoundingClientRect().left - box.left;
      node.scrollBy({
        left: offset - (node.clientWidth - 48),
        behavior: "instant",
      });
    });
    const scrollLeft = await getScrollLeft();
    test.expect(scrollLeft).toBeGreaterThan(0);
    await field.tap({ position: { x: 8, y: 8 } });
    await test.expect(field).toBeFocused();
    test.expect(await getScrollLeft()).toBe(scrollLeft);
  });

  test("shows the slide buttons on every device", async ({ q }) => {
    const box = query(q.article("Slides"));
    await test.expect(box.button("Previous slide")).toBeVisible();
    await test.expect(box.button("Next slide")).toBeVisible();
  });
});
