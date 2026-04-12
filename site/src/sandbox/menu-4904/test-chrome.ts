import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("menu in popup window closes on Escape", async ({
    page,
    context,
    q,
  }) => {
    const popupPromise = context.waitForEvent("page");
    await q.button("Open popout window").click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    const pq = query(popup);
    const menuButton = pq.button("Actions");
    await menuButton.click();
    await test.expect(pq.menu()).toBeVisible();

    await popup.keyboard.press("Escape");
    await test.expect(pq.menu()).not.toBeVisible();
  });

  test("menu in popup window closes on click outside", async ({
    page,
    context,
    q,
  }) => {
    const popupPromise = context.waitForEvent("page");
    await q.button("Open popout window").click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    const pq = query(popup);
    const menuButton = pq.button("Actions");
    await menuButton.click();
    await test.expect(pq.menu()).toBeVisible();

    // Click far below the menu and button so we're clearly outside both.
    await popup.locator("body").click({ position: { x: 10, y: 300 } });
    await test.expect(pq.menu()).not.toBeVisible();
  });

  test("menu in popup window restores focus to trigger on close", async ({
    page,
    context,
    q,
  }) => {
    const popupPromise = context.waitForEvent("page");
    await q.button("Open popout window").click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    const pq = query(popup);
    const menuButton = pq.button("Actions");
    await menuButton.click();
    await test.expect(pq.menu()).toBeVisible();

    await pq.menuitem("Edit").click();
    await test.expect(pq.menu()).not.toBeVisible();
    await test.expect(menuButton).toBeFocused();
  });
});
