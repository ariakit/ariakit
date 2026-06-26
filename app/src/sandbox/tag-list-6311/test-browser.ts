import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6311
withFramework(import.meta.dirname, async ({ test }) => {
  test("focuses the input and stays responsive when clicking non-focusable content inside a display:contents wrapper", async ({
    page,
    q,
  }) => {
    // Clicking the non-focusable label used to freeze the page: TagList's
    // mousedown handler calls getClosestFocusable, which spun forever on the
    // display: contents wrapper that matches the focusable selector but fails
    // isFocusable. A frozen renderer makes this click time out.
    await q.text("Frontend:").click();

    // Focus moves to the tag input (TagList's documented mousedown behavior).
    await test.expect(q.textbox("New tag")).toBeFocused();

    // The page is still responsive: a new tag can be added through the input.
    await page.keyboard.type("TypeScript,");
    await test
      .expect(q.text("Tags: JavaScript, React, TypeScript"))
      .toBeVisible();
  });
});
