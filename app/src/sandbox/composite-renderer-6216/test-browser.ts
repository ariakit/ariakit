import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6216
withFramework(import.meta.dirname, async ({ test }) => {
  test("vertical renderer measures a horizontal group's height along the parent axis", async ({
    q,
  }) => {
    // "group" is a horizontal group of five 140px columns rendered one row tall.
    // Its height must be measured from the rendered element (40px), so the row
    // after it sits at 40 * 3 = 120px. Before the fix, the renderer summed the
    // columns' widths (700px) as the group's height, pushing "row-3" to 780px.
    // The group itself stays at 40 * 2 = 80px, anchoring the rows before it.
    await test.expect(q.button("group")).toHaveCSS("top", "80px");
    await test.expect(q.button("row-3")).toHaveCSS("top", "120px");
  });

  test("nested cross-oriented group is sized by its largest child extent", async ({
    q,
  }) => {
    // "nested-group" wraps a horizontal group whose columns are 28px and 36px
    // tall. Measured through metadata alone, the group's height is the largest
    // column extent (36px), so "nested-row-2" sits at 40 + 36 = 76px. Before the
    // fix it summed the columns' widths (280px), pushing it to 320px.
    await test.expect(q.button("nested-row-2")).toHaveCSS("top", "76px");
  });
});
