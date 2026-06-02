import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("preserves React ref cleanup", async ({ page, q }) => {
    await test.expect
      .poll(() => page.evaluate(() => !!(window as any).__refCleanupTest), {
        timeout: 15000,
      })
      .toBe(true);
    await test.expect(q.button("Unmount button")).toBeVisible();
    await test.expect(q.text("Connected portal content")).toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() =>
          (window as any).__refCleanupTest?.getActiveListeners(),
        ),
      )
      .toEqual(["button", "connected portal", "portal"]);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetListenerEvents(),
    );
    await test.expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__refCleanupTest?.buttonObjectRef.current
              ?.textContent,
        ),
      )
      .toBe("Observed button");

    await q.button("Unmount button").click();
    await test.expect(q.button("Observed button")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() =>
          (window as any).__refCleanupTest?.getActiveListeners(),
        ),
      )
      .toEqual(["connected portal", "portal"]);
    await test.expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__refCleanupTest?.buttonObjectRef.current === null,
        ),
      )
      .toBe(true);
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["external button detach", "button cleanup"]);
    await page.evaluate(() =>
      (window as any).__refCleanupTest?.clickObservedButton(),
    );
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["external button detach", "button cleanup"]);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetListenerEvents(),
    );
    await test.expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__refCleanupTest?.plainButtonObjectRef.current
              ?.textContent,
        ),
      )
      .toBe("Plain button");
    await q.button("Unmount plain button").click();
    await test.expect(q.button("Plain button")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__refCleanupTest?.plainButtonObjectRef.current ===
            null,
        ),
      )
      .toBe(true);
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["plain button detach"]);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetListenerEvents(),
    );
    await q.button("Unmount portal").click();
    await test.expect(q.text("Portal content")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() =>
          (window as any).__refCleanupTest?.getActiveListeners(),
        ),
      )
      .toEqual(["connected portal"]);
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["portal cleanup"]);
    await page.evaluate(() =>
      (window as any).__refCleanupTest?.clickObservedPortal(),
    );
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["portal cleanup"]);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetListenerEvents(),
    );
    await q.button("Unmount connected portal").click();
    await test.expect(q.text("Connected portal content")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() =>
          (window as any).__refCleanupTest?.getActiveListeners(),
        ),
      )
      .toEqual([]);
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["connected portal cleanup"]);
    await test.expect(page.locator("#connected-portal-root")).toHaveCount(1);
    await page.evaluate(() =>
      (window as any).__refCleanupTest?.clickObservedConnectedPortal(),
    );
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["connected portal cleanup"]);

    await page.evaluate(() =>
      (window as any).__refCleanupTest?.resetListenerEvents(),
    );
    await q.button("Unmount non-function portal").click();
    await test.expect(q.text("Non-function portal content")).not.toBeVisible();
    await test.expect
      .poll(() =>
        page.evaluate(() => (window as any).__refCleanupTest?.listenerEvents),
      )
      .toEqual(["non-function portal detach"]);
  });
});
