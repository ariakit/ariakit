import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  const pressEscapeOnce = async (page: Page, label: string) => {
    const closeRequests = query(page).text(
      new RegExp(`^${label} close requests: `),
    );
    await test.expect(closeRequests).toHaveText(`${label} close requests: 0`);
    await page.keyboard.press("Escape");
    await test.expect(closeRequests).toHaveText(`${label} close requests: 1`);
    // Hovercard, which Menu and Tooltip are based on, can request a close again
    // two animation frames after Escape. The count must stay the same after
    // them.
    await flushFrames(page, 2);
    await test.expect(closeRequests).toHaveText(`${label} close requests: 1`);
  };

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape requests one close in Menu", async ({ page, q }) => {
    await q.button("Actions").click();
    await test.expect(q.menu("Actions")).toBeVisible();
    await pressEscapeOnce(page, "Actions");
    await test.expect(q.menu("Actions")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape requests one close in Hovercard", async ({ page, q }) => {
    const anchor = q.link("@ariakit");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(q.dialog("Ariakit profile")).toBeVisible();
    await pressEscapeOnce(page, "Profile");
    await test.expect(q.dialog("Ariakit profile")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  test("Escape requests one close in Tooltip", async ({ page, q }) => {
    await q.button("Bold").focus();
    await test.expect(q.tooltip("Make the text bold")).toBeVisible();
    await pressEscapeOnce(page, "Bold");
    await test.expect(q.tooltip("Make the text bold")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in ComboboxSelect", async ({ page, q }) => {
    await q.combobox("Fruit").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Fruit");
    await test.expect(q.listbox("Fruit")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in Select", async ({ page, q }) => {
    await q.combobox("Dessert").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Dessert");
    await test.expect(q.listbox("Dessert")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in Combobox with an active item", async ({
    page,
    q,
  }) => {
    await q.combobox("Snack").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Snack");
    await test.expect(q.listbox("Snack")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in ComboboxSelect with ComboboxInput", async ({
    page,
    q,
  }) => {
    await q.combobox("Smoothie").click();
    await test.expect(q.combobox("Search fruits")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Smoothie");
    await test.expect(q.listbox()).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7622
  // https://github.com/ariakit/ariakit/issues/7623
  test("Escape requests one close in Menu with Combobox", async ({
    page,
    q,
  }) => {
    await q.button("Add block").click();
    await test.expect(q.combobox("Search blocks")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.option("Paragraph"))
      .toHaveAttribute("data-active-item");
    await pressEscapeOnce(page, "Add block");
    // A menu with a combobox has the dialog role.
    await test.expect(q.dialog("Add block")).toBeVisible();
  });
});
