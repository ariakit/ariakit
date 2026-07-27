import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function selectText(page: Page, text: string) {
  return page.evaluate((selectedText) => {
    const paragraph = document.querySelector("p");
    const content = paragraph?.firstChild;
    if (!paragraph) return;
    if (!content?.textContent) return;
    const start = content.textContent.indexOf(selectedText);
    if (start < 0) return;
    const range = document.createRange();
    range.setStart(content, start);
    range.setEnd(content, start + selectedText.length);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
    paragraph.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, text);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows and hides on text selection", async ({ page, q }) => {
    await test.expect(q.dialog()).not.toBeVisible();
    await selectText(page, "dolor, sit");
    await test.expect(q.dialog()).toBeVisible();
    await q.text(/^Lorem ipsum/).click();
    await test.expect(q.dialog()).not.toBeVisible();
  });

  test("tabs backward into the selection popover", async ({ page, q }) => {
    await selectText(page, "amet");
    await test.expect(q.dialog()).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.dialog()).toBeVisible();
    await test.expect(q.button("Share")).toBeFocused();
  });

  test("keeps the popover open when its button is clicked", async ({
    page,
    q,
  }) => {
    await selectText(page, "maxime.");
    await test.expect(q.dialog()).toBeVisible();
    await q.button("Bookmark").click();
    await test.expect(q.dialog()).toBeVisible();
    await test.expect(q.button("Bookmark")).toBeFocused();
  });
});
