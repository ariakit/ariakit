import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function setSelection(input: Locator, start: number, end = start) {
  await input.evaluate(
    (element, range) => {
      if (!(element instanceof HTMLInputElement)) {
        throw new Error("Expected an input element");
      }
      const input = element;
      input.setSelectionRange(range.start, range.end);
    },
    { start, end },
  );
}

function getSelectionStart(input: Locator) {
  return input.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) {
      throw new Error("Expected an input element");
    }
    return element.selectionStart;
  });
}

// https://github.com/ariakit/ariakit/issues/6316
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("ToolbarItem input navigates at text boundaries in the parent document", async ({
    page,
    q,
  }) => {
    const input = q.textbox("Find");
    const previousItem = q.button("Bold");
    const nextItem = q.button("Italic");

    await input.click();
    await page.keyboard.type("hi");
    await setSelection(input, 0);

    await page.keyboard.press("ArrowRight");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(1);

    await page.keyboard.press("ArrowRight");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(2);

    await page.keyboard.press("ArrowRight");

    await test.expect(nextItem).toBeFocused();

    await input.focus();
    await setSelection(input, 2);
    await page.keyboard.press("ArrowLeft");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(1);

    await page.keyboard.press("ArrowLeft");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(0);

    await page.keyboard.press("ArrowLeft");

    await test.expect(previousItem).toBeFocused();
  });

  test("ToolbarItem input navigates at text boundaries inside iframes", async ({
    page,
  }) => {
    // Keep this isolated from the parent-document control so the test enters
    // the iframe the same way a user would in the reported reproduction.
    const frame = query(page.frameLocator("iframe[title='Embedded editor']"));
    const input = frame.textbox("Find");
    const previousItem = frame.button("Bold");
    const nextItem = frame.button("Italic");

    await input.click();
    await page.keyboard.type("hi");
    await setSelection(input, 0);

    await page.keyboard.press("ArrowRight");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(1);

    await page.keyboard.press("ArrowRight");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(2);

    await page.keyboard.press("ArrowRight");

    await test.expect(nextItem).toBeFocused();

    await input.focus();
    await setSelection(input, 2);
    await page.keyboard.press("ArrowLeft");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(1);

    await page.keyboard.press("ArrowLeft");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(0);

    await page.keyboard.press("ArrowLeft");

    await test.expect(previousItem).toBeFocused();
  });
});
