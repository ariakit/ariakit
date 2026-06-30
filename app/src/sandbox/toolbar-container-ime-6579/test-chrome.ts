import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface WindowWithDefaultPrevented extends Window {
  defaultPrevented?: boolean;
}

function trackDefaultPrevented(input: Locator) {
  return input.evaluate((element) => {
    const win = element.ownerDocument.defaultView as WindowWithDefaultPrevented;
    win.defaultPrevented = undefined;
    element.addEventListener(
      "keydown",
      (event) => {
        queueMicrotask(() => {
          win.defaultPrevented = event.defaultPrevented;
        });
      },
      { once: true },
    );
  });
}

async function commitComposition(page: Page, text: string) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.imeSetComposition", {
    text,
    selectionStart: text.length,
    selectionEnd: text.length,
  });
  await page.keyboard.press("Enter");
}

function getDefaultPrevented(page: Page) {
  return page.evaluate(() => {
    const win = window as WindowWithDefaultPrevented;
    return win.defaultPrevented;
  });
}

// Reproduces https://github.com/ariakit/ariakit/issues/6579
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps focus in the field when Enter commits IME composition", async ({
    page,
    q,
  }) => {
    const input = q.textbox("Message");

    await input.focus();
    await test.expect(input).toBeFocused();
    await trackDefaultPrevented(input);

    await commitComposition(page, "に");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getDefaultPrevented(page)).toBe(false);
  });
});
