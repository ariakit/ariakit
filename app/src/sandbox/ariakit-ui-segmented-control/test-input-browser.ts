import { withFramework } from "#app/test-utils/preview.ts";

// The input fills the segment in every engine, so a tooltip and keyboard
// scrolling follow the whole segment. WebKit doesn't stretch an input with
// inset alone.
withFramework(import.meta.dirname, async ({ query, test }) => {
  test("shows a tooltip when the pointer is on an icon-only segment", async ({
    q,
  }) => {
    const segment = query(q.radiogroup("Icon only")).radio("Grid");
    await segment.scrollIntoViewIfNeeded();
    await segment.locator("xpath=ancestor::label").hover();
    await test.expect(q.tooltip("Grid")).toBeVisible();
  });

  test("shows the tooltip of the icon-only segment that takes keyboard focus", async ({
    page,
    q,
  }) => {
    const segments = query(q.radiogroup("Icon only"));
    await segments.radio("List").focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(segments.radio("Grid")).toBeChecked();
    await test.expect(q.tooltip("Grid")).toBeVisible();
  });

  test("scrolls a narrow group to the whole focused segment", async ({
    page,
    q,
  }) => {
    const group = q.radiogroup("Narrow");
    const segments = query(group);
    await segments.radio("List").focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const board = segments.radio("Board");
    await test.expect(board).toBeChecked();
    await test.expect
      .poll(() =>
        board.evaluate((input) => {
          const label = input.closest("label");
          const parent = label?.parentElement;
          if (!label || !parent) return Number.POSITIVE_INFINITY;
          const labelEnd = label.getBoundingClientRect().right;
          return labelEnd - parent.getBoundingClientRect().right;
        }),
      )
      .toBeLessThanOrEqual(0);
  });
});
