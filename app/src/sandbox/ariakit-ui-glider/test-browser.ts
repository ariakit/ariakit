import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { getBoxOffset, getItemsToScale } from "./test-helpers.ts";

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

  // https://github.com/ariakit/ariakit/issues/8489
  test("rests the selected box on the selected item under a scale transform", async ({
    page,
    q,
  }) => {
    await page.addStyleTag({
      content: "body { transform-origin: 0 0; transform: scale(2); }",
    });
    for (const item of getItemsToScale(q)) {
      await item.click();
      // The boxes are measured in screen pixels, which are twice the CSS pixels
      // here, so the tolerance doubles too.
      await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(1);
    }
  });

  // The size of a group can't tell these scales apart from rounding: a
  // content-box group has only a rounded offset size, and a slight scale moves
  // its sides by about a pixel.
  const slightScales = [
    // https://github.com/ariakit/ariakit/pull/8491#discussion_r4607211345
    { name: "no scale", width: "120.5px", scale: "none" },
    // The height of the group changes by less than a pixel here.
    { name: "scale(1.02)", width: "120.5px", scale: "scale(1.02)" },
    // https://github.com/ariakit/ariakit/pull/8491#discussion_r4607564015
    { name: "scale(0.995)", width: "120px", scale: "scale(0.995)" },
  ];

  for (const { name, width, scale } of slightScales) {
    test(`rests the selected box on the selected item in a content box group with ${name}`, async ({
      page,
      q,
    }) => {
      await page.addStyleTag({
        content: `
          [aria-label="Scrolling"] { box-sizing: content-box; width: ${width}; }
          body { transform-origin: 0 0; transform: ${scale}; }
        `,
      });
      const item = query(q.article("Scrolling")).radio("Board");
      await item.click();
      await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
    });
  }

  test("adds nothing to the scrollable content of the group", async ({ q }) => {
    const group = query(q.article("Scrolling")).radiogroup("Scrolling");
    const item = query(group).radio("Board");
    await item.click();
    await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(0.5);
    // The scale probe of the glider is taller than the group. Unless it is
    // clipped, it adds to the scrollable height of the group.
    const overflow = await group.evaluate(
      (node) => node.scrollHeight - node.clientHeight,
    );
    test.expect(overflow).toBe(0);
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

  test("fades the separators beside an item with the travel of the box", async ({
    page,
    q,
  }) => {
    // The very slow travel time keeps the box away from the items long enough
    // to read the separators.
    await q.combobox(/^Travel time/).selectOption({ label: "Very slow (3s)" });
    const box = query(q.article("Separators"));
    const getControl = (item: Locator) =>
      item.locator(
        "xpath=ancestor-or-self::*[contains(concat(' ', @class, ' '), ' control ')][1]",
      );
    const calendar = getControl(box.radio("Calendar"));
    const board = getControl(box.radio("Board"));
    // The separators are presentation, so this probe reads the one before an
    // item from the DOM.
    const getOpacity = (control: Locator) =>
      control.evaluate((node) => {
        const separator = node.previousElementSibling;
        if (!separator) return Number.NaN;
        return Number.parseFloat(getComputedStyle(separator).opacity);
      });
    // A separator hides with a 200ms opacity transition when no box travels.
    const separatorTime = 200;

    // A hover does not move the selected box, so the separator between Grid and
    // Board hides in its own time.
    await box.radio("Grid").hover();
    // The 1s limit is far above the 200ms of the separator and far below the 3s
    // travel time.
    await test.expect.poll(() => getOpacity(board), { timeout: 1000 }).toBe(0);
    await page.mouse.move(0, 0);

    // A hover or a focus on an item hides the separator beside it in its own
    // time, so buttons outside the group select the items here.
    await box.button("Show the calendar").click();
    await test.expect(calendar).toHaveAttribute("data-glider-masked");
    // Without the travel time, the separator between Board and Calendar would
    // be gone after its 200ms transition, which no state tracks.
    await page.waitForTimeout(separatorTime);
    test.expect(await getOpacity(calendar)).toBeGreaterThan(0);
    await test.expect(calendar).toHaveAttribute("data-glider-masked");
    await test.expect(calendar).not.toHaveAttribute("data-glider-masked");
    await test.expect.poll(() => getOpacity(calendar)).toBe(0);

    // The separator between Board and Calendar is beside the selected item for
    // the whole travel, so it stays hidden while the box moves across it.
    await box.button("Show the board").click();
    await test.expect(board).toHaveAttribute("data-glider-masked");
    // A separator that wrongly fades in has its 200ms transition to show, which
    // no state tracks.
    await page.waitForTimeout(separatorTime);
    test.expect(await getOpacity(calendar)).toBe(0);
    await test.expect(board).toHaveAttribute("data-glider-masked");
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

  // The panels element follows the glider of the strip, so a navigation in it,
  // outside the panel, must not take the panels as its own followers.
  test("keeps the panel corners with a glider beside the panel", async ({
    page,
    q,
  }) => {
    const reference = query(q.article("Glider in a tab panel"));
    const box = query(q.article("Glider beside a tab panel"));
    for (const tab of [reference.tab("Month"), box.tab("Month")]) {
      await tab.click();
      await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(0.5);
    }
    // The box of the navigation moves back to the first link, at the start of
    // its group, where it would square the panel corner that it took.
    for (const name of ["Components", "Overview"]) {
      const link = box.link(name);
      await link.click();
      await test.expect.poll(() => getBoxOffset(link)).toBeLessThan(0.5);
    }
    // A follower transitions to the place of the box over the same travel time,
    // so the frames after the box arrives cover the end of that transition. The
    // corners must not change there.
    await flushFrames(page);
    test
      .expect(await getCorners(box.tabpanel()))
      .toBe(await getCorners(reference.tabpanel()));
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

  // The browser can report the start of a travel a frame or more after it
  // starts on the compositor, so the long task comes one or two frames after
  // the click.
  for (const [frames, label] of [
    [1, "one frame"],
    [2, "two frames"],
  ] as const) {
    test(`starts a new travel from where the box shows after a long task ${label} after a click`, async ({
      q,
    }) => {
      // The very slow travel keeps the box short of Grid after the long task,
      // so a catch-up that counted the long task twice would show.
      await q
        .combobox(/^Travel time/)
        .selectOption({ label: "Very slow (3s)" });
      // The box is presentation, so this probe reads it from the DOM. The
      // travel to Grid runs on the compositor while a long task, such as a
      // render, holds the page at the frame before it. Board is past Grid, so
      // the box keeps going the same way.
      const places = await q
        .article("Glider")
        .evaluate(async (node, frames) => {
          const getRadio = (value: string) =>
            node.querySelector<HTMLInputElement>(`input[value="${value}"]`);
          const box = node.querySelector('.glider-box[data-selected="true"]');
          const grid = getRadio("Grid")?.closest(".control");
          if (!box || !grid) return null;
          const getLeft = (element: Element) =>
            element.getBoundingClientRect().left;
          // The glider moves the box in a microtask after a click, and a frame
          // shows after its callbacks, so each read waits for a task after a
          // frame.
          const afterPaint = () =>
            new Promise((resolve) => {
              requestAnimationFrame(() => setTimeout(resolve));
            });
          const start = getLeft(box);
          getRadio("Grid")?.click();
          for (let frame = 0; frame < frames; frame++) {
            await afterPaint();
          }
          const lastFrame = getLeft(box);
          const blockStart = performance.now();
          while (performance.now() - blockStart < 600) {
            // A long task.
          }
          getRadio("Board")?.click();
          await afterPaint();
          return { start, grid: getLeft(grid), lastFrame, next: getLeft(box) };
        }, frames);
      if (!places) {
        throw new Error("The glider has no selected box");
      }
      // The new travel starts where the box shows after the long task, not
      // where the page last drew it, which would show the box go back. It
      // doesn't start where the box would show after twice the long task
      // either, near Grid.
      const distance = places.grid - places.start;
      const moved = places.next - places.lastFrame;
      test.expect(moved).toBeGreaterThan(distance * 0.2);
      test.expect(moved).toBeLessThan(distance * 0.65);
    });
  }

  test("keeps a travel on its way when an item changes after a long task", async ({
    q,
  }) => {
    // The very slow travel keeps the box short of Calendar after the long task.
    await q.combobox(/^Travel time/).selectOption({ label: "Very slow (3s)" });
    const article = q.article("A count that changes");
    const box = query(article);
    // The first card shows the badge on Board, and the second one changes only
    // its count, so Calendar keeps its place.
    await box.button("Add a card").click();
    await test.expect(box.radio("Board 1")).toBeVisible();
    // The box is presentation, so this probe reads it from the DOM. The count
    // changes while the box travels to Calendar, after a long task, so the
    // glider reads where the box shows to start the copies again.
    const places = await article.evaluate(async (node) => {
      const calendar = node.querySelector<HTMLInputElement>(
        'input[value="Calendar"]',
      );
      const addCard = Array.from(node.querySelectorAll("button")).find(
        (button) => button.textContent === "Add a card",
      );
      const box = node.querySelector('.glider-box[data-selected="true"]');
      const target = calendar?.closest(".control");
      if (!calendar || !addCard || !box || !target) return null;
      const getLeft = (element: Element) =>
        element.getBoundingClientRect().left;
      // The glider moves the box in a microtask after a click, and a frame
      // shows after its callbacks, so each read waits for a task after a frame.
      const afterPaint = () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
      const start = getLeft(box);
      calendar.click();
      for (let frame = 0; frame < 2; frame++) {
        await afterPaint();
      }
      const blockStart = performance.now();
      while (performance.now() - blockStart < 600) {
        // A long task.
      }
      addCard.click();
      await afterPaint();
      return { start, calendar: getLeft(target), next: getLeft(box) };
    });
    if (!places) {
      throw new Error("The glider has no selected box");
    }
    // The box keeps its travel, so it shows where the time since the click puts
    // it, not where twice the long task would, near Calendar.
    const distance = places.calendar - places.start;
    test.expect(places.next - places.start).toBeLessThan(distance * 0.6);
  });

  test("doesn't move the box ahead when a long task delays the start of its travel", async ({
    q,
  }) => {
    await q.combobox(/^Travel time/).selectOption({ label: "Slow (800ms)" });
    // The box is presentation, so this probe reads it from the DOM. A long task
    // right after the click on Grid holds the travel until its first frame, so
    // the box is still near List when Board takes the selection.
    const places = await q.article("Glider").evaluate(async (node) => {
      const getRadio = (value: string) =>
        node.querySelector<HTMLInputElement>(`input[value="${value}"]`);
      const box = node.querySelector('.glider-box[data-selected="true"]');
      const grid = getRadio("Grid")?.closest(".control");
      if (!box || !grid) return null;
      const getLeft = (element: Element) =>
        element.getBoundingClientRect().left;
      // The glider moves the box in a microtask after a click, and a frame
      // shows after its callbacks, so each read waits for a task after a frame.
      const afterPaint = () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
      const start = getLeft(box);
      getRadio("Grid")?.click();
      await Promise.resolve();
      const blockStart = performance.now();
      while (performance.now() - blockStart < 500) {
        // A long task.
      }
      for (let frame = 0; frame < 3; frame++) {
        await afterPaint();
      }
      const lastFrame = getLeft(box);
      getRadio("Board")?.click();
      await afterPaint();
      return { start, grid: getLeft(grid), lastFrame, next: getLeft(box) };
    });
    if (!places) {
      throw new Error("The glider has no selected box");
    }
    // The new travel starts where the box shows, which moved for a few frames
    // only, not for the time of the long task, which would put it near Grid.
    // The box can still move a little after the last frame on a busy machine.
    const distance = places.grid - places.start;
    test.expect(places.next - places.lastFrame).toBeLessThan(distance * 0.6);
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

  test("keeps the copies while the item that the box travels to moves", async ({
    q,
  }) => {
    await q.combobox(/^Travel time/).selectOption({ label: "Very slow (3s)" });
    // The copies and the mask are presentation, so this probe reads them from
    // the DOM. It adds a card 2s into the 3s travel to Calendar. The badge
    // makes Board grow, so Calendar moves, and the box starts a new move. It
    // returns whether Calendar lost its mask before the box reached it, or null
    // when Calendar did not move.
    const unmaskedEarly = await q
      .article("A count that changes")
      .evaluate(async (node) => {
        const calendar = node.querySelector<HTMLInputElement>(
          'input[value="Calendar"]',
        );
        const target = calendar?.closest(".control");
        const button = Array.from(node.querySelectorAll("button")).find(
          (element) => element.textContent?.trim() === "Add a card",
        );
        const box = node.querySelector('.glider-box[data-selected="true"]');
        if (!calendar || !target || !button || !box) return null;
        calendar.click();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const calendarLeft = target.getBoundingClientRect().left;
        button.click();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const moved = target.getBoundingClientRect().left - calendarLeft;
        if (Math.abs(moved) < 1) return null;
        const start = performance.now();
        while (performance.now() - start < 5000) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const boxRect = box.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const left = Math.abs(boxRect.left - targetRect.left);
          const width = Math.abs(boxRect.width - targetRect.width);
          if (left < 0.5 && width < 0.5) return false;
          if (!target.hasAttribute("data-glider-masked")) return true;
        }
        return null;
      });
    test.expect(unmaskedEarly).toBe(false);
  });
});
