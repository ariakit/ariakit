import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("leaves line numbers out of the copy and the selection", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const code = q.region("use-debounced-value.ts");
    await q.button("Copy use-debounced-value.ts").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toMatch(/^import \{ useEffect, useState \} from/);
    test.expect(copied).toMatch(/\n {2}return debouncedValue;\n\}$/);
    // Select the whole code, as a person who drags over it would.
    const selected = await code.evaluate((element) => {
      const selection = getSelection();
      selection?.selectAllChildren(element);
      return selection?.toString();
    });
    test.expect(selected).toBe(copied);
  });
});
