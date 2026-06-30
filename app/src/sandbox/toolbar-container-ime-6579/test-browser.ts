import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function pressComposingEnter(input: Locator) {
  return input.evaluate((element) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      isComposing: true,
    });
    return element.dispatchEvent(event);
  });
}

// Reproduces https://github.com/ariakit/ariakit/issues/6579
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps focus in the field when Enter commits IME composition", async ({
    q,
  }) => {
    const input = q.textbox("Message");

    await input.focus();
    await test.expect(input).toBeFocused();

    const defaultAllowed = await pressComposingEnter(input);

    await test.expect(input).toBeFocused();
    test.expect(defaultAllowed).toBe(true);
  });
});
