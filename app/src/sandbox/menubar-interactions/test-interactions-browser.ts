import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("pointer toggles a top-level menu and activates an item", async ({
    q,
  }) => {
    const file = q.menuitem("File");
    await file.click();
    await test.expect(q.menu("File")).toBeVisible();
    await test.expect(q.menu("File")).toBeFocused();
    await test.expect(q.menuitem("New Tab")).not.toBeFocused();
    await q.menuitem("New Tab").click();
    await test.expect(q.menu("File")).not.toBeVisible();
    await test.expect(file).toBeFocused();
    await file.click();
    await file.click();
    await test.expect(q.menu("File")).not.toBeVisible();
    await test.expect(file).toBeFocused();
  });

  for (const key of ["Enter", "Space"] as const) {
    test(`${key} opens, activates, and toggles from the menubar item`, async ({
      page,
      q,
    }) => {
      const file = q.menuitem("File");
      await file.press(key);
      await test.expect(q.menu("File")).toBeVisible();
      await test.expect(q.menuitem("New Tab")).toBeFocused();
      await page.keyboard.press(key);
      await test.expect(q.menu("File")).not.toBeVisible();
      await test.expect(file).toBeFocused();
      await file.press(key);
      await page.keyboard.press("Shift+Tab");
      await test.expect(q.menu("File")).toBeVisible();
      await test.expect(file).toBeFocused();
      await page.keyboard.press(key);
      await test.expect(q.menu("File")).not.toBeVisible();
      await test.expect(file).toBeFocused();
    });
  }

  test("arrow keys traverse top-level and nested menus", async ({
    page,
    q,
  }) => {
    await q.menuitem("File").press("ArrowDown");
    await test.expect(q.menuitem("New Tab")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menu("File")).not.toBeVisible();
    await test.expect(q.menu("Edit")).toBeVisible();
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(q.menuitem("Emoji & Symbols")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowUp");
    await test.expect(q.menuitem("Emoji & Symbols")).toBeFocused();
    await page.keyboard.type("f");
    await test.expect(q.menuitem("Find")).toBeFocused();
    await test.expect(q.menu("Find")).not.toBeVisible();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menu("Find")).toBeVisible();
    await test.expect(q.menuitem("Search the Web")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.menuitem("Find")).toBeFocused();
    await test.expect(q.menu("Find")).not.toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("View")).toBeFocused();
    await test.expect(q.menu("View")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menuitem("Force Reload This Page")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("File")).toBeFocused();
    await test.expect(q.menu("File")).toBeVisible();
  });

  test("typeahead continues after focus returns to the top-level item", async ({
    page,
    q,
  }) => {
    await q.menuitem("File").press("Enter");
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.menuitem("File")).toBeFocused();
    await page.keyboard.type("s");
    await test.expect(q.menuitem("Save Page As")).toBeFocused();
    await page.keyboard.type("h");
    await test.expect(q.menuitem("Share")).toBeFocused();
  });

  test("hover transfers the open menu across nested top-level items", async ({
    q,
  }) => {
    await q.menuitem("File").hover();
    await test.expect(q.menu("File")).not.toBeVisible();
    await q.menuitem("File").click();
    await q.menuitem("New Window").hover();
    await test.expect(q.menu("File")).toBeFocused();
    await q.menuitem("View").hover();
    await test.expect(q.menuitem("View")).toBeFocused();
    await test.expect(q.menu("File")).not.toBeVisible();
    await test.expect(q.menu("View")).toBeVisible();
    await q.menuitem("Developer").hover();
    await test.expect(q.menuitem("View Source")).toBeVisible();
    await q.menuitem("View Source").hover();
    await q.menuitem("File").hover();
    await test.expect(q.menu("File")).toBeVisible();
    await test.expect(q.menu("View")).not.toBeVisible();
  });

  test("Escape closes the complete submenu tree and deactivates hover opening", async ({
    page,
    q,
  }) => {
    await q.menuitem("File").press("Enter");
    await page.keyboard.type("sh");
    await test.expect(q.menuitem("Share")).toBeFocused();
    await page.waitForTimeout(600);
    await page.keyboard.press("Space");
    await test.expect(q.menuitem("Email Link")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(q.menuitem("File")).toBeFocused();
    await test.expect(q.menu("Share")).not.toBeVisible();
    await test.expect(q.menu("File")).not.toBeVisible();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.menuitem("Edit")).toBeFocused();
    await test.expect(q.menu("Edit")).not.toBeVisible();
    await page.keyboard.press("Escape");
    await q.menuitem("View").hover();
    await test.expect(q.menu("View")).not.toBeVisible();
  });
});
