import type { Locator } from "@playwright/test";
import { getBoxOffset } from "#app/sandbox/ariakit-ui-glider/test-helpers.ts";
import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  forEachColorSchemeOf,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({ page, visual, colorScheme, item: "ariakit-ui-tabs/page" }),
    );
  });

  // A negative distance puts the bar over its tab, so the bar inverts from the
  // tab instead of the tab list.
  test("paints a bar over its tab @visual", async ({ page, q, visual }) => {
    for (const contrast of ["no-preference", "more"] as const) {
      await page.emulateMedia({ contrast });
      await forEachColorSchemeOf(
        page,
        ["Bar placement"],
        async (colorScheme) => {
          const distance = q.combobox("Tab bar distance");
          await distance.selectOption("-3px");
          await test.expect(distance).toHaveValue("-3px");
          await captureInView({
            visual,
            box: q.article("Bar placement"),
            colorScheme,
            item: "ariakit-ui-tabs/bar-over-tab",
          });
        },
      );
    }
  });

  test("paints the hover pill on a hovered tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["Folder tabs"], async (colorScheme) => {
      const box = q.article("Folder tabs");
      // A synthesized pointer move that scrolls the strip into view does not
      // apply :hover in WebKit until the pointer enters another element, so the
      // pointer passes over Usage on its way to Preview.
      await query(box).tab("Usage").hover();
      await hoverOver(query(box).tab("Preview"));
      await visual(
        getCapture(box, colorScheme, { item: "ariakit-ui-tabs/hovered-tab" }),
      );
    });
  });

  test("paints the focus pill on a tab without selecting it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["Folder tabs"], async (colorScheme) => {
      const box = q.article("Folder tabs");
      const usage = query(box).tab("Usage");
      // Firefox leaves the modality of a click in place when an arrow key moves
      // focus, so the strip is reached with the keyboard.
      await tabTo(page, query(box).tab("Code"));
      await page.keyboard.press("ArrowRight");
      await expectFocusVisible(usage);
      await test.expect(usage).toHaveAttribute("aria-selected", "false");
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-tabs/focused-tab",
      });
    });
  });

  // The root edge cuts the curve of the selected first tab. The focus edge
  // thickens the tab sides, so the side border that closes the cut thickens
  // with them.
  test("paints the focus edge along a cut folder curve @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(page, ["With padding"], async (colorScheme) => {
      const box = q.article("With padding");
      const preview = query(box).tab("Preview");
      await tabTo(page, preview);
      await expectFocusVisible(preview);
      await test.expect(preview).toHaveAttribute("aria-selected", "true");
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-tabs/focused-cut-folder-tab",
      });
    });
  });

  // Focus kept the selected offset of flat and bevel tabs, so the brand fill
  // fell under 3:1 against a dark strip, also while hovered. Without the
  // offset, a selected push alone lightens the fill under 3:1 in light mode.
  // https://github.com/ariakit/ariakit/issues/8101
  test("removes the selected lift from a focused tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Bar placement", "Flat tabs"],
      async (colorScheme) => {
        const placement = q.article("Bar placement");
        const pushed = query(placement).tab("Preview");
        // Firefox makes this overflowing strip a tab stop, and focusing it
        // clears the active tab, so the Tab back from it would skip the tabs.
        // Arrow keys reach the tab with the keyboard.
        await pushed.focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowLeft");
        await expectFocusVisible(pushed);
        await test.expect(pushed).toHaveAttribute("aria-selected", "true");
        await captureInView({
          visual,
          box: placement,
          colorScheme,
          item: "ariakit-ui-tabs/focused-pushed-tab",
        });
        const box = q.article("Flat tabs");
        const code = query(box).tab("Code");
        await tabTo(page, code);
        await expectFocusVisible(code);
        await test.expect(code).toHaveAttribute("aria-selected", "true");
        await captureInView({
          visual,
          box,
          colorScheme,
          item: "ariakit-ui-tabs/focused-selected-tab",
        });
        await hoverOver(code);
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-tabs/focused-hovered-selected-tab",
          }),
        );
      },
    );
  });

  // The hover offset darkened the brand fill of a focused unselected flat tab
  // under 3:1 against a dark strip.
  // https://github.com/ariakit/ariakit/issues/8111
  test("keeps the focus fill of a hovered unselected tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Flat tabs without select on move"],
      async (colorScheme) => {
        const box = q.article("Flat tabs without select on move");
        const usage = query(box).tab("Usage");
        await hoverOver(usage);
        await tabTo(page, query(box).tab("Code"));
        await page.keyboard.press("ArrowRight");
        await expectFocusVisible(usage);
        await test.expect(usage).toHaveAttribute("aria-selected", "false");
        await test.expect
          .poll(() => usage.evaluate((node) => node.matches(":hover")))
          .toBe(true);
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-tabs/focused-hovered-tab",
          }),
        );
      },
    );
  });

  // The panel corners follow scroll-driven animations, which differ between
  // engines, so these tests run in every desktop browser. The visual captures
  // can't show the corners: a corner that squares or rounds changes only a few
  // low-contrast pixels, below the comparison threshold. Each step polls a
  // corner that changes at that scroll, so the other corner reads the same
  // scroll position.

  test("keeps the panel corners round beside a fading strip", async ({ q }) => {
    const title = "Overflowing strip";
    const list = query(q.article(title)).tablist(title);
    // The selected first tab joins the panel, so the start corner is square at
    // rest. Near the end, the end corner stays round under other tabs.
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 0, end: 12 });
    await scrollStripFromEnd(list, 10);
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 12, end: 12 });
  });

  // The fade at the end of a strip without buttons grows too slowly to hide a
  // selected last tab that leaves the end, so the panel squares the end corner
  // under the tab, as a strip without fades does, until the fade hides it.
  test("squares the end corner under a selected last tab that leaves the end", async ({
    q,
  }) => {
    const title = "Overflowing strip without buttons";
    const list = query(q.article(title)).tablist(title);
    const tab = query(list).tab("Changelog");
    await scrollStripFromEnd(list, 0);
    await tab.click();
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    // Each distance from the end changes the end corner from the one before.
    const steps = [
      { distance: 10, square: true },
      { distance: 40, square: false },
      { distance: 10, square: true },
      { distance: 0, square: false },
    ];
    for (const { distance, square } of steps) {
      await scrollStripFromEnd(list, distance);
      const endCorner = test.expect.poll(
        async () => (await getPanelCorners(list)).end,
      );
      // Almost square is less than half of the 12px corner.
      if (square) {
        await endCorner.toBeLessThan(6);
      } else {
        await endCorner.toBe(12);
      }
      test.expect((await getPanelCorners(list)).start).toBe(12);
    }
  });

  test("squares the panel corners beside a strip without fades", async ({
    q,
  }) => {
    const title = "Overflowing strip without fades";
    const list = query(q.article(title)).tablist(title);
    // At rest, the tabs past the end of the strip square the end corner.
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 12, end: 0 });
    await scrollStripFromStart(list, 120);
    await test.expect
      .poll(() => getPanelCorners(list))
      .toEqual({ start: 0, end: 0 });
  });

  test("keeps the round panel corners beside the buttons of a row with a glider", async ({
    q,
  }) => {
    const box = query(q.article("Tab row with a glider"));
    const first = box.tablist("Tab row glider");
    const last = box.tablist("Tab row glider stretch");
    // The panel follows the box once the box is on the selected tab.
    await test.expect
      .poll(() => getBoxOffset(query(first).tab("Quotes")))
      .toBeLessThan(0.5);
    await test.expect
      .poll(() => getBoxOffset(query(last).tab("Support")))
      .toBeLessThan(0.5);
    // A button is before the first tab and after the stretched last tab, so the
    // selected folder is not at the corner of the panel.
    test.expect(await getPanelCorners(first)).toEqual({ start: 12, end: 12 });
    test.expect(await getPanelCorners(last)).toEqual({ start: 12, end: 12 });
  });

  test("keeps the full folder curve of the box beside a button of a row with a glider", async ({
    q,
  }) => {
    const title = "Tab row glider adapt";
    const list = query(q.article("Tab row with a glider")).tablist(title);
    const quotes = query(list).tab("Quotes");
    await test.expect.poll(() => getBoxOffset(quotes)).toBeLessThan(0.5);
    // A button is before the first tab, so the box paints the full start curve
    // of the selected tab under it, like the tab itself.
    await test.expect.poll(() => getFolderCurves(quotes)).toEqual([12, 12]);
    await query(list).tab("Billing").click();
    await quotes.click();
    await test.expect.poll(() => getBoxOffset(quotes)).toBeLessThan(0.5);
    test.expect(await getFolderCurves(quotes)).toEqual([12, 12]);
  });

  test("moves the panel corner with the first tab while the name before the strip folds", async ({
    q,
  }) => {
    const title = "Tab row glider fold";
    const box = query(q.article("Tab row with a glider"));
    const list = box.tablist(title);
    const tab = query(list).tab("Quotes");
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(0.5);
    test.expect((await getPanelCorners(list)).start).toBe(12);
    const recording = await recordFold(box.text("Acme"));
    await box.button(`${title} hide name`).click();
    const samples = await recording.evaluate((record) => record.done);
    // The fold takes two seconds, so it shows on many frames.
    test.expect(samples.length).toBeGreaterThan(10);
    test.expect(samples[0]?.corner).toBe(12);
    // The first tab reaches the edge of the panel, so the corner is square.
    test.expect(samples.at(-1)?.corner).toBe(0);
    await test.expect
      .poll(() => getDistanceFromPanel(tab))
      .toBeLessThanOrEqual(1);
    // The corner shrinks as the tab comes near the edge, through the values
    // between, and doesn't jump at the end of the fold. A busy machine can skip
    // frames, so one frame between is enough.
    for (const [index, sample] of samples.entries()) {
      const previous = samples[index - 1];
      if (!previous) continue;
      test.expect(sample.corner).toBeLessThanOrEqual(previous.corner + 0.01);
    }
    const between = samples.filter(({ corner }) => corner > 0 && corner < 12);
    test.expect(between.length).toBeGreaterThanOrEqual(1);
  });

  test("rounds the panel corner when a button mounts before the strip of a row with a glider", async ({
    q,
  }) => {
    const title = "Tab row glider sidebar";
    const box = query(q.article("Tab row with a glider"));
    const list = box.tablist(title);
    await test.expect
      .poll(() => getBoxOffset(query(list).tab("Quotes")))
      .toBeLessThan(0.5);
    // The selected first tab is at the corner of the panel.
    test.expect((await getPanelCorners(list)).start).toBe(0);
    await box.checkbox(`${title} open`).uncheck();
    await test.expect(box.button(`${title} open sidebar`)).toBeVisible();
    await test.expect
      .poll(async () => (await getPanelCorners(list)).start)
      .toBe(12);
    // The button changes the padding of the strip, so the tabs move in it, and
    // the box stays on the selected tab.
    const quotes = query(list).tab("Quotes");
    await test.expect.poll(() => getBoxOffset(quotes)).toBeLessThan(0.5);
    await box.button(`${title} open sidebar`).click();
    await test.expect(box.button(`${title} open sidebar`)).toHaveCount(0);
    await test.expect
      .poll(async () => (await getPanelCorners(list)).start)
      .toBe(0);
    await test.expect.poll(() => getBoxOffset(quotes)).toBeLessThan(0.5);
  });

  test("moves the panel corner with the fold of the name during a travel of the box", async ({
    q,
  }) => {
    const title = "Tab row glider fold";
    const box = query(q.article("Tab row with a glider"));
    const list = box.tablist(title);
    await query(list).tab("Billing").click();
    // The box of this row travels for three seconds.
    await test.expect
      .poll(() => getBoxOffset(query(list).tab("Billing")), { timeout: 10_000 })
      .toBeLessThan(0.5);
    const recording = await recordFold(box.text("Acme"));
    await query(list).tab("Quotes").click();
    await box.button(`${title} hide name`).click();
    const samples = await recording.evaluate((record) => record.done);
    // The name folds in two seconds, while the box still travels to Quotes for
    // about one more second. The box is then a few pixels from the edge of the
    // panel, so the corner is almost square. A corner that waits for the end of
    // the travel would still be full.
    test.expect(samples.at(-1)?.corner).toBeLessThan(11);
  });

  test("keeps the box traveling when a part of the row mounts with the selection", async ({
    q,
  }) => {
    const title = "Tab row glider export";
    const box = query(q.article("Tab row with a glider"));
    const list = box.tablist(title);
    const tab = query(list).tab("Billing");
    await test.expect
      .poll(() => getBoxOffset(query(list).tab("Quotes")))
      .toBeLessThan(0.5);
    const recording = await recordTravel(tab);
    await tab.click();
    await test.expect(box.button(`${title} export`)).toBeVisible();
    const frames = await recording.evaluate((record) => record.done);
    const start = frames[0]?.offset ?? 0;
    test.expect(start).toBeGreaterThan(50);
    // The travel takes two seconds. A busy machine can skip frames, so three
    // frames between the tabs are enough.
    const between = frames.filter(
      (frame) => frame.offset > 0.5 && frame.offset < start - 0.5,
    );
    test.expect(between.length).toBeGreaterThanOrEqual(3);
  });

  test("keeps the box traveling while the count of the row loads", async ({
    q,
  }) => {
    const title = "Tab row glider status";
    const box = query(q.article("Tab row with a glider"));
    const list = box.tablist(title);
    const tab = query(list).tab("Billing");
    const count = box.status(`${title} count`);
    await test.expect
      .poll(() => getBoxOffset(query(list).tab("Quotes")))
      .toBeLessThan(0.5);
    const recording = await recordTravel(tab, count);
    await tab.click();
    await test.expect(count).toHaveText("128 items");
    const frames = await recording.evaluate((record) => record.done);
    const start = frames[0]?.offset ?? 0;
    test.expect(start).toBeGreaterThan(50);
    // The count loads a moment after the selection and changes its width.
    test.expect(frames.some((frame) => frame.count === "Loading")).toBe(true);
    // The travel takes two seconds, and the count loads after 300ms, so the box
    // is still between the tabs on many frames after the count loads. A busy
    // machine can skip frames, so three frames are enough.
    const between = frames.filter(
      (frame) =>
        frame.count === "128 items" &&
        frame.offset > 0.5 &&
        frame.offset < start - 0.5,
    );
    test.expect(between.length).toBeGreaterThanOrEqual(3);
  });
});

interface TravelFrame {
  /** The distance of the selected glider box from the tab. */
  offset: number;
  /** The text of the count of the row. */
  count: string;
}

// Records the distance of the selected glider box from a tab, and the text of
// the count of the row when there is one, on each frame until the box reaches
// the tab. The glider is presentation with aria-hidden, so this reads its box
// from the DOM, like getBoxOffset.
async function recordTravel(tab: Locator, count?: Locator) {
  const countElement = count ? await count.elementHandle() : null;
  return tab.evaluateHandle((element, countElement) => {
    const box = element
      .closest(".glider-group")
      ?.querySelector('.glider-box[data-selected="true"]');
    if (!box) {
      throw new Error("Missing glider box");
    }
    const frames: TravelFrame[] = [];
    const done = new Promise<TravelFrame[]>((resolve) => {
      const read = () => {
        const offset = Math.abs(
          box.getBoundingClientRect().left -
            element.getBoundingClientRect().left,
        );
        frames.push({ offset, count: countElement?.textContent ?? "" });
        if (offset < 0.5 && frames.length > 1) {
          resolve(frames);
          return;
        }
        requestAnimationFrame(read);
      };
      read();
    });
    return { done };
  }, countElement);
}

// Returns the widths of the start curves of a selected folder tab and of the
// glider box that paints it. The glider is presentation with aria-hidden, so
// this reads its box from the DOM, like getBoxOffset.
function getFolderCurves(tab: Locator) {
  return tab.evaluate((element) => {
    const box = element
      .closest(".glider-group")
      ?.querySelector('.glider-box[data-selected="true"]');
    if (!box) {
      throw new Error("Missing glider box");
    }
    return [element, box].map((node) =>
      Number.parseFloat(getComputedStyle(node, "::before").width),
    );
  });
}

// Returns the distance of a tab from the start edge of the panel below it.
function getDistanceFromPanel(tab: Locator) {
  return tab.evaluate((node) => {
    const panel = node
      .closest(".tabs")
      ?.querySelector(":scope > :has(> [role=tablist]) + *");
    if (!panel) {
      throw new Error("Missing tab panels");
    }
    return (
      node.getBoundingClientRect().left - panel.getBoundingClientRect().left
    );
  });
}

interface FoldSample {
  /** The radius of the start corner of the panel. */
  corner: number;
}

// Records the panel corner on each frame of the fold of a part of a tab row,
// until the part has no width. The reads are in a resize observer that the test
// adds after the glider's, so each frame reads the corner after the glider
// moves the panel to the new place of the box. A task after the frame could lag
// on a slow machine.
function recordFold(name: Locator) {
  return name.evaluateHandle((element) => {
    // The name has padding, so it stops shrinking before the fold ends. The box
    // around it folds with the column.
    const part = element.parentElement;
    const panel = element
      .closest(".tabs")
      ?.querySelector(":scope > :has(> [role=tablist]) + *");
    if (!part || !panel) {
      throw new Error("Missing tab panels");
    }
    const samples: FoldSample[] = [];
    const done = new Promise<FoldSample[]>((resolve) => {
      const observer = new ResizeObserver(([entry]) => {
        samples.push({
          corner: Number.parseFloat(
            getComputedStyle(panel).borderStartStartRadius,
          ),
        });
        if (entry?.borderBoxSize[0]?.inlineSize !== 0) return;
        observer.disconnect();
        resolve(samples);
      });
      observer.observe(part, { box: "border-box" });
    });
    return { done };
  });
}

// Returns the start and end radii of the top corners of the panel below a tab
// strip, in pixels.
function getPanelCorners(list: Locator) {
  return list.evaluate((node) => {
    const panel = node
      .closest(".tabs")
      ?.querySelector(":scope > :has(> [role=tablist]) + *");
    if (!panel) {
      throw new Error("Missing tab panels");
    }
    const style = getComputedStyle(panel);
    return {
      start: Number.parseFloat(style.borderStartStartRadius),
      end: Number.parseFloat(style.borderStartEndRadius),
    };
  });
}

// Scrolls a tab strip to a distance from its start.
function scrollStripFromStart(list: Locator, distance: number) {
  return list.evaluate((node, left) => {
    node.scrollTo({ left, behavior: "instant" });
  }, distance);
}

// Scrolls a tab strip to a distance from its end.
function scrollStripFromEnd(list: Locator, distance: number) {
  return list.evaluate((node, offset) => {
    const end = node.scrollWidth - node.clientWidth;
    node.scrollTo({ left: end - offset, behavior: "instant" });
  }, distance);
}
