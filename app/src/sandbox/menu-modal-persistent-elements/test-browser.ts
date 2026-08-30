import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4291
  test("shift tab moves focus from modal menu to persistent disclosure", async ({
    page,
    q,
  }) => {
    const menuButton = q.button("Actions");

    await menuButton.click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menu()).toBeFocused();

    await page.keyboard.press("Shift+Tab");

    await test.expect(menuButton).toBeFocused();
  });

  // The menu button joins the modal context on its own now, so the elements
  // the `getPersistentElements` prop returns have to be kept alongside it.
  // https://github.com/ariakit/ariakit/issues/4270
  test("keeps persistent elements the prop returns", async ({ page, q }) => {
    await q.button("Actions").click();
    await test.expect(q.menu()).toBeVisible();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Actions")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Refresh")).toBeFocused();
  });

  // The menu sets its own tree snapshot key for the disclosure. A caller that
  // returns different persistent elements over time sets one too, and the menu
  // has to carry it along rather than replace it, or the dialog never reads
  // the persistent elements again and the new one stays out of the tab order.
  // https://github.com/ariakit/ariakit/pull/7303#discussion_r3887846878
  test("caller's tree snapshot key still refreshes persistent elements", async ({
    page,
    q,
  }) => {
    await q.button("Actions").click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.button("Extra")).toHaveAttribute("inert", "");

    await q.menuitem("Add extra").click();
    await test.expect(q.button("Extra")).not.toHaveAttribute("inert", "");

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Actions")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.button("Extra")).toBeFocused();
  });
});
