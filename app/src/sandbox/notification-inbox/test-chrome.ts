import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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

    for (let index = 0; index < 3; index += 1) {
      await q.button("Move to Trash").click();
    }
    await test.expect(q.text("1 conversation")).toBeVisible();
    await test.expect(inbox).toContainText("1");

    await q.button("Receive message").click();
    await test.expect(q.text("2 conversations")).toBeVisible();
    await test.expect(inbox).toContainText("2");
  });
});
