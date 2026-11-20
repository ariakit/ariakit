import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The strip scroll buttons, fades, and panel corners follow scroll-driven
// animations, which the Firefox build of Playwright supports only from version
// 159, so these tests run only in Chrome and Safari.

// The fades and the panel corners have no accessible state, so their progress
// is read from the custom properties that their animations set.
function getProgress(element: Locator, ...names: string[]) {
  return element.evaluate((node, names) => {
    const style = getComputedStyle(node);
    return names.map((name) => style.getPropertyValue(name));
  }, names);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("drops the scroll state of the strip when closing a tab stops it from scrolling", async ({
    page,
    q,
  }) => {
    // Four tabs overflow the strip at this width, and three fit.
    await page.setViewportSize({ width: 500, height: 600 });
    await q.button("New note").click();
    await test.expect(q.tab()).toHaveCount(4);
    // The panel corner beside the selected first tab opens while the strip
    // scrolls it out.
    await q.tab("Groceries").click();
    await q.button("Next tabs").click();
    await test.expect(q.button("Previous tabs")).toBeVisible();
    // The close mark is the last element in its tab.
    await q.tab("Note 1").locator(":scope > :last-child").click();
    await test.expect(q.tab()).toHaveCount(3);
    const strip = q.tablist("Open notes");
    await test.expect
      .poll(() => strip.evaluate((node) => node.scrollWidth - node.clientWidth))
      .toBe(0);
    // The strip stops scrolling above, but a button that stays shows only on
    // the frames that render after the scroll timeline goes inactive.
    await flushFrames(page);
    await test.expect(q.button("Previous tabs")).toBeHidden();
    await test.expect(q.button("Next tabs")).toBeHidden();
    await test.expect
      .poll(() => getProgress(strip, "--carousel-start", "--carousel-end"))
      .toEqual(["0", "0"]);
    // The panel corners belong to the element around the tab panels.
    const panels = q.tabpanel("Groceries").locator("..");
    await test.expect
      .poll(() => getProgress(panels, "--tabs-open-s"))
      .toEqual(["0"]);
  });
});
