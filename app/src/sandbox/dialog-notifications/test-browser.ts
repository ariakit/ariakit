import type { Locator, Page } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

async function focusNotification(
  page: Page,
  browserName: string,
  notification: Locator,
  reverseSteps: number,
) {
  if (browserName !== "webkit") {
    for (let i = 0; i < reverseSteps; i += 1) {
      await page.keyboard.press("Shift+Tab");
    }
    return;
  }
  // Safari uses Option+Tab when full keyboard access is disabled. WebKit does
  // not emulate the reverse shortcut, so traverse forward until the card or
  // one of its controls receives focus.
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("Alt+Tab");
    const focused = await notification.evaluate(hasFocusWithin);
    if (focused) return;
  }
}

function hasFocusWithin(element: Element) {
  let activeElement = element.ownerDocument.activeElement;
  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return !!activeElement && element.contains(activeElement);
}

function hasFocusInside(notification: Locator) {
  return notification.evaluate(hasFocusWithin);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7235
  test("pushes and focuses a timed notification after the modal opens empty", async ({
    page,
    browserName,
    q,
  }) => {
    await q.button("Open notification lab").click();
    const dialog = q.dialog("Notification lab");
    const sendButton = query(dialog).button("Send timed update");
    await test.expect(dialog).toBeVisible();
    await test.expect(q.alertdialog()).toHaveCount(0);

    await sendButton.click();
    const notification = q.alertdialog("Export ready");
    await test.expect(notification).toBeVisible();
    await test.expect(dialog).toBeVisible();
    await test.expect(sendButton).toBeFocused();

    await focusNotification(page, browserName, notification, 1);
    await test.expect.poll(() => hasFocusInside(notification)).toBe(true);

    await page.keyboard.press("Escape");
    await test.expect(notification).not.toBeVisible();
    await test.expect(dialog).toBeVisible();
    await test.expect(sendButton).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("lets an untimed notification pass Escape to the modal", async ({
    page,
    browserName,
    q,
  }) => {
    await q.button("Open notification lab").click();
    const dialog = q.dialog("Notification lab");
    await query(dialog).button("Send untimed update").click();
    const notification = q.alertdialog("Connection needs attention");
    await test.expect(notification).toBeVisible();

    await focusNotification(page, browserName, notification, 2);
    await test.expect.poll(() => hasFocusInside(notification)).toBe(true);

    await page.keyboard.press("Escape");
    await test.expect(dialog).not.toBeVisible();
    await test.expect(notification).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("keeps the modal and its popup open when a notification is used", async ({
    q,
  }) => {
    await q.button("Open notification lab").click();
    const dialog = q.dialog("Notification lab");
    await query(dialog).button("Send timed update").click();
    const notification = q.alertdialog("Export ready");

    await query(dialog).button("Notification options").click();
    const menu = q.menu("Notification options");
    await test.expect(menu).toBeVisible();

    await query(notification).button("Open activity").click();
    await test
      .expect(query(notification).button("Activity opened"))
      .toBeVisible();
    await test.expect(notification).toBeVisible();
    await test.expect(menu).toBeVisible();
    await test.expect(dialog).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("isolates an exact notification surface in a shared shadow root", async ({
    page,
    browserName,
    q,
  }) => {
    const shadowHost = page.getByTestId("notification-shadow-host");
    const openButton = q.button("Open shadow-root lab");
    await test.expect(openButton).toBeVisible();
    await test.expect(shadowHost).not.toHaveAttribute("data-notifications", "");

    await openButton.click();
    const dialog = q.dialog("Shadow notification lab");
    const sendButton = query(dialog).button("Send shadow update");
    await test.expect(dialog).toBeVisible();
    await sendButton.click();

    const region = q.region("Shadow notifications");
    const notification = q.alertdialog("Shadow update");
    const unrelatedButton = q.button("Unrelated shadow action", {
      includeHidden: true,
    });
    await test.expect(region).toBeVisible();
    await test.expect(notification).toBeVisible();
    await test
      .expect(
        region.evaluate((element) => {
          const root = element.getRootNode();
          return (
            root instanceof ShadowRoot &&
            root.querySelector("[data-dialog]")?.getRootNode() === root
          );
        }),
      )
      .resolves.toBe(true);
    await test
      .expect(region.evaluate((element) => !element.closest("[inert]")))
      .resolves.toBe(true);
    await test
      .expect(
        unrelatedButton.evaluate((element) => !!element.closest("[inert]")),
      )
      .resolves.toBe(true);

    await unrelatedButton.focus();
    await test.expect(sendButton).toBeFocused();

    await focusNotification(page, browserName, notification, 1);
    await test.expect.poll(() => hasFocusInside(notification)).toBe(true);
    await query(notification).button("Acknowledge shadow update").click();
    await test
      .expect(query(notification).button("Shadow update acknowledged"))
      .toBeVisible();
    await test.expect(notification).toBeVisible();
    await test.expect(dialog).toBeVisible();
  });
});
