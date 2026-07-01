import { withFramework } from "#app/test-utils/preview.ts";

// See https://github.com/ariakit/ariakit/issues/6585
// To reproduce the React 18 StrictMode failure in a browser, serve the app with
// `pnpm react18 dev-app`. CI's React 18 signal comes from test.ts.
const portalId = "portal/tooltip-repro";

async function getPortalState(page: {
  evaluate: <T>(fn: (id: string) => T, arg: string) => Promise<T>;
}) {
  return page.evaluate((id) => {
    const nodes = Array.from(document.querySelectorAll(`#${CSS.escape(id)}`));
    const node = nodes[0];
    const fullscreenElement = document.fullscreenElement;

    return {
      count: nodes.length,
      parentIsBody: node?.parentElement === document.body,
      parentIsFullscreen:
        !!fullscreenElement && node?.parentElement === fullscreenElement,
    };
  }, portalId);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not leak duplicate tooltip portal containers", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    await q.button("Hover target").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 1");

    await q.button("Unmount tooltip").click();
    await test.expect(q.tooltip("Tooltip content")).not.toBeVisible();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    const state = await getPortalState(page);
    test.expect(state.count).toBe(0);
  });

  test("keeps one portal container while moving in and out of fullscreen", async ({
    page,
    q,
  }) => {
    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    await q.button("Hover target").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 1");

    let state = await getPortalState(page);
    test.expect(state).toMatchObject({
      count: 1,
      parentIsFullscreen: true,
    });

    await q.button("Exit fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement == null);
    await q.button("Hover target").hover();
    await test.expect(q.tooltip("Tooltip content")).toBeVisible();

    state = await getPortalState(page);
    test.expect(state).toMatchObject({
      count: 1,
      parentIsBody: true,
    });

    await q.button("Enter fullscreen").click();
    await page.waitForFunction(() => document.fullscreenElement != null);

    state = await getPortalState(page);
    test.expect(state).toMatchObject({
      count: 1,
      parentIsFullscreen: true,
    });

    await q.button("Unmount tooltip").click();
    await test
      .expect(q.status("Portal containers"))
      .toHaveText("Portal containers: 0");

    state = await getPortalState(page);
    test.expect(state.count).toBe(0);
  });
});
