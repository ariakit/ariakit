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
    const first = await getBox(tabs.first());
    await expect
      .poll(async () => (await getBox(bar)).y - first.y - first.height)
      .toBeCloseTo(6, 0);
    await tabs.last().click();
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(async () => (await getBox(bar)).x)
      .toBeCloseTo((await getBox(tabs.last())).x, 0);
    await q.combobox("Tab bar side").selectOption("start");
    await expect
      .poll(async () => {
        const box = await getBox(bar);
        return (await getBox(tabs.last())).y - box.y - box.height;
      })
      .toBeCloseTo(6, 0);
    await q.combobox("Tab bar distance").selectOption("frame");
    await expect
      .poll(async () => (await getBox(bar)).y)
      .toBeCloseTo((await getBox(list)).y, 0);
  });

  test("keeps the bar aligned while scrolling tabs in RTL", async ({
    q,
    page,
  }) => {
    await q.checkbox("Tabs right to left").check();
    const list = q.tablist("Bar placement");
    const tab = query(list).tab("Project settings");
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    expect(await list.evaluate((node) => node.scrollLeft)).toBeLessThan(0);
    const bar = list.locator(":scope > .glider");
    await expect
      .poll(async () => (await getBox(bar)).x)
      .toBeCloseTo((await getBox(tab)).x, 0);
    await q.combobox("Tab bar distance").selectOption("frame");
    await list.evaluate((node) => {
      node.scrollLeft += 24;
    });
    await page.evaluate(() => window.scrollBy(0, 20));
    await expect
      .poll(async () => (await getBox(bar)).x)
      .toBeCloseTo((await getBox(tab)).x, 0);
    await expect
      .poll(async () => {
        const box = await getBox(bar);
        return box.y + box.height;
      })
      .toBeCloseTo((await getBox(list)).y + (await getBox(list)).height, 0);
  });
});
