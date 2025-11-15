import type { Locator, Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

function getScrollElement(page: Page, name: string) {
  const q = query(page);
  if (name.startsWith("Default")) {
    return q.tabpanel(name);
  }
  if (name.startsWith("Child")) {
    return q.tabpanel(name).locator("div").first();
  }
  return q.tabpanel(name).locator("..");
}

function scroll(locator: Locator, x: number, y: number) {
  return locator.evaluate(
    (el, [x, y]) => {
      el.scrollLeft = x;
      el.scrollTop = y;
    },
    [x, y] as const,
  );
}

function getScrollPosition(locator: Locator) {
  return locator.evaluate((el) => [el.scrollLeft, el.scrollTop]);
}

for (const scrollElement of ["Default", "Child", "Parent"]) {
  const scrollX = scrollElement === "Parent" ? 0 : 5;
  const scrollY = 100;

  for (const restore of ["", "Unmount", "Single"]) {
    const name = `${scrollElement}${restore}`;
    const tabs = [`${name} 1`, `${name} 2`];

    for (const tab of tabs) {
      test(`Restore scroll on ${tab}`, async ({ page }) => {
        const q = query(page);

        await q.tab(tab).click();
        await expect(q.tabpanel(tab)).toBeVisible();

        const scroller = getScrollElement(page, tab);
        await scroll(scroller, scrollX, scrollY);

        const otherTab = tabs.find((t) => t !== tab);
        await q.tab(otherTab).click();
        await expect(q.tabpanel(otherTab)).toBeVisible();
        await expect(q.tabpanel(tab)).not.toBeVisible();
        await q.tab(tab).click();
        await expect(q.tabpanel(tab)).toBeVisible();

        expect(await getScrollPosition(scroller)).toEqual([scrollX, scrollY]);
      });
    }
  }

  for (const reset of ["Reset", "UnmountReset", "SingleReset"]) {
    const name = `${scrollElement}${reset}`;
    const tabs = [`${name} 1`, `${name} 2`];

    for (const tab of tabs) {
      test(`Reset scroll on ${tab}`, async ({ page }) => {
        const q = query(page);

        await q.tab(tab).click();
        await expect(q.tabpanel(tab)).toBeVisible();

        const scroller = getScrollElement(page, tab);
        await scroll(scroller, scrollX, scrollY);

        const otherTab = tabs.find((t) => t !== tab);
        await q.tab(otherTab).click();
        await expect(q.tabpanel(otherTab)).toBeVisible();
        await expect(q.tabpanel(tab)).not.toBeVisible();
        await q.tab(tab).click();
        await expect(q.tabpanel(tab)).toBeVisible();

        expect(await getScrollPosition(scroller)).toEqual([0, 0]);
      });
    }
  }
}
