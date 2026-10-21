import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

// The bar is decorative and hidden from assistive technology, so only its box
// can be queried. Every tab renders one, and only the selected tab shows it.
function getBar(tab: Locator) {
  return tab.locator(".control-bar");
}

async function getCenterOffset(bar: Locator, tab: Locator) {
  const [marker, item] = await Promise.all([getBox(bar), getBox(tab)]);
  return marker.x + marker.width / 2 - item.x - item.width / 2;
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("positions a bar on either side of tabs with different surface effects", async ({
    q,
  }) => {
    const list = q.tablist("Bar placement");
    const tabs = query(list).tab();
    const first = tabs.first();
    const last = tabs.last();
    await expect(getBar(first)).toBeVisible();
    await expect(getBar(last)).toBeHidden();
    await q.combobox("Tab bar distance").selectOption("6px");
    await expect
      .poll(async () => {
        const [marker, item] = await Promise.all([
          getBox(getBar(first)),
          getBox(first),
        ]);
        return marker.y - item.y - item.height;
      })
      .toBeCloseTo(6, 0);
    await last.click();
    await expect(last).toHaveAttribute("aria-selected", "true");
    await expect(getBar(last)).toBeVisible();
    await expect(getBar(first)).toBeHidden();
    await expect
      .poll(() => getCenterOffset(getBar(last), last))
      .toBeCloseTo(0, 0);
    await q.combobox("Tab bar side").selectOption("start");
    await expect
      .poll(async () => {
        const box = await getBox(getBar(last));
        return (await getBox(last)).y - box.y - box.height;
      })
      .toBeCloseTo(6, 0);
    // An edge bar ends on the 12px frame padding edge, inside the root border
    // that the strip also covers.
    await q.combobox("Tab bar distance").selectOption("edge");
    await expect
      .poll(async () => (await getBox(last)).y - (await getBox(getBar(last))).y)
      .toBeCloseTo(12, 0);
    await expect
      .poll(async () => (await getBox(getBar(last))).y - (await getBox(list)).y)
      .toBeCloseTo(1, 0);
  });

  test("centers a bar in the frame padding below or above a tab", async ({
    q,
  }) => {
    const list = q.tablist("Bar placement");
    const tab = query(list).tab("Preview");
    const bar = getBar(tab);
    await q.combobox("Tab bar distance").selectOption("halfway");
    for (const side of ["end", "start"]) {
      await q.combobox("Tab bar side").selectOption(side);
      // Half of the 12px frame padding minus the 2px bar.
      await expect
        .poll(async () => {
          const [box, item] = await Promise.all([getBox(bar), getBox(tab)]);
          return side === "start"
            ? item.y - box.y - box.height
            : box.y - item.y - item.height;
        })
        .toBeCloseTo(5, 0);
    }
  });

  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4022810357
  test("keeps the bar aligned while navigating and scrolling tabs in RTL", async ({
    q,
    page,
  }) => {
    await q.checkbox("Tabs right to left").check();
    const list = q.tablist("Bar placement");
    const tab = query(list).tab("Project settings");
    const bar = getBar(tab);
    await query(list).tab("Preview").click();
    await page.keyboard.press("ArrowLeft");
    await expect(query(list).tab("Code")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => list.evaluate((node) => node.scrollLeft))
      .toBeLessThan(0);
    await expect.poll(() => getCenterOffset(bar, tab)).toBeCloseTo(0, 0);
    await q.combobox("Tab bar distance").selectOption("edge");
    await list.evaluate((node) => {
      node.scrollLeft += 24;
    });
    await page.evaluate(() => window.scrollBy(0, 20));
    await expect.poll(() => getCenterOffset(bar, tab)).toBeCloseTo(0, 0);
    // The edge bar ends on the 12px frame padding edge below the tab.
    await expect
      .poll(async () => {
        const [box, item] = await Promise.all([getBox(bar), getBox(tab)]);
        return box.y + box.height - item.y - item.height;
      })
      .toBeCloseTo(12, 0);
  });
});
