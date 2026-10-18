import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("counts the messages in the selected folder", async ({ q }) => {
    await test.expect(q.text("6 messages")).toBeVisible();
    await q.link(/^Sent/).click();
    await test.expect(q.text("1 message")).toBeVisible();
  });
});
