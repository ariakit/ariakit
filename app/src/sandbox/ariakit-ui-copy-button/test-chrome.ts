import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names an icon button Copy by default", async ({ q }) => {
    await test.expect(q.button("Copy", { exact: true })).toBeVisible();
  });

  test("reports a failure when the value function throws", async ({ q }) => {
    await q.button("Copy broken value").click();
    await test.expect(q.button("Couldn't copy")).toBeVisible();
  });

  test("skips the copy when onClick prevents the default", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => navigator.clipboard.writeText("before"));
    const copy = q.button("Copy secret");
    await copy.click();
    // A retrying assertion would pass before a copy could settle. The browser
    // handles clipboard calls in order, so a single read comes after any copy
    // that the click started.
    const unchanged = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(unchanged).toBe("before");
    await test.expect(copy).toBeVisible();
    await q.checkbox("I understand this key is secret").click();
    await copy.click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toBe("secret");
  });
});
