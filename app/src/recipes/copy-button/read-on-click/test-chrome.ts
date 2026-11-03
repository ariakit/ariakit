import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("copies the text at the moment of the click", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.textbox("Release note").fill("Added the copy button.");
    await q.button("Copy note").click();
    await test.expect(q.status()).toHaveText("Copied");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("Added the copy button.");
  });
});
