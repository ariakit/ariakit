import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("does not refocus a late item after focus leaves the composite", async ({
    page,
    q,
  }) => {
    await q.button("First").focus();
    await page.keyboard.press("ArrowDown");
    const mount = q.button("Mount late items");
    await mount.focus();
    await mount.evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });

    await test.expect(mount).toBeFocused();
    await test.expect(q.button("Late")).not.toBeFocused();
  });

  test("only focuses the latest item after rapid unresolved moves", async ({
    page,
    q,
  }) => {
    await q.button("First").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    await q.button("Mount late items").evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });

    await test.expect(q.button("Late")).not.toBeFocused();
    await test.expect(q.button("Later")).toBeFocused();
  });
});
