import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6314
  test("keeps sibling setup teardowns active after a stale init disposer runs", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("a");
    await page.keyboard.press("b");
    await test.expect(q.text("A count: 1")).toBeVisible();
    await test.expect(q.text("B count: 1")).toBeVisible();

    await q.button("Stop hotkey A").click();
    await test.expect(q.text("A active: no")).toBeVisible();

    await page.keyboard.press("a");
    await test.expect(q.text("A count: 1")).toBeVisible();

    await page.keyboard.press("b");
    await test.expect(q.text("B count: 2")).toBeVisible();

    await q.button("Hide panel A").click();
    await test.expect(q.text("A count:")).toHaveCount(0);

    await page.keyboard.press("b");
    await test.expect(q.text("B count: 3")).toBeVisible();
  });
});
