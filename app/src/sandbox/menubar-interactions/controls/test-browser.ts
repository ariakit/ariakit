import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of ["Search", "Rename", "Search blocks"]) {
    for (const key of ["ArrowRight", "ArrowLeft"]) {
      // https://github.com/ariakit/ariakit/issues/7409
      test(`${key} moves the caret in ${name}`, async ({ page, q }) => {
        const menuName = name === "Search blocks" ? "Insert" : "File";
        await q.menuitem(menuName).click();
        const popup =
          name === "Search blocks" ? q.dialog(menuName) : q.menu(menuName);
        const input = page.getByLabel(name, { exact: true });
        await input.click();
        await input.evaluate((element: HTMLInputElement) => {
          element.setSelectionRange(1, 1);
        });
        await test.expect(input).toBeFocused();
        await test.expect(popup).toBeVisible();
        await page.keyboard.press(key);
        await test.expect(input).toBeFocused();
        await test.expect(popup).toBeVisible();
        const position = key === "ArrowRight" ? 2 : 0;
        await test.expect(input).toHaveJSProperty("selectionStart", position);
        await test.expect(input).toHaveJSProperty("selectionEnd", position);
        await page.keyboard.press("Escape");
        await test.expect(popup).not.toBeVisible();
        await test.expect(q.menuitem(menuName)).toBeFocused();
      });
    }
  }

  for (const key of ["ArrowDown", "ArrowUp"]) {
    for (const name of ["Help", "Action"]) {
      // https://github.com/ariakit/ariakit/issues/7409
      test(`${key} keeps focus on ${name} in a vertical menubar`, async ({
        page,
        q,
      }) => {
        await q.checkbox("Vertical menubar").check();
        await q.menuitem("File").click();
        const control = name === "Help" ? q.link(name) : q.button(name);
        await control.click();
        await test.expect(control).toBeFocused();
        await test.expect(q.menu("File")).toBeVisible();
        await page.keyboard.press(key);
        await test.expect(control).toBeFocused();
        await test.expect(q.menu("File")).toBeVisible();
      });
    }
  }
});
