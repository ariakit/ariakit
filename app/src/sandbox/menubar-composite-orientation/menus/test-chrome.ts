import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const rtl of [false, true]) {
    // https://github.com/ariakit/ariakit/issues/7410
    test(`opens and closes vertical menubar menus with arrow keys (rtl=${rtl})`, async ({
      page,
      q,
    }) => {
      await q.checkbox("Right to left").setChecked(rtl);
      await q.menuitem("File").focus();
      await page.keyboard.press("ArrowDown");
      await test.expect(q.menuitem("Edit")).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await test.expect(q.menuitem("File")).toBeFocused();
      await test.expect(q.menu()).toHaveCount(0);
      await page.keyboard.press(rtl ? "ArrowLeft" : "ArrowRight");
      await test.expect(q.menuitem("New")).toBeFocused();
      await test
        .expect(q.menuitem("File"))
        .toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press(rtl ? "ArrowRight" : "ArrowLeft");
      await test.expect(q.menuitem("File")).toBeFocused();
      await test.expect(q.menu()).toHaveCount(0);
      await test
        .expect(q.menuitem("File"))
        .toHaveAttribute("aria-expanded", "false");
    });
  }
});
