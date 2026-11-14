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

  // Turns the glider off to read the corners that the server markup gives the
  // panel, then turns it on again and expects the same corners.
  const expectServerCorners = async (
    article: Locator,
    hydrated: Locator,
    item: Locator,
  ) => {
    const panel = query(article).tabpanel();
    await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
    await hydrated.uncheck();
    await test.expect.poll(() => countBoxes(article)).toBe(0);
    const serverCorners = await getCorners(panel);
    test.expect(serverCorners).not.toBeNull();
    await hydrated.check();
    await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
    await test.expect.poll(() => getCorners(panel)).toBe(serverCorners);
  };

  const cornerCases = [
    { name: "Folder tabs", tabs: ["Month", "Day"] },
    { name: "Folder tabs with no outer edge", tabs: ["Month", "Day"] },
    { name: "Adapted folder curve", tabs: ["Month", "Day"] },
    { name: "Stretched folder tabs", tabs: ["Year", "Month", "Day"] },
    { name: "Flat tab before folders", tabs: ["Folder", "Flat"] },
  ];

  for (const { name, tabs } of cornerCases) {
    test(`gives the panel of ${name.toLowerCase()} the corners of the server markup`, async ({
      q,
    }) => {
      for (const tab of tabs) {
        const item = query(q.article(name)).tab(tab);
        await item.click();
        await expectServerCorners(
          q.article(name),
          q.checkbox(/^Hydrated/),
          item,
        );
      }
    });
  }

  test("keeps the panel corners with a glider in the panel", async ({ q }) => {
    const name = "Glider in a tab panel";
    const box = query(q.article(name));
    const tab = box.tab("Month");
    await tab.click();
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(0.5);
    // The glider in the panel moves to the first radio, which sits at the start
    // of its own group.
    const grid = box.radio("Grid");
    await grid.click();
    await test.expect.poll(() => getBoxOffset(grid)).toBeLessThan(0.5);
    const list = box.radio("List");
    await list.click();
    await test.expect.poll(() => getBoxOffset(list)).toBeLessThan(0.5);
    await expectServerCorners(q.article(name), q.checkbox(/^Hydrated/), tab);
  });

  test("keeps a new panels element with the box", async ({ q }) => {
    await q.combobox(/^Travel time/).selectOption({ label: "Slow (800ms)" });
    const article = q.article("Panels that change with the selection");
    // The box and the panels are presentation, so this probe reads the place
    // that each one takes on every frame. A new panels element replaces the old
    // one on each selection, including Day, which the user selects 100ms into
    // the travel to Week. The corners change only while half of the place is
    // below the corner radius, so the probe compares the places there, relative
    // to the radius. Without a start at the place of the box, the gap reaches
    // many radii. Firefox starts the replacing transition of the box from its
    // place on the next frame, so the new panels trail it by about one frame.
    const largestGap = await article.evaluate(async (node) => {
      const getTab = (label: string) =>
        Array.from(node.querySelectorAll<HTMLElement>("[role=tab]")).find(
          (tab) => tab.textContent?.trim() === label,
        );
      const getPanels = () => node.querySelector(".glider-follower");
      const getStart = (element: Element | null) => {
        if (!element) return Number.NaN;
        const value =
          getComputedStyle(element).getPropertyValue("--glider-start");
        return Number.parseFloat(value);
      };
      const box = node.querySelector('.glider-box[data-selected="true"]');
      const sample = async (duration: number, zone: number) => {
        let gap = 0;
        const start = performance.now();
        while (performance.now() - start < duration) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const panelsStart = getStart(getPanels());
          const boxStart = getStart(box);
          if (Math.min(panelsStart, boxStart) >= zone) continue;
          gap = Math.max(gap, Math.abs(panelsStart - boxStart));
        }
        return gap;
      };
      getTab("Month")?.click();
      // Waits for the box to rest on Month after the 800ms travel.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const panels = getPanels();
      if (!panels) return null;
      const radius = Number.parseFloat(
        getComputedStyle(panels).borderStartStartRadius,
      );
      getTab("Week")?.click();
      const firstGap = await sample(100, radius * 2);
      getTab("Day")?.click();
      const secondGap = await sample(1000, radius * 2);
      return Math.max(firstGap, secondGap) / radius;
    });
    test.expect(largestGap).not.toBeNull();
    test.expect(largestGap).toBeLessThan(0.5);
  });

  test("keeps the copies until the box stops", async ({ q }) => {
    await q.combobox(/^Travel time/).selectOption({ label: "Slow (800ms)" });
    // The copies and the mask are presentation, so this probe reads them from
    // the DOM. It selects Board 300ms into the 800ms travel to Grid, so the
    // width of the box turns back while the box still moves. It returns whether
    // Board lost its mask before the box reached it.
    const unmaskedEarly = await q
      .article("Items of two widths")
      .evaluate(async (node) => {
        const getRadio = (value: string) =>
          node.querySelector<HTMLInputElement>(`input[value="${value}"]`);
        const box = node.querySelector('.glider-box[data-selected="true"]');
        const target = getRadio("Board")?.closest(".control");
        if (!box || !target) return null;
        getRadio("Grid")?.click();
        await new Promise((resolve) => setTimeout(resolve, 300));
        getRadio("Board")?.click();
        const start = performance.now();
        while (performance.now() - start < 2000) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const boxLeft = box.getBoundingClientRect().left;
          const targetLeft = target.getBoundingClientRect().left;
          if (Math.abs(boxLeft - targetLeft) < 0.5) return false;
          if (!target.hasAttribute("data-glider-masked")) return true;
        }
        return null;
      });
    test.expect(unmaskedEarly).toBe(false);
  });
});
