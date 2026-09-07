import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const target of ["menu container", "horizontal menu item"]) {
    for (const key of ["ArrowDown", "ArrowUp"]) {
      // https://github.com/ariakit/ariakit/issues/7415
      test(`${key} follows vertical RTL menubar order from the ${target}`, async ({
        page,
        q,
      }) => {
        if (target === "horizontal menu item") {
          await q.checkbox("Horizontal menus").check();
        }
        await q.menuitem("Document").click();
        await test.expect(q.menu("Document")).toBeFocused();
        if (target === "horizontal menu item") {
          await page.keyboard.press("ArrowRight");
          await test.expect(q.menuitem("Document settings")).toBeFocused();
        }
        await page.keyboard.press(key);
        const next = key === "ArrowDown" ? "History" : "Zoom";
        await test.expect(q.menuitem(next)).toBeFocused();
        await test.expect(q.menu(next)).toBeVisible();
        await test
          .expect(q.menuitem(next))
          .toHaveAttribute("aria-expanded", "true");
        await test.expect(q.menu("Document")).toBeHidden();
      });
    }
  }
});
