import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getCenter, getLeft, getTabNames } from "./test-helpers.ts";

/**
 * Presses a tab with the mouse and moves the pointer by a distance along the
 * strip, in steps, as a hand does. The button stays down.
 */
async function pressAndMove(page: Page, tab: Locator, distance: number) {
  const { x, y } = await getCenter(tab);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + distance, y, { steps: 8 });
}

/** The top corners of the panels of a tab list, at its start and its end. */
function getPanelCorners(panel: Locator) {
  return panel.evaluate((element) => {
    const panels = element.parentElement;
    if (!panels) throw new Error("The panel has no parent.");
    const style = getComputedStyle(panels);
    return {
      start: Number.parseFloat(style.borderStartStartRadius),
      end: Number.parseFloat(style.borderStartEndRadius),
    };
  });
}

// A drag with the mouse needs the layout and the pointer events of a browser.
withFramework(import.meta.dirname, async ({ test }) => {
  test("moves a tab to the place where the pointer drops it", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Open notes");
    const tab = q.tab("Groceries");
    const distance = (await getLeft(q.tab("Workshop"))) - (await getLeft(tab));
    await pressAndMove(page, tab, distance);
    // The other tab makes room before the drop, and the app has no call yet.
    await test.expect
      .poll(
        async () => (await getLeft(q.tab("Workshop"))) < (await getLeft(tab)),
      )
      .toBe(true);
    await test.expect(q.text(/^Open notes: 0 moves\./)).toBeVisible();
    await page.mouse.up();
    await test
      .expect(q.text("Open notes: 1 move. Workshop, Groceries, Trip"))
      .toBeVisible();
    await test.expect
      .poll(() => getTabNames(list))
      .toEqual(["Workshop", "Groceries", "Trip"]);
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Groceries")).toBeVisible();
  });

  test("selects a tab when its drag starts", async ({ page, q }) => {
    const tab = q.tab("Trip");
    await test.expect(tab).toHaveAttribute("aria-selected", "false");
    await pressAndMove(page, tab, -40);
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Trip")).toBeVisible();
    await page.mouse.up();
  });

  test("moves the tab with the pointer from the move that starts its drag", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Workshop");
    const left = await getLeft(tab);
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x, y);
    await page.mouse.down();
    // One move past the 10 pixels that start the drag, and no move after it.
    await page.mouse.move(x + 12, y);
    await test.expect.poll(() => getLeft(tab)).toBeCloseTo(left + 12, 0);
    await page.keyboard.press("Escape");
    await page.mouse.up();
  });

  test("makes room for the full size of a pressed tab", async ({ page, q }) => {
    const list = q.tablist("Open notes");
    const tab = q.tab("Trip");
    const other = q.tab("Workshop");
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x, y);
    await page.mouse.down();
    // A pressed tab that isn't selected yet shows a little smaller.
    await test.expect
      .poll(() =>
        tab.evaluate((element) => {
          // The computed width is the width in the layout, with no scale.
          const width = Number.parseFloat(getComputedStyle(element).width);
          return width - element.getBoundingClientRect().width;
        }),
      )
      .toBeGreaterThan(1);
    const distance = (await getLeft(other)) - (await getLeft(tab));
    await page.mouse.move(x + distance, y, { steps: 8 });
    await test.expect
      .poll(async () => (await getLeft(other)) > (await getLeft(tab)))
      .toBe(true);
    // The place of the other tab after its slide, or after the slide at the
    // drop, if any.
    const getRestLeft = () =>
      other.evaluate(async (element) => {
        const animations = element.getAnimations();
        await Promise.allSettled(animations.map((item) => item.finished));
        return element.getBoundingClientRect().left;
      });
    const room = await getRestLeft();
    await page.mouse.up();
    await test.expect
      .poll(() => getTabNames(list))
      .toEqual(["Groceries", "Trip", "Workshop"]);
    // With room for a smaller tab, the other tab would slide to its place at
    // the drop.
    test.expect(Math.abs((await getRestLeft()) - room)).toBeLessThan(0.25);
  });

  test("puts the tab back when Escape ends the drag", async ({ page, q }) => {
    const list = q.tablist("Open notes");
    const tab = q.tab("Trip");
    const left = await getLeft(tab);
    await pressAndMove(page, tab, -200);
    await test.expect.poll(() => getLeft(tab)).toBeLessThan(left - 150);
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await test.expect.poll(() => getLeft(tab)).toBeCloseTo(left, 0);
    await test.expect(q.text(/^Open notes: 0 moves\./)).toBeVisible();
    await test.expect
      .poll(() => getTabNames(list))
      .toEqual(["Groceries", "Workshop", "Trip"]);
  });

  // The close mark is hidden from assistive technologies, so it has no role or
  // name to query. It's the last element in its tab.
  const getCloseMark = (tab: Locator) => tab.locator(":scope > :last-child");

  // Presses a tab beside its close mark, drags it away, and drops it back in
  // its place, with the mark under the pointer again.
  const dropOnCloseMark = async (page: Page, tab: Locator) => {
    const mark = await getCenter(getCloseMark(tab));
    await page.mouse.move(mark.x - 30, mark.y);
    await page.mouse.down();
    await page.mouse.move(mark.x + 40, mark.y, { steps: 8 });
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await page.mouse.move(mark.x - 30, mark.y, { steps: 8 });
    await page.mouse.up();
    return mark;
  };

  test("doesn't press the close mark under the pointer at the drop", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Workshop");
    await dropOnCloseMark(page, tab);
    await test.expect(q.text(/^Open notes: 0 moves\./)).toBeVisible();
    // A click that closes the tab would come with the drop, and the tab would
    // then leave within its 200ms transition. The tab has no state to wait for
    // when it stays, so that time passes first.
    await page.waitForTimeout(300);
    await test.expect(tab).toBeVisible();
  });

  test("takes a press on the close mark right after a drop", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Workshop");
    const mark = await dropOnCloseMark(page, tab);
    await page.mouse.click(mark.x, mark.y);
    await test.expect(tab).toHaveCount(0);
  });

  test("hides the separators beside the place of the dragged tab", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Open notes");
    const tab = q.tab("Groceries");
    // The separators are hidden from assistive technologies, so they have no
    // role or name to query. The row holds one before each tab after the first,
    // and one before the button after the tab list.
    const getOpacities = () =>
      list.evaluate((strip) => {
        const separators =
          strip.parentElement?.querySelectorAll(".control-separator");
        return Array.from(separators ?? []).map((separator) => {
          return getComputedStyle(separator).opacity;
        });
      });
    // The separator beside the selected first tab hides.
    await test.expect.poll(getOpacities).toEqual(["0", "1", "1"]);
    const step = (await getLeft(q.tab("Workshop"))) - (await getLeft(tab));
    await pressAndMove(page, tab, step);
    // The tab takes the second place, between two separators.
    await test.expect.poll(getOpacities).toEqual(["0", "0", "1"]);
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x + step, y, { steps: 8 });
    // At the last place, the tab is beside the separator of the button.
    await test.expect.poll(getOpacities).toEqual(["1", "0", "0"]);
    await page.mouse.up();
    await test
      .expect(q.text("Open notes: 1 move. Workshop, Trip, Groceries"))
      .toBeVisible();
    // The separators keep that look in the new order, with no fade between
    // them. A fade would show for 200ms after the drop, and the look that stays
    // has no state to wait for, so that time passes first.
    await page.waitForTimeout(100);
    test.expect(await getOpacities()).toEqual(["1", "0", "0"]);
  });

  test("makes the corners of the panel follow a selected first tab", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Groceries");
    const panel = q.tabpanel("Groceries");
    // A selected first tab leaves no room for the corner of the panel.
    await test.expect
      .poll(() => getPanelCorners(panel))
      .toMatchObject({
        start: 0,
      });
    // The drag starts after 10 pixels. The pointer then comes back, so the tab
    // is a few pixels from the start of the row, and the corner takes half of
    // that room: more than no corner, and less than a whole one.
    const whole = (await getPanelCorners(panel)).end;
    await pressAndMove(page, tab, 12);
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x - 4, y, { steps: 2 });
    await test.expect
      .poll(async () => (await getPanelCorners(panel)).start)
      .toBeGreaterThan(0);
    test.expect((await getPanelCorners(panel)).start).toBeLessThan(whole);
    // Far from the start, the corner is whole.
    await page.mouse.move(x + 60, y, { steps: 8 });
    await test.expect
      .poll(() => getPanelCorners(panel))
      .toMatchObject({
        start: whole,
      });
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await test.expect
      .poll(() => getPanelCorners(panel))
      .toMatchObject({
        start: 0,
      });
  });

  test("keeps the corners of the panel with the dragged tab on each frame", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Groceries");
    await pressAndMove(page, tab, 20);
    // The corners and the curves of the tab read how far the tab is from the
    // start of its row. A value from the frame before would trail the tab while
    // the pointer moves, and would reach it after the pointer rests, so no
    // state after the move shows the difference. This reads the largest gap
    // between the value and the place of the tab on the frames of the move.
    const farthest = tab.evaluate((element) => {
      return new Promise<number>((resolve) => {
        const row = element.closest(".tab-row");
        let distance = row ? 0 : Number.POSITIVE_INFINITY;
        let frames = 0;
        const step = () => {
          if (row) {
            const tabLeft = element.getBoundingClientRect().left;
            const offset = tabLeft - row.getBoundingClientRect().left;
            const style = getComputedStyle(element);
            const value = style.getPropertyValue("--tab-move-start");
            const gap = Math.abs(offset - Number.parseFloat(value));
            distance = Math.max(distance, gap);
          }
          frames += 1;
          if (frames < 30) {
            requestAnimationFrame(step);
            return;
          }
          resolve(distance);
        };
        requestAnimationFrame(step);
      });
    });
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x + 150, y, { steps: 20 });
    test.expect(await farthest).toBeLessThan(1);
    await page.keyboard.press("Escape");
    await page.mouse.up();
  });

  test("makes both corners follow a tab in a stretched tab list", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Calendar");
    const panel = q.tabpanel("Calendar");
    await tab.click();
    // A selected last tab of a stretched list meets the end corner.
    const rest = await getPanelCorners(panel);
    test.expect(rest.end).toBe(0);
    const distance = (await getLeft(q.tab("Board"))) - (await getLeft(tab));
    await pressAndMove(page, tab, distance);
    await test.expect
      .poll(() => getPanelCorners(panel))
      .toEqual({ start: 0, end: rest.start });
    await page.mouse.up();
    await test
      .expect(q.text("Views: 1 move. Calendar, Board, List"))
      .toBeVisible();
    await test.expect
      .poll(() => getPanelCorners(panel))
      .toEqual({ start: 0, end: rest.start });
  });

  test("moves a tab against the text direction from right to left", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Home");
    const distance = (await getLeft(q.tab("Search"))) - (await getLeft(tab));
    await pressAndMove(page, tab, distance);
    await test.expect
      .poll(async () => (await getLeft(q.tab("Search"))) > (await getLeft(tab)))
      .toBe(true);
    await page.mouse.up();
    await test
      .expect(q.text("Pages: 1 move. Search, Home, Settings"))
      .toBeVisible();
  });

  test("keeps a disabled tab in its place", async ({ page, q }) => {
    const tab = q.tab("package.json");
    await tab.scrollIntoViewIfNeeded();
    const left = await getLeft(tab);
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 120, y, { steps: 8 });
    // A drag would move the tab with the pointer by the next frame, and a tab
    // that stays has no state to wait for, so the frames pass first.
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );
    test.expect(await getLeft(tab)).toBeCloseTo(left, 0);
    await page.mouse.up();
    await test.expect(q.text(/^Files: 0 moves\./)).toBeVisible();
  });

  test("keeps the tabs of a list without onReorder in their places", async ({
    page,
    q,
  }) => {
    const tab = q.tab("One");
    const left = await getLeft(tab);
    await pressAndMove(page, tab, 100);
    // See the test of the disabled tab.
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );
    test.expect(await getLeft(tab)).toBeCloseTo(left, 0);
    await page.mouse.up();
    await test.expect
      .poll(() => getTabNames(q.tablist("Fixed tabs")))
      .toEqual(["One", "Two", "Three"]);
  });

  test("scrolls the strip while the pointer rests near its end", async ({
    page,
    q,
  }) => {
    const list = q.tablist("Files");
    const tab = q.tab("index.ts");
    const box = await list.boundingBox();
    if (!box) throw new Error("The tab list has no bounding box.");
    const { x, y } = await getCenter(tab);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 24, y, { steps: 8 });
    // The strip scrolls to its end, where the last tab shows whole.
    await test.expect(q.tab("vite.config.ts")).toBeInViewport({ ratio: 1 });
    await test.expect
      .poll(() =>
        list.evaluate((strip) => {
          return strip.scrollWidth - strip.clientWidth - strip.scrollLeft;
        }),
      )
      .toBeLessThan(1);
    await page.mouse.up();
    // The tab passed every other tab, the disabled one too.
    await test
      .expect(q.text(/^Files: 1 move\..* vite\.config\.ts, index\.ts$/))
      .toBeVisible();
  });
});
