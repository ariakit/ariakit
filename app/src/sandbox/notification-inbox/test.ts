import { click, press, q } from "@ariakit/test";
import { afterEach, expect, test, vi } from "vitest";
import { inboxNotifications } from "./notifications.ts";

afterEach(() => {
  inboxNotifications.clear();
  vi.restoreAllMocks();
});

test("initializes a directly supplied core store", async () => {
  await click(q.button("Save draft"));

  const region = q.region("Notifications");
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  hidden.mockReturnValue(true);
  document.dispatchEvent(new Event("visibilitychange"));
  await expect.poll(() => region.hasAttribute("data-paused")).toBe(true);

  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event("visibilitychange"));
  await expect.poll(() => region.hasAttribute("data-paused")).toBe(false);

  window.dispatchEvent(new Event("blur"));
  await expect.poll(() => region.hasAttribute("data-paused")).toBe(true);

  window.dispatchEvent(new Event("focus"));
  await expect.poll(() => region.hasAttribute("data-paused")).toBe(false);
});

test("renders a headingless notification without a duplicate description", async () => {
  await click(q.button("Save draft"));

  const notification = q.alertdialog("Draft saved.");
  expect(notification).toBeVisible();
  expect(notification).toHaveAttribute("aria-labelledby");
  expect(notification).not.toHaveAttribute("aria-describedby");

  await click(q.button("Dismiss Draft saved."));
  expect(q.alertdialog.maybe("Draft saved.")).not.toBeInTheDocument();
});

test("restores a durable conversation from an untimed notification", async () => {
  await click(q.button("Move to Trash"));

  expect(q.alertdialog("Conversation moved to Trash")).toHaveTextContent(
    "3 messages moved to Trash.",
  );
  expect(q.button.maybe(/Maya Chen/)).not.toBeInTheDocument();

  await click(q.button("Undo"));

  expect(
    q.alertdialog.maybe("Conversation moved to Trash"),
  ).not.toBeInTheDocument();
  expect(q.button(/Maya Chen/)).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7235
test("updates the inbox conversation counts", async () => {
  const inbox = q.link(/Inbox/);
  expect(q.text("4 conversations")).toBeVisible();
  expect(inbox).toHaveTextContent("4");
  expect(inbox).toHaveAccessibleName("Inbox, 4 conversations");
  expect(inbox.querySelector(".ak-badge")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  for (let index = 0; index < 3; index += 1) {
    await click(q.button("Move to Trash"));
  }
  expect(q.text("1 conversation")).toBeVisible();
  expect(inbox).toHaveTextContent("1");
  expect(inbox).toHaveAccessibleName("Inbox, 1 conversation");

  await click(q.button("Receive message"));
  expect(q.text("2 conversations")).toBeVisible();
  expect(inbox).toHaveTextContent("2");
  expect(inbox).toHaveAccessibleName("Inbox, 2 conversations");
});

test("limits the visual stack and lets the app focus its region", async () => {
  for (let index = 0; index < 4; index += 1) {
    await click(q.button("Receive message"));
  }

  expect(q.alertdialog.all()).toHaveLength(3);
  await press("t", null, { altKey: true });
  expect(q.region("Notifications")).toHaveFocus();
});
