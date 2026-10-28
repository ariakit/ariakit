import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7099
  // Nothing here is a composite, so this pins the modality rule on a plain
  // Focusable rather than on composite navigation.
  test("shows focus-visible on a modified navigation key", async ({
    page,
    q,
  }) => {
    const button = q.button("Button");

    await button.click();
    await test.expect(button).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(button).not.toHaveAttribute("data-focus-visible");

    await page.keyboard.press("Alt+ArrowDown");

    await test.expect(button).toHaveAttribute("data-focus-visible", "true");
  });
});
