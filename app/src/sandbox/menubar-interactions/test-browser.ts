import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("re-open submenu and shift-tab back to the parent menu", async ({
    page,
    q,
  }) => {
    await q.menuitem("File").click();
    await q.menuitem("Share").hover();
    await q.menuitem("Notes").hover();
    await page.keyboard.press("ArrowLeft");
    await expect(q.menu("Share")).not.toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(q.menuitem("Email Link")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Shift+Tab");
    await expect(q.menu("File")).toBeVisible();
    await expect(q.menu("Share")).toBeVisible();
    await expect(q.menuitem("Share")).toHaveAttribute("data-active-item");
    await expect(q.menuitem("Email Link")).not.toHaveAttribute(
      "data-active-item",
    );
    await page.keyboard.press("ArrowDown");
    await expect(q.menu("Share")).not.toBeVisible();
    await expect(q.menuitem("Print")).toHaveAttribute("data-active-item");
  });

  for (const name of ["Search", "Rename", "Nested search", "Search blocks"]) {
    for (const key of ["ArrowRight", "ArrowLeft"]) {
      // https://github.com/ariakit/ariakit/issues/7409
      test(`${key} moves the caret in ${name}`, async ({ page, q }) => {
        const menuName = name === "Search blocks" ? "Insert" : "Tools";
        await q.menuitem(menuName).click();
        const popup =
          name === "Search blocks" ? q.dialog(menuName) : q.menu(menuName);
        const input = page.getByLabel(name, { exact: true });
        await input.click();
        await input.evaluate((element: HTMLInputElement) => {
          element.setSelectionRange(1, 1);
        });
        await expect(input).toBeFocused();
        await expect(popup).toBeVisible();
        await page.keyboard.press(key);
        await expect(input).toBeFocused();
        await expect(popup).toBeVisible();
        const position = key === "ArrowRight" ? 2 : 0;
        await expect(input).toHaveJSProperty("selectionStart", position);
        await expect(input).toHaveJSProperty("selectionEnd", position);
        await page.keyboard.press("Escape");
        await expect(popup).not.toBeVisible();
        await expect(q.menuitem(menuName)).toBeFocused();
      });
    }
  }

  // https://github.com/ariakit/ariakit/issues/7409
  test("ArrowLeft edits a field in a submenu without closing it", async ({
    page,
    q,
  }) => {
    await q.menuitem("Tools").click();
    await q.menuitem("More options").click();
    const input = q.textbox("Filter");
    await input.click();
    await input.evaluate((element: HTMLInputElement) =>
      element.setSelectionRange(1, 1),
    );
    await expect(input).toBeFocused();
    await expect(q.menu("More options")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(input).toBeFocused();
    await expect(input).toHaveJSProperty("selectionStart", 0);
    await expect(q.menu("More options")).toBeVisible();
  });

  for (const key of ["ArrowRight", "ArrowLeft"]) {
    for (const target of ["menu", "item", "input edge"]) {
      // https://github.com/ariakit/ariakit/issues/7409
      test(`${key} traverses the menubar from ${target}`, async ({
        page,
        q,
      }) => {
        await q.menuitem("Tools").click();
        if (target === "item") {
          await page.keyboard.press("ArrowDown");
          await expect(q.menuitem("New document")).toBeFocused();
        } else if (target === "input edge") {
          const input = q.menuitem("Rename");
          await input.click();
          await input.evaluate(
            (element: HTMLInputElement, position) =>
              element.setSelectionRange(position, position),
            key === "ArrowRight" ? 3 : 0,
          );
          await expect(input).toBeFocused();
        } else {
          await expect(q.menu("Tools")).toBeFocused();
        }
        await page.keyboard.press(key);
        const next = key === "ArrowRight" ? "Format" : "Insert";
        await expect(q.menuitem(next)).toBeFocused();
        await expect(q.menu("Tools")).not.toBeVisible();
        await test
          .expect(next === "Format" ? q.menu(next) : q.dialog(next))
          .toBeVisible();
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
        await q.menuitem("Tools").click();
        const control = name === "Help" ? q.link(name) : q.button(name);
        await control.click();
        await expect(control).toBeFocused();
        await expect(q.menu("Tools")).toBeVisible();
        await page.keyboard.press(key);
        await expect(control).toBeFocused();
        await expect(q.menu("Tools")).toBeVisible();
      });
    }
  }
});
