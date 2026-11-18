import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("sends the message with Enter and keeps lines from Shift+Enter", async ({
    page,
    q,
  }) => {
    const message = q.textbox("Message");
    const messages = query(q.list("Messages")).listitem();
    await message.click();
    await page.keyboard.type("On it");
    await page.keyboard.press("Shift+Enter");
    await page.keyboard.type("Sending by 11");
    await test.expect(messages).toHaveCount(3);
    await page.keyboard.press("Enter");
    await test.expect(messages).toHaveCount(4);
    await test.expect(messages.last()).toHaveText("On it Sending by 11");
    await test.expect(message).toHaveValue("");
    await test.expect(message).toBeFocused();
  });
});
