import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// The glider is presentation with aria-hidden, so it has no accessible name.
// These probes read its selected box from the DOM and compare it with the box
// of the item that the user selected.
function getBoxOffset(item: Locator) {
  return item.evaluate((element) => {
    const control = element.closest(".control");
    const group = control?.closest(".glider-group");
    const box = group?.querySelector('.glider-box[data-selected="true"]');
    if (!control || !box) return Number.POSITIVE_INFINITY;
    const itemRect = control.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    return Math.max(
      Math.abs(itemRect.left - boxRect.left),
      Math.abs(itemRect.top - boxRect.top),
      Math.abs(itemRect.width - boxRect.width),
      Math.abs(itemRect.height - boxRect.height),
    );
  });
}

function countBoxes(article: Locator) {
  return article.evaluate(
    (node) => node.querySelectorAll(".glider-box").length,
  );
}

// The element around the tab panels draws the corners that meet the selected
// folder, and the glider writes the place of the box to it.
function getCorners(panel: Locator) {
  return panel.evaluate((node) => {
    const panels = node.closest(".glider-follower");
    if (!panels) return null;
    const style = getComputedStyle(panels);
    return `${style.borderStartStartRadius} ${style.borderStartEndRadius}`;
  });
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("rests the selected box on the selected item", async ({ q }) => {
    const items = [
      query(q.article("Glider")).radio("Grid"),
      query(q.article("Tabs")).tab("Quarter"),
      query(q.article("Folder tabs")).tab("Month"),
      query(q.article("Stretched folder tabs")).tab("Year"),
      query(q.article("Right to left")).radio("Board"),
      query(q.article("Vertical navigation")).link("Accessibility"),
    ];
    for (const item of items) {
      await item.click();
      await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
    }
  });

  test("shows the item in the idle state until the box reaches it", async ({
    q,
  }) => {
    // The slow travel time keeps the box away from the item long enough to
    // observe the masked state.
    await q.combobox(/^Travel time/).selectOption({ label: "Slow (800ms)" });
    const box = query(q.article("Glider"));
    const item = box.radio("Calendar");
    await item.click();
    const control = item.locator(
      "xpath=ancestor-or-self::*[contains(concat(' ', @class, ' '), ' control ')][1]",
    );
    await test.expect(control).toHaveAttribute("data-glider-masked");
    await test.expect(control).not.toHaveAttribute("data-glider-masked");
    await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
    await test.expect(item).toBeChecked();
  });

  test("lets the items paint their own state when it is off", async ({
    page,
    q,
  }) => {
    const article = q.article("Glider");
    await test.expect.poll(() => countBoxes(article)).toBeGreaterThan(0);

    await q.checkbox(/^Hydrated/).uncheck();
    await test.expect.poll(() => countBoxes(article)).toBe(0);

    await q.checkbox(/^Hydrated/).check();
    await test.expect.poll(() => countBoxes(article)).toBeGreaterThan(0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await test.expect.poll(() => countBoxes(article)).toBe(0);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await test.expect.poll(() => countBoxes(article)).toBeGreaterThan(0);
  });

  test("gives the panel the corners of the server markup", async ({ q }) => {
    const cases = [
      { name: "Folder tabs", tabs: ["Month", "Day"] },
      { name: "Folder tabs with no outer edge", tabs: ["Month", "Day"] },
      { name: "Adapted folder curve", tabs: ["Month", "Day"] },
      { name: "Stretched folder tabs", tabs: ["Year", "Month", "Day"] },
      { name: "Flat tab before folders", tabs: ["Folder", "Flat"] },
    ];
    for (const { name, tabs } of cases) {
      const box = query(q.article(name));
      const panel = box.tabpanel();
      for (const tab of tabs) {
        const item = box.tab(tab);
        await item.click();
        await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
        await q.checkbox(/^Hydrated/).uncheck();
        await test.expect.poll(() => countBoxes(q.article(name))).toBe(0);
        const serverCorners = await getCorners(panel);
        await q.checkbox(/^Hydrated/).check();
        await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
        await test.expect.poll(() => getCorners(panel)).toBe(serverCorners);
      }
    }
  });
});
