import { withFramework } from "#app/test-utils/preview.ts";

// menu-conditional-mount covers the modal, opt-out, and mount-after-load
// openings, which need a page where nothing is open yet.

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/2946
  test("takes focus when the menu starts open", async ({ q }) => {
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();
    await test
      .expect(q.menuitem("Rename"))
      .not.toHaveAttribute("data-active-item");
  });

  // The menu is only usable if the composite can still start roving from the
  // container it just focused.
  // https://github.com/ariakit/ariakit/issues/2946
  test("navigates from the container when the menu starts open", async ({
    page,
    q,
  }) => {
    await test.expect(q.menu()).toBeFocused();

    await page.keyboard.press("ArrowDown");

    await test.expect(q.menuitem("Rename")).toBeFocused();
  });
});
