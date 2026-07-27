import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const key of ["Enter", "Space"] as const) {
    test(`toggles with ${key} and restores disclosure focus`, async ({
      page,
      q,
    }) => {
      const button = q.button("Add block");
      await button.press(key);
      await test.expect(q.dialog("Add block")).toBeVisible();
      await test.expect(q.dialog("Add block")).not.toBeFocused();
      await test.expect(q.combobox("Search...")).toBeFocused();
      await test.expect(q.option("Paragraph")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await test.expect(button).toBeFocused();
      await button.press(key);
      await test.expect(q.dialog("Add block")).not.toBeVisible();
      await test.expect(button).toBeFocused();
    });
  }

  test("click toggles without auto-selecting the first option", async ({
    q,
  }) => {
    const button = q.button("Add block");
    await button.click();
    await test.expect(q.dialog("Add block")).toBeVisible();
    await test.expect(q.dialog("Add block")).not.toBeFocused();
    await test.expect(q.combobox("Search...")).toBeFocused();
    await test.expect(q.option("Paragraph")).not.toBeFocused();
    await button.click();
    await test.expect(q.dialog("Add block")).not.toBeVisible();
    await test.expect(button).toBeFocused();
  });

  test("vertical arrows open and select the corresponding edge", async ({
    page,
    q,
  }) => {
    const button = q.button("Add block");
    await button.press("ArrowDown");
    await test.expect(q.option("Paragraph")).toBeFocused();
    await page.keyboard.press("Escape");
    await button.press("ArrowUp");
    await test.expect(q.option("Tag Cloud")).toBeFocused();
  });

  test("filters, auto-selects, clears, and resets when hidden", async ({
    page,
    q,
  }) => {
    const button = q.button("Add block");
    const combobox = q.combobox("Search...");
    await button.click();
    await combobox.pressSequentially("c");
    await test.expect(q.option("Classic")).toBeFocused();
    await combobox.pressSequentially("o");
    await test.expect(q.option("Classic")).not.toBeVisible();
    await test.expect(q.option("Code")).toBeFocused();
    await combobox.pressSequentially("ver");
    await test.expect(combobox).toHaveValue("cover");
    await test.expect(q.option("Code")).not.toBeVisible();
    await test.expect(q.option("Cover")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(button).toBeFocused();
    await button.click();
    await test.expect(combobox).toHaveValue("");
  });

  test("Backspace restores the previous match", async ({ page, q }) => {
    await q.button("Add block").press("Enter");
    const combobox = q.combobox("Search...");
    await test.expect(q.option("Paragraph")).toBeFocused();
    await combobox.pressSequentially("g");
    await test.expect(q.option("Gallery")).toBeFocused();
    await combobox.pressSequentially("r");
    await test.expect(q.option("Group")).toBeFocused();
    await page.keyboard.press("Backspace");
    await test.expect(combobox).toHaveValue("g");
    await test.expect(q.option("Gallery")).toBeFocused();
    await page.keyboard.press("Backspace");
    await test.expect(combobox).toHaveValue("");
    await test.expect(q.option("Paragraph")).toBeFocused();
  });

  test("keyboard traverses matches and resets after Escape", async ({
    page,
    q,
  }) => {
    await q.button("Add block").press("ArrowDown");
    await test.expect(q.option("Paragraph")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Heading")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("List")).toBeFocused();
    await page.keyboard.type("se");
    await test.expect(q.option("Separator")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Search")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Verse")).toBeFocused();
    await page.keyboard.press("Escape");
    await q.button("Add block").press("ArrowDown");
    await test.expect(q.option("Paragraph")).toBeFocused();
  });

  test("pointer activation and subsequent keyboard input update focus modality", async ({
    page,
    q,
  }) => {
    await q.button("Add block").click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Paragraph")).toBeFocused();
    await test
      .expect(q.option("Paragraph"))
      .toHaveAttribute("data-focus-visible");
    await q.option("List").hover();
    await test.expect(q.combobox("Search...")).toBeFocused();
    await test.expect(q.option("List")).toBeFocused();
    await test
      .expect(q.option("List"))
      .not.toHaveAttribute("data-focus-visible");
    await q.option("Classic").hover();
    await test.expect(q.option("Classic")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(q.option("Quote")).toBeFocused();
    await test.expect(q.option("Quote")).toHaveAttribute("data-focus-visible");
  });
});
