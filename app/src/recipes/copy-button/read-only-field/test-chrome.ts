import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("copies the value of the field", async ({ context, page, q }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.button("Copy link").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe(await q.textbox("Invite link").inputValue());
  });
});
