import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // On Safari, Focusable adds an explicit tabindex="0" to native buttons and
  // button-like inputs so they receive focus on mousedown. The detection reads
  // the DOM element, so it must re-run when the render prop swaps the element
  // type. https://github.com/ariakit/ariakit/issues/6336
  test("native button keeps the Safari tabindex after swapping from a custom element", async ({
    q,
  }) => {
    const button = q.button("Save");

    await test.expect(button).toBeVisible();

    await q.button("Use native save").click();

    await test.expect(button).toHaveAttribute("type", "button");
    await test.expect(button).toHaveAttribute("tabindex", "0");
  });
});
