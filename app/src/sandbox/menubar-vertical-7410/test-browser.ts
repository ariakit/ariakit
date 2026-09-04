import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const rtl of [false, true]) {
    // https://github.com/ariakit/ariakit/issues/7410
    test(`places vertical menubar menus beside their entry (rtl=${rtl})`, async ({
      q,
    }) => {
      await q.checkbox("Right to left").setChecked(rtl);
      await q.menuitem("File").click();
      await test.expect(q.menu("File")).toBeVisible();
      await test.expect
        .poll(async () => {
          const entry = await q.menuitem("File").boundingBox();
          const menu = await q.menu("File").boundingBox();
          if (!entry) return false;
          if (!menu) return false;
          return rtl
            ? menu.x + menu.width <= entry.x
            : menu.x >= entry.x + entry.width;
        })
        .toBe(true);
    });
  }
});
