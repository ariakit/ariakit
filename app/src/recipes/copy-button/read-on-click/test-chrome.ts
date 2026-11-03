import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("copies the text at the moment of each click", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const readClipboard = () =>
      page.evaluate(() => navigator.clipboard.readText());
    await q.textbox("Release note").fill("Added the copy button.");
    await q.button("Copy note").click();
    await test.expect(q.button("Copied")).toBeVisible();
    test.expect(await readClipboard()).toBe("Added the copy button.");
    await q.textbox("Release note").fill("Edited the copy button.");
    // The first copy may still show its feedback, so the button has either name
    // and only the clipboard shows that the second copy finished.
    await q.button(/^(Copy note|Copied)$/).click();
    await test.expect.poll(readClipboard).toBe("Edited the copy button.");
  });
});
