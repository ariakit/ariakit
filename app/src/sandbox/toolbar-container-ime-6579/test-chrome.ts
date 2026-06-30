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

// Reproduces https://github.com/ariakit/ariakit/issues/6579
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps focus in the field on composing Enter", async ({ page, q }) => {
    const input = q.textbox("Message");

    await input.focus();
    await test.expect(input).toBeFocused();

    await commitComposition(page, "に");

    await test.expect(input).toHaveValue(/に/);
    await test.expect(input).toBeFocused();
  });
});
