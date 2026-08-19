import { withFramework } from "#app/test-utils/preview.ts";

// `Dialog` keeps its element mounted while closed, and the `isSafariBrowser`
// effect that tracks the last mousedown resolves the document at mount, so
// Safari reaches the realm helpers before the dialog is ever opened.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7201
  test("opens a form dialog whose control is named self", async ({ q }) => {
    await q.button("Add coverage").click();
    await test.expect(q.dialog("Add coverage")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7201
  //
  // A second control named `document` makes the form answer the document lookup
  // with that control instead of leaving it unanswered, which fails inside the
  // same helpers for a different reason.
  test("opens a form dialog whose controls are named self and document", async ({
    q,
  }) => {
    await q.button("Add coverage with proof").click();
    await test.expect(q.dialog("Add coverage with proof")).toBeVisible();

    await q.button("Cancel").click();
    await test.expect(q.button("Add coverage with proof")).toBeFocused();
  });
});
