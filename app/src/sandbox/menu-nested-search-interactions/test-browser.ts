import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("pointer and keyboard open and hide the searchable menu", async ({
    page,
    q,
  }) => {
    const button = q.button("Actions");
    await button.click();
    await test.expect(q.dialog("Actions")).toBeVisible();
    await test.expect(q.combobox("Search actions...")).toBeFocused();
    await button.click();
    await test.expect(q.dialog("Actions")).not.toBeVisible();
    await test.expect(button).toBeFocused();

    await button.press("Enter");
    await test.expect(q.option("Ask AI")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Actions")).not.toBeVisible();
    await test.expect(button).toBeFocused();
  });

  test("filters grouped options in their active order", async ({ page, q }) => {
    await q.button("Actions").click();
    await q.combobox("Search actions...").pressSequentially("de");
    await test.expect(q.option("Default checked")).toBeFocused();
    await test
      .expect(q.option("Default checked"))
      .toHaveAttribute("data-active-item", "true");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Default background checked")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Delete")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Code not checked")).toBeFocused();
  });

  test("resets its filter after outside dismissal", async ({ page, q }) => {
    const button = q.button("Actions");
    await button.click();
    await q.combobox("Search actions...").pressSequentially("a");
    await test.expect(q.combobox("Search actions...")).toHaveValue("a");
    await page.mouse.click(4, 4);
    await test.expect(q.dialog("Actions")).not.toBeVisible();
    await test.expect(button).not.toBeFocused();
    await button.click();
    await test.expect(q.combobox("Search actions...")).toHaveValue("");
  });

  test("opens, traverses, and closes a searchable submenu", async ({
    page,
    q,
  }) => {
    const button = q.button("Actions");
    await button.click();
    const option = q.option("Turn into page in");
    await option.hover();
    await test.expect(option).toBeFocused();
    await test.expect(option).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.dialog("Turn into page in")).toBeVisible();
    await page.mouse.move(4, 4);
    await test.expect(option).toBeFocused();
    await test.expect(option).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.combobox("Search actions...")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.combobox("Search pages to add in...")).toBeFocused();
    await test.expect(q.option("Private pages")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.dialog("Turn into page in")).not.toBeVisible();
    await test.expect(option).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowUp");
    await q.option("Yearly Goals").hover();
    await page.keyboard.press("ArrowDown");
    await q.option("Private pages").hover();
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    await test.expect(q.dialog("Actions")).not.toBeVisible();
  });

  test("Tab and Shift+Tab cross the nested search boundary", async ({
    page,
    q,
  }) => {
    await q.button("Actions").click();
    await q.option("Turn into page in").click();
    await page.keyboard.press("Tab");
    await test.expect(q.combobox("Search pages to add in...")).toBeFocused();
    await test.expect(q.option("Private pages")).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.option("Turn into page in")).toBeFocused();
    await test.expect(q.combobox("Search actions...")).toBeFocused();
    await test.expect(q.dialog("Turn into page in")).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(q.combobox("Search pages to add in...")).toBeFocused();
  });

  test("selects and filters the current block type", async ({ page, q }) => {
    await q.button("Actions").press("Enter");
    for (let index = 0; index < 3; index += 1) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("Enter");
    await test.expect(q.menuitemradio("Text")).toBeFocused();
    await test
      .expect(q.menuitemradio("Text"))
      .toHaveAttribute("aria-checked", "true");
    await page.keyboard.type("cc");
    await page.keyboard.press("Enter");
    await test.expect(q.dialog("Actions")).not.toBeVisible();
    await test.expect(q.text("Callout")).toBeVisible();
    await q.button("Actions").press("Enter");
    await q.combobox("Search actions...").pressSequentially("Turn into");
    await test.expect(q.option("Text not checked")).toBeFocused();
    await test.expect(q.option("Callout checked")).toBeVisible();
    await page.keyboard.press("Enter");
    await test.expect(q.text("Text")).toBeVisible();
  });
});
