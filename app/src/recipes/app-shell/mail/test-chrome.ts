import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("counts the messages in the selected folder", async ({ q }) => {
    await test.expect(q.text("6 messages")).toBeVisible();
    await q.link(/^Sent/).click();
    await test.expect(q.text("1 message")).toBeVisible();
  });

  test("keeps the message list out of the navigation landmarks", async ({
    q,
  }) => {
    const messages = query(q.complementary("Messages"));
    await test.expect(messages.link(/^Maya Chen/)).toBeVisible();
    await test.expect(messages.navigation()).toHaveCount(0);
    const mailboxes = query(q.navigation("Mailboxes"));
    await test.expect(mailboxes.link(/^Sent/)).toBeVisible();
    await test.expect(mailboxes.navigation()).toHaveCount(0);
  });
});
