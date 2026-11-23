import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  getBoxOffset,
  getItemsToScale,
  getLargestTravel,
  getTravelProgress,
} from "./test-helpers.ts";

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

// The travel times of the "Very slow (3s)" and "Slow (800ms)" options.
const VERY_SLOW_TRAVEL = 3000;
const SLOW_TRAVEL = 800;

// A long task, such as a render, that holds the page while the box travels on
// the compositor.
const LONG_TASK = 600;

interface LongTaskTimes {
  /** When the probe selects the item that the box travels to. */
  clickedAt: number;
  /** After the first frame that follows the click, when the travel shows. */
  shownAt: number;
  /** When the probe changes the glider after the long task. */
  changedAt: number;
  /** When the probe reads the box. */
  readAt: number;
}

/**
 * Returns the range, as a part of the distance, where the box can show after a
 * long task during its travel. The range comes from the time that passed, so
 * slow frames on a busy machine move it with the box. The bounds are halfway to
 * the places of the bugs: a travel that starts again from where the page last
 * drew the box, near the start, and one that counts the long task twice.
 */
function getLongTaskRange(times: LongTaskTimes, duration: number) {
  // The travel shows from the first frame after the click, so the box is about
  // this far when the change comes. The browser can report the start of the
  // travel a frame or more late, so the bound has a margin.
  const least = getTravelProgress(times.changedAt - times.shownAt, duration);
  // The travel can't start before the click, so the box is at most this far
  // when the probe reads it.
  const most = getTravelProgress(times.readAt - times.clickedAt, duration);
  const twice = getTravelProgress(
    times.readAt - times.clickedAt + LONG_TASK,
    duration,
  );
  return { min: least / 2, max: (most + twice) / 2 };
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
    // The time of the opacity transition of the separator before an item, in
    // milliseconds, which is the time of the state that it goes to.
    const getOpacityDuration = (control: Locator) =>
      control.evaluate((node) => {
        const separator = node.previousElementSibling;
        if (!separator) return Number.NaN;
        const style = getComputedStyle(separator);
        const properties = style.transitionProperty.split(", ");
        const durations = style.transitionDuration.split(", ");
        const index = properties.findIndex(
          (property) => property === "opacity" || property === "all",
        );
        if (index < 0) return Number.NaN;
        // The durations repeat when the list is shorter than the properties.
        const duration = durations[index % durations.length] ?? "";
        return (
          Number.parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000)
        );
      });
    // A separator hides with a 200ms opacity transition when no box travels.
    const separatorTime = 200;

    // A hover does not move the selected box, so the separator between Grid and
    // Board hides in its own time, not in the 3s travel time. A busy machine
    // can apply the hover late, so the probe reads the time of the fade from
    // the separator instead of a limit on the wall clock.
    await box.radio("Grid").hover();
    await test.expect.poll(() => getOpacity(board)).toBe(0);
    test.expect(await getOpacityDuration(board)).toBe(separatorTime);
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

  // The Hydrated checkbox renders the whole page again, which takes seconds on
  // a busy machine, so each tab gets its own test and its own time.
  for (const { name, tabs } of cornerCases) {
    for (const tab of tabs) {
      test(`gives the panel of ${name.toLowerCase()} the corners of the server markup with ${tab} selected`, async ({
        q,
      }) => {
        const item = query(q.article(name)).tab(tab);
        await item.click();
        await expectServerCorners(
          q.article(name),
          q.checkbox(/^Hydrated/),
          item,
        );
      });
    }
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
    // The probe reads the corner radius of the panels with the box at rest on
    // Month, which a busy machine can reach well after the 800ms travel. On the
    // first tab, the corner is square.
    const month = query(article).tab("Month");
    await month.click();
    await test.expect.poll(() => getBoxOffset(month)).toBeLessThan(0.5);
    // The box and the panels are presentation, so this probe reads the place
    // that each one takes on every frame. A new panels element replaces the old
    // one on each selection, including Day, which the user selects 100ms into
    // the travel to Week.
    const places = await article.evaluate(async (node) => {
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
      const panels = getPanels();
      if (!box || !panels) return null;
      const sample = async (duration: number) => {
        const samples: Array<{ panels: number; box: number }> = [];
        const start = performance.now();
        while (performance.now() - start < duration) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          samples.push({ panels: getStart(getPanels()), box: getStart(box) });
        }
        return samples;
      };
      const radius = Number.parseFloat(
        getComputedStyle(panels).borderStartStartRadius,
      );
      getTab("Week")?.click();
      const toWeek = await sample(100);
      const beforeDay = getStart(box);
      getTab("Day")?.click();
      const toDay = await sample(1000);
      return { radius, toWeek, beforeDay, toDay };
    });
    if (!places) {
      throw new Error("The tabs have no selected box or panels");
    }
    const day = query(article).tab("Day");
    await test.expect.poll(() => getBoxOffset(day)).toBeLessThan(0.5);
    const end = await day.evaluate((element) => {
      const box = element
        .closest(".glider-group")
        ?.querySelector('.glider-box[data-selected="true"]');
      if (!box) return Number.NaN;
      const value = getComputedStyle(box).getPropertyValue("--glider-start");
      return Number.parseFloat(value);
    });
    const { radius, toWeek, beforeDay, toDay } = places;
    // Firefox gives the new panels the place of the box from the last frame
    // before the click, but starts the new travel of the box from where it
    // shows after the click frame. Both travels go to Day in the same time, so
    // the panels trail the box by its move in the click frame, which shrinks
    // with the rest of the travel. A slow click frame on a busy machine makes
    // that move longer. The box rests on Month before Week, so the panels and
    // the box start from the same place there.
    const firstDay = toDay[0]?.box ?? Number.NaN;
    const getTrail = (box: number) => {
      const span = firstDay - end;
      // A machine that shows its first frame after the travel ends both travels
      // on it, so the panels have no trail.
      if (Math.abs(span) < 0.5) return 0;
      const rest = (box - end) / span;
      return Math.abs(beforeDay - firstDay) * Math.max(0, rest);
    };
    // The corners change only while half of the place is below the corner
    // radius, so the probe compares the places there, relative to the radius.
    // Without a start at the place of the box, the gap reaches many radii.
    const getLargestGap = (
      samples: typeof toDay,
      getAllowed: (box: number) => number,
    ) => {
      let gap = 0;
      for (const sample of samples) {
        if (Math.min(sample.panels, sample.box) >= radius * 2) continue;
        const excess =
          Math.abs(sample.panels - sample.box) - getAllowed(sample.box);
        gap = Math.max(gap, excess);
      }
      return gap / radius;
    };
    test.expect(getLargestGap(toWeek, () => 0)).toBeLessThan(0.5);
    test.expect(getLargestGap(toDay, getTrail)).toBeLessThan(0.5);
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
      const places = await q.article("Glider").evaluate(
        async (node, { frames, longTask }) => {
          const getRadio = (value: string) =>
            node.querySelector<HTMLInputElement>(`input[value="${value}"]`);
          const box = node.querySelector('.glider-box[data-selected="true"]');
          const grid = getRadio("Grid")?.closest(".control");
          const board = getRadio("Board")?.closest(".control");
          if (!box || !grid || !board) return null;
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
          const clickedAt = performance.now();
          await afterPaint();
          const shownAt = performance.now();
          for (let frame = 1; frame < frames; frame++) {
            await afterPaint();
          }
          const blockStart = performance.now();
          while (performance.now() - blockStart < longTask) {
            // A long task.
          }
          getRadio("Board")?.click();
          const changedAt = performance.now();
          await afterPaint();
          const next = getLeft(box);
          const readAt = performance.now();
          return {
            start,
            grid: getLeft(grid),
            board: getLeft(board),
            next,
            times: { clickedAt, shownAt, changedAt, readAt },
          };
        },
        { frames, longTask: LONG_TASK },
      );
      if (!places) {
        throw new Error("The glider has no selected box");
      }
      // The new travel starts where the box shows after the long task, not
      // where the page last drew it, which would show the box go back. It
      // doesn't start where the box would show after twice the long task
      // either, near Grid. The upper bound is halfway between these two places
      // at the click on Board, plus the move of the new travel to Board from
      // there until the read. A slow frame before the read raises the bound
      // with the box.
      const { clickedAt, changedAt, readAt } = places.times;
      const distance = places.grid - places.start;
      const progress = (places.next - places.start) / distance;
      const range = getLongTaskRange(places.times, VERY_SLOW_TRAVEL);
      const atChange =
        (getTravelProgress(changedAt - clickedAt, VERY_SLOW_TRAVEL) +
          getTravelProgress(
            changedAt - clickedAt + LONG_TASK,
            VERY_SLOW_TRAVEL,
          )) /
        2;
      const toBoard = (places.board - places.start) / distance - atChange;
      const max =
        atChange +
        getTravelProgress(readAt - changedAt, VERY_SLOW_TRAVEL) * toBoard;
      test.expect(progress).toBeGreaterThan(range.min);
      test.expect(progress).toBeLessThan(max);
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
    const places = await article.evaluate(async (node, longTask) => {
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
      const clickedAt = performance.now();
      await afterPaint();
      const shownAt = performance.now();
      await afterPaint();
      const blockStart = performance.now();
      while (performance.now() - blockStart < longTask) {
        // A long task.
      }
      addCard.click();
      const changedAt = performance.now();
      await afterPaint();
      const next = getLeft(box);
      const readAt = performance.now();
      return {
        start,
        calendar: getLeft(target),
        next,
        times: { clickedAt, shownAt, changedAt, readAt },
      };
    }, LONG_TASK);
    if (!places) {
      throw new Error("The glider has no selected box");
    }
    // The box keeps its travel, so it shows where the time since the click puts
    // it, not where twice the long task would, near Calendar. The range has no
    // use here as a lower bound: Chrome can keep the travel pending, with no
    // start time, until after the read, so it reads the box at its start.
    const progress =
      (places.next - places.start) / (places.calendar - places.start);
    const range = getLongTaskRange(places.times, VERY_SLOW_TRAVEL);
    test.expect(progress).toBeLessThan(range.max);
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
      const board = getRadio("Board")?.closest(".control");
      if (!box || !grid || !board) return null;
      const getLeft = (element: Element) =>
        element.getBoundingClientRect().left;
      // The glider moves the box in a microtask after a click, and a frame
      // shows after its callbacks, so each read waits for a task after a frame.
      // It resolves with the time of the frame, when the page drew the box.
      const afterPaint = () =>
        new Promise<number>((resolve) => {
          requestAnimationFrame((time) => setTimeout(() => resolve(time)));
        });
      const start = getLeft(box);
      getRadio("Grid")?.click();
      const clickedAt = performance.now();
      await Promise.resolve();
      const blockStart = performance.now();
      while (performance.now() - blockStart < 500) {
        // A long task.
      }
      let lastFrameAt = 0;
      for (let frame = 0; frame < 3; frame++) {
        lastFrameAt = await afterPaint();
      }
      const lastFrame = getLeft(box);
      getRadio("Board")?.click();
      const changedAt = performance.now();
      await afterPaint();
      const next = getLeft(box);
      const readAt = performance.now();
      return {
        start,
        grid: getLeft(grid),
        board: getLeft(board),
        lastFrame,
        next,
        clickedAt,
        lastFrameAt,
        changedAt,
        readAt,
      };
    });
    if (!places) {
      throw new Error("The glider has no selected box");
    }
    // The new travel starts where the box shows, which moved for a few frames
    // only, not for the time of the long task, which would put it near Grid.
    // After the last frame, the box can still move as far as the travel to Grid
    // goes in the time to the read, and then as far as the travel to Board goes
    // from the click on Board, so slow frames on a busy machine move the bound
    // too. The bound is halfway to where the box would be ahead, when that is
    // past the move that the box can make.
    const distance = places.grid - places.start;
    const moved = (places.next - places.lastFrame) / distance;
    const canMove =
      getLargestTravel(places.readAt - places.lastFrameAt, SLOW_TRAVEL) +
      getTravelProgress(places.readAt - places.changedAt, SLOW_TRAVEL) *
        ((places.board - places.start) / distance);
    const ahead =
      getTravelProgress(places.readAt - places.clickedAt, SLOW_TRAVEL) -
      (places.lastFrame - places.start) / distance;
    test.expect(moved).toBeLessThan((canMove + Math.max(canMove, ahead)) / 2);
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

  test("moves the copies with the items that resize while the box travels", async ({
    q,
  }) => {
    await q.combobox(/^Travel time/).selectOption({ label: "Very slow (3s)" });
    // The copies are presentation, so this probe reads them from the DOM. It
    // clicks Calendar, waits for the copies, resizes Grid and Board by opposite
    // widths so the group keeps its size, and checks the copy offsets in one
    // evaluate call so IPC latency on slow runners cannot outlast the 3s
    // travel.
    const largestOffset = await q
      .article("Glider", { exact: true })
      .evaluate(async (node) => {
        const calendar = node.querySelector<HTMLInputElement>(
          'input[value="Calendar"]',
        );
        const probe = node.querySelector(".glider-scale-probe");
        const grid = node
          .querySelector('input[value="Grid"]')
          ?.closest(".control");
        const board = node
          .querySelector('input[value="Board"]')
          ?.closest(".control");
        if (!calendar) return null;
        if (!probe) return null;
        if (!grid) return null;
        if (!board) return null;
        const nextFrame = () =>
          new Promise((resolve) => requestAnimationFrame(resolve));
        const getCopies = () =>
          node
            .querySelector(".glider-window > .glider-layer")
            ?.querySelectorAll<HTMLElement>(".glider-copy");
        calendar.click();
        const copyStart = performance.now();
        while (performance.now() - copyStart < 2000) {
          if (getCopies()?.length) break;
          await nextFrame();
        }
        if (!getCopies()?.length) return null;
        const boardLeft = board.getBoundingClientRect().left;
        // A style outside the group makes Grid wider and Board narrower by the
        // same width, so the group keeps its size, and only a resize callback
        // of the items reports the change.
        const rules = [
          { value: "Grid", width: grid.getBoundingClientRect().width + 20 },
          { value: "Board", width: board.getBoundingClientRect().width - 20 },
        ].map(({ value, width }) => {
          const selector = `.control:has(> input[value="${value}"])`;
          return `${selector} { flex: none; width: ${width}px; overflow: hidden; }`;
        });
        const style = document.createElement("style");
        style.textContent = rules.join("\n");
        document.head.append(style);
        try {
          if (Math.abs(board.getBoundingClientRect().left - boardLeft) < 1) {
            return null;
          }
          const items = Array.from(node.querySelectorAll(".control")).filter(
            (control) => !control.closest(".glider"),
          );
          const getLargestOffset = (copies: NodeListOf<HTMLElement>) => {
            const probeLeft = probe.getBoundingClientRect().left;
            let largest = 0;
            for (const copy of copies) {
              const text = copy.textContent?.trim();
              const item = items.find((control) => {
                return control.textContent?.trim() === text;
              });
              if (!item) return Number.POSITIVE_INFINITY;
              const itemLeft = item.getBoundingClientRect().left - probeLeft;
              const copyLeft = Number.parseFloat(copy.style.left);
              largest = Math.max(largest, Math.abs(itemLeft - copyLeft));
            }
            return largest;
          };
          let lastOffset: number | null = null;
          const start = performance.now();
          while (performance.now() - start < 2000) {
            await nextFrame();
            const copies = getCopies();
            if (!copies?.length) break;
            lastOffset = getLargestOffset(copies);
            if (lastOffset < 0.5) break;
          }
          return lastOffset;
        } finally {
          style.remove();
        }
      });
    test.expect(largestOffset).not.toBeNull();
    test.expect(largestOffset).toBeLessThan(0.5);
  });
});
