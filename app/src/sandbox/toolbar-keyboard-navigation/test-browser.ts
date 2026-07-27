import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // examples/toolbar/test.ts
  test("moves through toolbar items with keyboard commands", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Basic formatting");
    const toolbarQuery = query(toolbar);
    const undo = toolbarQuery.button("Undo");
    const bold = toolbarQuery.button("Bold");
    const underline = toolbarQuery.button("Underline");

    await undo.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(bold).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(underline).toBeFocused();
    await page.keyboard.press("Home");
    await test.expect(undo).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(undo).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/3232
  // examples/toolbar-active-id-disabled/test.ts
  test("enters a toolbar whose active item is disabled", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Disabled active item");
    const italic = query(toolbar).button("Italic");

    await q.button("Before disabled active item").focus();
    await page.keyboard.press("Tab");
    await test.expect(italic).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("After disabled active item")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(italic).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/4129
  // examples/toolbar-active-id-stale/test.ts
  test("recovers when the active toolbar item is removed", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Stale active item");
    const toolbarQuery = query(toolbar);
    const bold = toolbarQuery.button("Bold");
    const italic = toolbarQuery.button("Italic");
    const underline = toolbarQuery.button("Underline");

    await bold.focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(italic).toBeFocused();
    await q.button("Toggle italic").click();
    await page.keyboard.press("Shift+Tab");
    await test.expect(underline).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Before stale active item")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(underline).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(bold).toBeFocused();
  });

  // examples/toolbar-select/test.ts
  test("composes a ComboboxSelect with toolbar navigation", async ({
    page,
    q,
  }) => {
    const toolbar = q.toolbar("Selectable text formatting");
    const toolbarQuery = query(toolbar);
    const bold = toolbarQuery.button("Bold");
    const underline = toolbarQuery.button("Underline");
    const select = toolbarQuery.combobox("Text alignment");

    await bold.focus();
    await page.keyboard.press("End");
    await test.expect(select).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.option("Align Left"))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveText("Align Center");
    await page.keyboard.press("ArrowLeft");
    await test.expect(underline).toBeFocused();
  });
});
