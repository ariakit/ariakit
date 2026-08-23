import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7235
test("pushes and focuses a timed notification after the modal opens empty", async () => {
  await click(q.button("Open notification lab"));
  const dialog = q.dialog("Notification lab");
  const sendButton = q.within(dialog).button("Send timed update");
  expect(dialog).toBeVisible();
  expect(q.alertdialog.all()).toHaveLength(0);

  await click(sendButton);
  const notification = q.alertdialog("Export ready");
  expect(notification).toBeVisible();
  expect(dialog).toBeVisible();
  expect(sendButton).toHaveFocus();

  await press.ShiftTab();
  expect(q.within(notification).button("Dismiss Export ready")).toHaveFocus();

  await press.Escape();
  expect(q.alertdialog.maybe("Export ready")).not.toBeInTheDocument();
  expect(dialog).toBeVisible();
  expect(sendButton).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7235
test("lets an untimed notification pass Escape to the modal", async () => {
  await click(q.button("Open notification lab"));
  const dialog = q.dialog("Notification lab");
  await click(q.within(dialog).button("Send untimed update"));
  const notification = q.alertdialog("Connection needs attention");
  expect(notification).toBeVisible();

  await press.ShiftTab();
  await press.ShiftTab();
  expect(
    q.within(notification).button("Dismiss Connection needs attention"),
  ).toHaveFocus();

  await press.Escape();
  expect(q.dialog.maybe("Notification lab")).not.toBeInTheDocument();
  expect(notification).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7235
test("keeps the modal and its popup open when a notification is used", async () => {
  await click(q.button("Open notification lab"));
  const dialog = q.dialog("Notification lab");
  await click(q.within(dialog).button("Send timed update"));
  const notification = q.alertdialog("Export ready");

  await click(q.within(dialog).button("Notification options"));
  const menu = q.menu("Notification options");
  expect(menu).toBeVisible();

  await click(q.within(notification).button("Open activity"));
  expect(q.within(notification).button("Activity opened")).toBeVisible();
  expect(notification).toBeVisible();
  expect(menu).toBeVisible();
  expect(dialog).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7235
test("isolates an exact notification surface in a shared shadow root", async () => {
  const shadowHost = document.querySelector<HTMLElement>(
    "[data-testid=notification-shadow-host]",
  );
  const shadowRoot = shadowHost?.shadowRoot;
  const root = shadowRoot?.querySelector<HTMLElement>(
    "[data-shadow-notification-root]",
  );
  const shadowQ = q.within(root);
  expect(shadowQ.button("Open shadow-root lab")).toBeVisible();
  expect(shadowHost).not.toHaveAttribute("data-notifications");

  await click(shadowQ.button("Open shadow-root lab"));
  const dialog = shadowQ.dialog("Shadow notification lab");
  const sendButton = shadowQ.within(dialog).button("Send shadow update");
  expect(dialog).toBeVisible();
  await click(sendButton);

  const region = shadowQ.region("Shadow notifications");
  const notification = shadowQ.alertdialog("Shadow update");
  const unrelatedButton = root?.querySelector<HTMLButtonElement>(
    "[data-unrelated-shadow-action]",
  );
  expect(region).toBeVisible();
  expect(notification).toBeVisible();
  expect(region.getRootNode()).toBe(dialog.getRootNode());
  expect(region.closest("[inert]")).toBeNull();
  expect(unrelatedButton?.closest("[inert]")).toBeTruthy();

  await focus(unrelatedButton || null);
  expect(shadowRoot?.activeElement).toBe(sendButton);

  const dismissButton = shadowQ
    .within(notification)
    .button("Dismiss Shadow update");
  await focus(dismissButton);
  expect(shadowRoot?.activeElement).toBe(dismissButton);
  await click(shadowQ.within(notification).button("Acknowledge shadow update"));
  expect(
    shadowQ.within(notification).button("Shadow update acknowledged"),
  ).toBeVisible();
  expect(notification).toBeVisible();
  expect(dialog).toBeVisible();
});
