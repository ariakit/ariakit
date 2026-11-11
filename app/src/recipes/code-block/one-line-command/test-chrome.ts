import { withFramework } from "#app/test-utils/preview.ts";

const command = "npm install @ariakit/react";

withFramework(import.meta.dirname, async ({ test }) => {
  test("leaves the prompt sign out of the copy and the selection", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.button("Copy command").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe(command);
    const selected = await q.region("Install command").evaluate((element) => {
      const selection = getSelection();
      selection?.selectAllChildren(element);
      return selection?.toString();
    });
    test.expect(selected).toBe(command);
  });
});
