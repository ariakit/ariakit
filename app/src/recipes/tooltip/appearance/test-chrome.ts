import { withFramework } from "#app/test-utils/preview.ts";
import { tooltips } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows a tooltip for each button", async ({ q }) => {
    for (const { button, text } of tooltips) {
      const anchor = q.button(button);
      // Ariakit resets hover intent on scroll, so the anchor must be in view
      // before the pointer moves over it.
      await anchor.scrollIntoViewIfNeeded();
      await anchor.hover();
      await test.expect(q.tooltip(text)).toBeVisible();
    }
  });
});
