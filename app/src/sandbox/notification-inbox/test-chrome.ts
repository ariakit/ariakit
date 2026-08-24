import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("names a message-only notification", async ({ q }) => {
    await q.button("Save draft").click();

    const notification = q.alertdialog("Draft saved.");
    await test.expect(notification).toBeVisible();
    await test.expect(notification).toHaveAttribute("aria-labelledby");
    await test.expect(notification).not.toHaveAttribute("aria-describedby");
  });

  test("focuses a newly revealed one-card notification", async ({
    page,
    q,
  }) => {
    const url = new URL(page.url());
    url.searchParams.set("notification-limit", "1");
    await page.goto(url.toString());

    await q.button("Receive message").click();
    await q.button("Receive message").click();

    const notification = q.alertdialog();
    await test.expect(notification).toHaveCount(1);
    await query(notification)
      .button(/^Dismiss /)
      .click();

    await test.expect(q.alertdialog()).toBeFocused();
  });

  test("releases focus pause across filtered lists", async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("notification-split", "1");
    await page.goto(url.toString());

    await q.button("Receive message").click();
    await q.button("Simulate error").click();

    const region = q.region("Notifications");
    const notification = q.alertdialog("Message not sent");
    const dismiss = query(notification).button("Dismiss Message not sent");
    await dismiss.focus();
    await test.expect(region).toHaveAttribute("data-paused");

    await page.keyboard.press("Enter");

    await test.expect(notification).toHaveCount(0);
    await test
      .expect(q.alertdialog("New message from Priya Shah"))
      .toBeVisible();
    await test.expect(region).not.toHaveAttribute("data-paused");
  });

  test("restores a conversation from an untimed notification", async ({
    q,
  }) => {
    await q.button("Move to Trash").click();

    const notification = q.alertdialog("Conversation moved to Trash");
    await test.expect(notification).toContainText("3 messages moved to Trash.");
    await test.expect(q.button(/Maya Chen/)).toHaveCount(0);

    await q.button("Undo").click();

    await test.expect(notification).toHaveCount(0);
    await test.expect(q.button(/Maya Chen/)).toBeVisible();
  });

  test("limits the stack and supports an app-owned region hotkey", async ({
    page,
    q,
  }) => {
    for (let index = 0; index < 4; index += 1) {
      await q.button("Receive message").click();
    }

    await test.expect(q.alertdialog()).toHaveCount(3);
    await page.keyboard.press("Alt+t");
    await test.expect(q.region("Notifications")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7235
  test("updates the inbox conversation counts", async ({ q }) => {
    const inbox = q.link(/Inbox/);
    await test.expect(q.text("4 conversations")).toBeVisible();
    await test.expect(inbox).toContainText("4");
    await test.expect(inbox).toHaveAccessibleName("Inbox, 4 conversations");

    for (let index = 0; index < 3; index += 1) {
      await q.button("Move to Trash").click();
    }
    await test.expect(q.text("1 conversation")).toBeVisible();
    await test.expect(inbox).toContainText("1");
    await test.expect(inbox).toHaveAccessibleName("Inbox, 1 conversation");

    await q.button("Receive message").click();
    await test.expect(q.text("2 conversations")).toBeVisible();
    await test.expect(inbox).toContainText("2");
    await test.expect(inbox).toHaveAccessibleName("Inbox, 2 conversations");
  });
});
