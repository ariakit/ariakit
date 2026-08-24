import { createNotificationStore } from "@ariakit/components/notification/notification-store";
import type { NotificationHeadingProps } from "@ariakit/react-components/notification/notification-heading";
import type { NotificationMessageProps } from "@ariakit/react-components/notification/notification-message";
import { click, press, q } from "@ariakit/test";
import { render } from "@ariakit/test/react";
import { createElement } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { inboxNotifications } from "./notifications.ts";
import {
  NotificationFixture,
  SplitNotificationFixture,
} from "./test-fixture.react.tsx";

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

test("preserves an explicit heading label", async () => {
  const store = createNotificationStore();
  store.push({ message: "report.pdf is ready", timeout: null });
  const { unmount } = await render(
    createElement(NotificationFixture, {
      store,
      headingProps: { "aria-label": "Upload complete" },
    }),
  );

  const notification = q.alertdialog("Upload complete");
  expect(notification).toHaveAttribute("aria-labelledby");
  expect(notification).toHaveAttribute("aria-describedby");

  unmount();
});

const headingContentCases: Array<{
  description: string;
  headingProps: NotificationHeadingProps;
  expectedName: string;
  hasDescription: boolean;
  itemHeading?: string;
}> = [
  {
    description: "an empty render element",
    headingProps: { render: createElement("h2") },
    expectedName: "report.pdf is ready",
    hasDescription: false,
  },
  {
    description: "render-element content",
    headingProps: {
      render: createElement("h2", null, "Upload complete"),
    },
    expectedName: "Upload complete",
    hasDescription: true,
  },
  {
    description: "empty inner HTML over a contextual heading",
    headingProps: { dangerouslySetInnerHTML: { __html: "" } },
    expectedName: "report.pdf is ready",
    hasDescription: false,
    itemHeading: "Contextual heading",
  },
  {
    description: "inner HTML markup without text over a contextual heading",
    headingProps: {
      dangerouslySetInnerHTML: { __html: "<span></span>" },
    },
    expectedName: "report.pdf is ready",
    hasDescription: false,
    itemHeading: "Contextual heading",
  },
  {
    description: "empty render-element inner HTML over a contextual heading",
    headingProps: {
      render: createElement("h2", {
        dangerouslySetInnerHTML: { __html: "" },
      }),
    },
    expectedName: "report.pdf is ready",
    hasDescription: false,
    itemHeading: "Contextual heading",
  },
  {
    description: "render-element inner HTML over a contextual heading",
    headingProps: {
      render: createElement("h2", {
        dangerouslySetInnerHTML: { __html: "<strong>Upload complete</strong>" },
      }),
    },
    expectedName: "report.pdf is ready",
    hasDescription: false,
    itemHeading: "Contextual heading",
  },
  {
    description: "explicitly labeled inner HTML",
    headingProps: {
      "aria-label": "Sync complete",
      dangerouslySetInnerHTML: { __html: "<strong>Visible status</strong>" },
    },
    expectedName: "Sync complete",
    hasDescription: true,
    itemHeading: "Contextual heading",
  },
  {
    description: "explicitly labeled render-element inner HTML",
    headingProps: {
      render: createElement("h2", {
        "aria-label": "Upload complete",
        dangerouslySetInnerHTML: { __html: "<strong>Visible status</strong>" },
      }),
    },
    expectedName: "Upload complete",
    hasDescription: true,
    itemHeading: "Contextual heading",
  },
];

test.each(headingContentCases)(
  "registers $description correctly",
  async ({ headingProps, expectedName, hasDescription, itemHeading }) => {
    const store = createNotificationStore();
    store.push({
      heading: itemHeading,
      message: "report.pdf is ready",
      timeout: null,
    });
    const { unmount } = await render(
      createElement(NotificationFixture, { store, headingProps }),
    );

    const notification = q.alertdialog(expectedName);
    if (hasDescription) {
      expect(notification).toHaveAttribute("aria-describedby");
    } else {
      expect(notification).not.toHaveAttribute("aria-describedby");
    }

    unmount();
  },
);

test("focuses a newly registered notification", async () => {
  const store = createNotificationStore();
  store.push({ message: "Older replacement", timeout: null });
  store.push({ message: "Focused notification", timeout: null });
  const { unmount } = await render(
    createElement(NotificationFixture, { store }),
  );

  const notification = q.alertdialog("Focused notification");
  await click(q.within(notification).button("Dismiss Focused notification"));

  expect(q.alertdialog("Older replacement")).toHaveFocus();

  unmount();
});

test("releases the focus pause when a filtered list has no successor", async () => {
  const store = createNotificationStore();
  store.push({ message: "Second notification", timeout: null });
  const firstId = store.push({
    message: "First notification",
    timeout: null,
  });
  const { unmount } = await render(
    createElement(SplitNotificationFixture, { store }),
  );

  const notification = q.alertdialog("First notification");
  notification.focus();
  await expect.poll(() => store.getState().paused).toBe(true);
  store.remove(firstId);

  expect(q.alertdialog("Second notification")).toBeVisible();
  await expect.poll(() => store.getState().paused).toBe(false);

  unmount();
});

const messageHTMLCases: Array<{
  description: string;
  messageProps: NotificationMessageProps;
}> = [
  {
    description: "direct inner HTML",
    messageProps: {
      dangerouslySetInnerHTML: { __html: "<strong>Visible message</strong>" },
    },
  },
  {
    description: "render-element inner HTML",
    messageProps: {
      render: createElement("p", {
        dangerouslySetInnerHTML: { __html: "<strong>Visible message</strong>" },
      }),
    },
  },
];

test.each(messageHTMLCases)(
  "uses the record message with $description",
  async ({ messageProps }) => {
    const store = createNotificationStore();
    store.push({ message: "report.pdf is ready", timeout: null });
    const { unmount } = await render(
      createElement(NotificationFixture, { store, messageProps }),
    );

    const notification = q.alertdialog("report.pdf is ready");
    expect(notification).toHaveTextContent("Visible message");
    expect(notification).toHaveAttribute("aria-labelledby");
    expect(notification).not.toHaveAttribute("aria-describedby");

    unmount();
  },
);

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
