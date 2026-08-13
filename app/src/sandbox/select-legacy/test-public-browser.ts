import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

type ShowLegacyPublicCase = (caseName: string) => Promise<void>;

const animatedCases = [
  ["public-select-animated", "Animated favorite fruit"],
  ["public-select-animated-store", "Animated store favorite fruit"],
] as const;

// examples/select-animated/test-browser.ts
// examples/select-animated-store/test-browser.ts
async function checkLegacyAnimatedSelects(
  page: Page,
  showCase: ShowLegacyPublicCase,
) {
  for (const [caseName, label] of animatedCases) {
    await showCase(caseName);
    const select = page.getByRole("combobox", { name: label });
    await select.focus();
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox", { name: label })).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(100);
    await page.keyboard.press("Escape");
    await expect(select).toBeFocused();
  }
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves animated legacy Select behavior", async ({ page }) => {
    const showCase = async (caseName: string) => {
      await page
        .getByRole("button", { name: `Show ${caseName}`, exact: true })
        .click();
    };

    await checkLegacyAnimatedSelects(page, showCase);
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow key on the closed legacy Select does not freeze the page when all following items have no value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite fruit");
    await select.click();
    await test.expect(q.option("Cherry")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Cherry")).toBeHidden();
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Cherry")).toBeVisible();
    await test.expect(q.option("Cherry")).toHaveAttribute("data-active-item");
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow keys on the closed legacy Select skip the trailing item without value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite color");
    await select.click();
    await test.expect(q.option("Green")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Green")).toBeHidden();
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Blue");
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Blue");
    await page.keyboard.press("ArrowUp");
    await test.expect(select).toContainText("Green");
  });

  // https://github.com/ariakit/ariakit/issues/6319
  test("arrow keys on the closed legacy Select with focusLoop wrap past the item without value", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-valueless-items").click();
    const select = q.combobox("Valueless favorite shape");
    await select.click();
    await test.expect(q.option("Triangle")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.option("Triangle")).toBeHidden();
    await test.expect(select).toBeFocused();
    await test.expect(select).toContainText("Triangle");
    await page.keyboard.press("ArrowDown");
    await test.expect(select).toContainText("Square");
  });

  // https://github.com/ariakit/ariakit/issues/7120
  // The authored focusOnHover callback moves the composite from inside the
  // predicate. While the select is collapsed, the callback must not run at
  // all, or the move would still activate the item, commit its value, and
  // steal focus from the unrelated control.
  test("a side-effectful focusOnHover callback does nothing on a collapsed list", async ({
    page,
    q,
  }) => {
    await q.button("Show public-select-collapsed-hover").click();
    const select = q.combobox("Collapsed hover fruit");
    const grape = q.option("Grape");
    const other = q.button("Collapsed hover other control");

    await other.click();
    await test.expect(other).toBeFocused();

    await grape.hover();

    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    // Hover activation is committed inside the mousemove handler, so there
    // is no positive state to wait for. Cross the frames a presentation
    // would use to reach the item before asserting that none did.
    await flushFrames(page);
    await test.expect(grape).not.toHaveAttribute("data-active-item");
    await test.expect(select).toContainText("Apple");
    await test.expect(other).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7120
  // The gate is about the closed list: the same side-effectful callback
  // keeps working once the select opens.
  test("the same callback activates the option once the select opens", async ({
    q,
  }) => {
    await q.button("Show public-select-collapsed-hover").click();
    const select = q.combobox("Collapsed hover fruit");
    const grape = q.option("Grape");

    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await grape.hover();

    await test.expect(grape).toHaveAttribute("data-active-item");
  });
});
