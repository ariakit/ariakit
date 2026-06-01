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

async function setSelectionToEnd(input: Locator) {
  await input.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) {
      throw new Error("Expected an input element");
    }
    const input = element;
    input.setSelectionRange(input.value.length, input.value.length);
  });
}

function getSelectionStart(input: Locator) {
  return input.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) {
      throw new Error("Expected an input element");
    }
    return element.selectionStart;
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("ToolbarContainer keeps its inner input out of the tab order until opened", async ({
    page,
    q,
  }) => {
    const container = q.group("Font family");
    const input = q.textbox("Font family");

    await q.button("Before toolbar").focus();
    await page.keyboard.press("Tab");

    await test.expect(container).toBeFocused();
    await test.expect(input).not.toBeFocused();

    await page.keyboard.press("a");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(container).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(input).toBeFocused();

    await page.keyboard.press("Enter");
    await test.expect(container).toBeFocused();
  });

  test("ToolbarItem rendered as input navigates only at text boundaries", async ({
    page,
    q,
  }) => {
    const container = q.group("Font family");
    const input = q.textbox("Text size");
    const apply = q.button("Apply");

    await input.focus();
    await setSelection(input, 1);

    await page.keyboard.press("ArrowRight");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(2);

    await setSelectionToEnd(input);
    await page.keyboard.press("ArrowRight");

    await test.expect(apply).toBeFocused();

    await input.focus();
    await setSelection(input, 1);

    await page.keyboard.press("ArrowLeft");

    await test.expect(input).toBeFocused();
    await test.expect.poll(() => getSelectionStart(input)).toBe(0);

    await setSelection(input, 0);
    await page.keyboard.press("ArrowLeft");

    await test.expect(container).toBeFocused();
  });

  test("vertical toolbar moves with up and down arrows only", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Vertical formatting");
    const moveUp = q.button("Move up");
    const moveDown = q.button("Move down");

    await test.expect(toolbar).toHaveAttribute("aria-orientation", "vertical");

    await moveUp.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(moveUp).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await test.expect(moveDown).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await test.expect(moveDown).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await test.expect(moveUp).toBeFocused();
  });
});
