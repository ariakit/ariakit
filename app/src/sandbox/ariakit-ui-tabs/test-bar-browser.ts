import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("positions a nonanimated bar on either side of tabs with different surface effects", async ({
    q,
  }) => {
    const list = q.tablist("Bar placement");
    const bar = list.locator(":scope > .glider");
    const tabs = query(list).tab();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS("transition-duration", "0s");
    await q.combobox("Tab bar distance").selectOption("6px");
    await expect
      .poll(async () => {
        const [marker, item] = await Promise.all([
          getBox(bar),
          getBox(tabs.first()),
        ]);
        return marker.y - item.y - item.height;
      })
      .toBeCloseTo(6, 0);
    await tabs.last().click();
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(async () => {
        const [marker, item] = await Promise.all([
          getBox(bar),
          getBox(tabs.last()),
        ]);
        return marker.x - item.x;
      })
      .toBeCloseTo(0, 0);
    await q.combobox("Tab bar side").selectOption("start");
    await expect
      .poll(async () => {
        const box = await getBox(bar);
        return (await getBox(tabs.last())).y - box.y - box.height;
      })
      .toBeCloseTo(6, 0);
    await q.combobox("Tab bar distance").selectOption("frame");
    await expect
      .poll(async () => (await getBox(bar)).y - (await getBox(list)).y)
      .toBeCloseTo(0, 0);
  });

  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4022810357
  test("keeps the bar aligned while navigating and scrolling tabs in RTL", async ({
    q,
    page,
  }) => {
    await q.checkbox("Tabs right to left").check();
    const list = q.tablist("Bar placement");
    const tab = query(list).tab("Project settings");
    await query(list).tab("Preview").click();
    await page.keyboard.press("ArrowLeft");
    await expect(query(list).tab("Code")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => list.evaluate((node) => node.scrollLeft))
      .toBeLessThan(0);
    const bar = list.locator(":scope > .glider");
    await expect
      .poll(async () => {
        const [marker, item] = await Promise.all([getBox(bar), getBox(tab)]);
        return marker.x - item.x;
      })
      .toBeCloseTo(0, 0);
    await q.combobox("Tab bar distance").selectOption("frame");
    await list.evaluate((node) => {
      node.scrollLeft += 24;
    });
    await page.evaluate(() => window.scrollBy(0, 20));
    await expect
      .poll(async () => {
        const [marker, item] = await Promise.all([getBox(bar), getBox(tab)]);
        return marker.x - item.x;
      })
      .toBeCloseTo(0, 0);
    await expect
      .poll(async () => {
        const [box, bounds] = await Promise.all([getBox(bar), getBox(list)]);
        return box.y + box.height - bounds.y - bounds.height;
      })
      .toBeCloseTo(0, 0);
  });
});
