import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function commitComposition(page: Page, text: string) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.imeSetComposition", {
    text,
    selectionStart: text.length,
    selectionEnd: text.length,
  });
  await page.keyboard.press("Enter");
}

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/6300
  test("keeps focus in the field after Backspace clears the field first", async ({
    page,
    q,
  }) => {
    const container = q.group("Font family");
    const input = q.textbox("Font family");

    await q.button("Before filled toolbar").focus();
    await page.keyboard.press("Tab");

    await test.expect(container).toBeFocused();
    await page.keyboard.press("Backspace");
    await test.expect(input).toHaveValue("");
    await test.expect(container).toBeFocused();

    await page.keyboard.press("Backspace");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("a");

    await test.expect(input).toHaveValue("a");
    await test.expect(input).toBeFocused();
  });

  // Reproduces https://github.com/ariakit/ariakit/issues/6579
  test("keeps focus in the field on composing Enter", async ({ page, q }) => {
    const input = q.textbox("Message");

    await input.focus();
    await test.expect(input).toBeFocused();

    await commitComposition(page, "に");

    await test.expect(input).toHaveValue(/に/);
    await test.expect(input).toBeFocused();
  });
});
