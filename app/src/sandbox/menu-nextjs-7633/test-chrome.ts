import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7633
  test("click on the menu button opens the menu", async ({ q }) => {
    await q.button("Actions").click();
    await test.expect(q.menu("Actions")).toBeVisible();
    await test
      .expect(q.button("Actions"))
      .toHaveAttribute("aria-expanded", "true");
    await test.expect(q.menuitem("Edit")).toBeVisible();
  });
});
