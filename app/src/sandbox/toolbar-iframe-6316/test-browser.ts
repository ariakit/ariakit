import type {
  Locator,
  Page,
  expect as playwrightExpect,
} from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Expect = typeof playwrightExpect;

interface ExpectToolbarInputNavigationParams {
  page: Page;
  expect: Expect;
  input: Locator;
  previousItem: Locator;
  nextItem: Locator;
}

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

async function expectToolbarInputNavigation({
  page,
  expect,
  input,
  previousItem,
  nextItem,
}: ExpectToolbarInputNavigationParams) {
  await input.click();
  await page.keyboard.type("hi");
  await setSelection(input, 0);

  await page.keyboard.press("ArrowRight");

  await expect(input).toBeFocused();
  await expect.poll(() => getSelectionStart(input)).toBe(1);

  await page.keyboard.press("ArrowRight");

  await expect(input).toBeFocused();
  await expect.poll(() => getSelectionStart(input)).toBe(2);

  await page.keyboard.press("ArrowRight");

  await expect(nextItem).toBeFocused();

  await input.focus();
  await setSelection(input, 2);
  await page.keyboard.press("ArrowLeft");

  await expect(input).toBeFocused();
  await expect.poll(() => getSelectionStart(input)).toBe(1);

  await page.keyboard.press("ArrowLeft");

  await expect(input).toBeFocused();
  await expect.poll(() => getSelectionStart(input)).toBe(0);

  await page.keyboard.press("ArrowLeft");

  await expect(previousItem).toBeFocused();
}

// https://github.com/ariakit/ariakit/issues/6316
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("ToolbarItem input navigates at text boundaries in the parent document", async ({
    page,
    q,
  }) => {
    await expectToolbarInputNavigation({
      page,
      expect: test.expect,
      input: q.textbox("Find"),
      previousItem: q.button("Bold"),
      nextItem: q.button("Italic"),
    });
  });

  test("ToolbarItem input navigates at text boundaries inside iframes", async ({
    page,
  }) => {
    // Keep this isolated from the parent-document control so the test enters
    // the iframe the same way a user would in the reported reproduction.
    const frame = query(page.frameLocator("iframe[title='Embedded editor']"));

    await expectToolbarInputNavigation({
      page,
      expect: test.expect,
      input: frame.textbox("Find"),
      previousItem: frame.button("Bold"),
      nextItem: frame.button("Italic"),
    });
  });
});
