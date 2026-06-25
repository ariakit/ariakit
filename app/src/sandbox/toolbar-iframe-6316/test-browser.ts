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
}: ExpectToolbarInputNavigationParams) {
  await input.click();
  await page.keyboard.type("hi");

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
  test("ToolbarItem input navigates at text boundaries inside iframes", async ({
    page,
    q,
  }) => {
    await expectToolbarInputNavigation({
      page,
      expect: test.expect,
      input: q.textbox("Find"),
      previousItem: q.button("Bold"),
    });

    const frame = query(page.frameLocator("iframe[title='Embedded editor']"));

    await expectToolbarInputNavigation({
      page,
      expect: test.expect,
      input: frame.textbox("Find"),
      previousItem: frame.button("Bold"),
    });
  });
});
