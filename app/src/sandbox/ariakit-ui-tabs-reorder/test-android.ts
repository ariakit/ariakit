import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getCenter, getLeft } from "./test-helpers.ts";
import type { Point } from "./test-helpers.ts";

// Playwright can tap, but it cannot hold a finger down or drag it, so the tests
// send touches through the Chrome DevTools Protocol. Chrome then scrolls, or
// cancels the pointer, as it would for a person.
async function openTouchscreen(page: Page) {
  const session = await page.context().newCDPSession(page);
  return {
    send: async (
      type: "touchStart" | "touchMove" | "touchEnd",
      touchPoints: Point[],
    ) => {
      await session.send("Input.dispatchTouchEvent", { type, touchPoints });
    },
    [Symbol.asyncDispose]: () => session.detach(),
  };
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("scrolls the strip with a swipe and moves no tab", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Files");
    const { x, y } = await getCenter(q.tab("utils.ts"));
    await using touchscreen = await openTouchscreen(page);
    await touchscreen.send("touchStart", [{ x, y }]);
    for (let step = 1; step <= 10; step++) {
      await touchscreen.send("touchMove", [{ x: x - step * 12, y }]);
    }
    await touchscreen.send("touchEnd", []);
    await test.expect
      .poll(() => list.evaluate((strip) => strip.scrollLeft))
      .toBeGreaterThan(50);
    await test.expect(q.text(/^Files: 0 moves\./)).toBeVisible();
    await test
      .expect(q.tab("index.ts"))
      .toHaveAttribute("aria-selected", "true");
  });

  test("picks a tab up with a long press and moves it with the finger", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Files");
    const tab = q.tab("index.ts");
    const next = q.tab("tabs.ariakit.react.tsx");
    const { x, y } = await getCenter(tab);
    const distance = (await getCenter(next)).x - x;
    const scrollLeft = await list.evaluate((strip) => strip.scrollLeft);
    await test
      .expect(q.tab("utils.ts"))
      .toHaveAttribute("aria-selected", "false");
    await using touchscreen = await openTouchscreen(page);
    const { x: nextX, y: nextY } = await getCenter(q.tab("utils.ts"));
    await touchscreen.send("touchStart", [{ x: nextX, y: nextY }]);
    await touchscreen.send("touchEnd", []);
    await touchscreen.send("touchStart", [{ x, y }]);
    // The tab takes the selection when the long press picks it up.
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    for (let step = 1; step <= 10; step++) {
      const moved = (distance * step) / 10;
      await touchscreen.send("touchMove", [{ x: x + moved, y: y + step }]);
    }
    await test.expect
      .poll(async () => (await getLeft(next)) < (await getLeft(tab)))
      .toBe(true);
    await touchscreen.send("touchEnd", []);
    await test
      .expect(
        q.text(
          /^Files: 1 move\. tabs\.ariakit\.react\.tsx, index\.ts, utils\.ts,/,
        ),
      )
      .toBeVisible();
    // The finger moved the tab, and not the strip.
    test
      .expect(await list.evaluate((strip) => strip.scrollLeft))
      .toBe(scrollLeft);
  });
});
