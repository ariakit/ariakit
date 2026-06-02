import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves React ref cleanup", async ({ page, q }) => {
    await test.expect(q.button("Unmount button")).toBeVisible();
    await test.expect
      .poll(() => page.evaluate(() => !!(window as any).__refCleanupTest))
      .toBe(true);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetRefEvents(),
    );
    await test.expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__refCleanupTest?.buttonObjectRef.current
              ?.textContent,
        ),
      )
      .toBe("Rendered button");

    await q.button("Unmount button").click();
    await test.expect(q.button("Rendered button")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.refEvents),
      )
      .toEqual(["plain detach", "cleanup"]);
    await test.expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__refCleanupTest?.buttonObjectRef.current === null,
        ),
      )
      .toBe(true);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetRefEvents(),
    );
    await q.button("Unmount portal").click();
    await test.expect(q.text("Portal content")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.portalRefEvents),
      )
      .toEqual(["portal cleanup"]);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetRefEvents(),
    );
    await q.button("Unmount connected portal").click();
    await test.expect(q.text("Connected portal content")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(
          () => (window as any).__refCleanupTest?.connectedPortalRefEvents,
        ),
      )
      .toEqual(["connected portal cleanup"]);
    await test.expect(page.locator("#connected-portal-root")).toHaveCount(1);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetRefEvents(),
    );
    await q.button("Unmount non-function portal").click();
    await test.expect(q.text("Non-function portal content")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(
          () => (window as any).__refCleanupTest?.nonFunctionPortalRefEvents,
        ),
      )
      .toEqual(["non-function portal detach"]);
  });
});
