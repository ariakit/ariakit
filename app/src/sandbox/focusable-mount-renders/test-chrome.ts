import { withFramework } from "#app/test-utils/preview.ts";

// Chrome-specific: on Safari, Focusable renders native buttons a second time
// on mount to set an explicit tabIndex (Safari doesn't focus buttons on
// mousedown), so the button render count differs there by design.
withFramework(import.meta.dirname, async ({ test }) => {
  test("focusable elements render once on mount for expected tags", async ({
    q,
  }) => {
    // The button's tag traits match the optimistic defaults, so the tag
    // detection effect bails out without an extra render.
    await test.expect(q.status("Button renders")).toHaveText("1");
    // The plain div's traits differ from the defaults, so it still pays the
    // post-mount correction render.
    await test.expect(q.status("Div renders")).toHaveText("2");
    // The hinted div's traits are seeded from unstable_defaultTagName, so it
    // skips the correction render just like native tags.
    await test.expect(q.status("Hinted div renders")).toHaveText("1");
  });
});
