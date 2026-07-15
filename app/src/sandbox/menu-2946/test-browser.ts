import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/2946#issuecomment-4977621514
  test("focuses a conditionally mounted menu that opens by default", async ({
    q,
  }) => {
    await q.button("Add item").click();

    const menu = q.menu("Actions for new item");
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toBeFocused();
    await test
      .expect(q.menuitem("Rename"))
      .not.toHaveAttribute("data-active-item");
  });

  test("respects autofocus opt-out when mounting open", async ({ page, q }) => {
    await q.button("Add passive item").click();

    await test.expect(q.menu("Actions for new item")).toBeVisible();
    await test.expect(page.locator("body")).toBeFocused();
  });
});
