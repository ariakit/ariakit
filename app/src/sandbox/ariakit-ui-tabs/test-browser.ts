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

  test("keeps the frame of the panel around the content that scrolls under a sticky row @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Sticky tab row"],
      async (colorScheme) => {
        const box = q.article("Sticky tab row");
        const area = query(box).group("Sticky tab row scroll area");
        const firstLine = query(area).text("Preview line 1", { exact: true });
        await area.hover();
        await page.mouse.wheel(0, 90);
        // The first line leaves the scroll area, so the scroll took effect.
        await test.expect(firstLine).not.toBeInViewport({ ratio: 1 });
        await visual(
          getCapture(box, colorScheme, {
            item: "ariakit-ui-tabs/sticky-row-scrolled",
          }),
        );
      },
    );
  });

  test("keeps a sticky tab row in view while the area scrolls the panel", async ({
    q,
  }) => {
    const box = query(q.article("Sticky tab row"));
    const area = box.group("Sticky tab row scroll area");
    await scrollAreaTo(area, 90);
    await test
      .expect(box.checkbox("Preview line 1"))
      .not.toBeInViewport({ ratio: 1 });
    await test.expect(box.tab("Preview")).toBeInViewport({ ratio: 1 });
    await test.expect(box.tab("Code")).toBeInViewport({ ratio: 1 });
    await test
      .expect(box.button("Sticky tab row new tab"))
      .toBeInViewport({ ratio: 1 });
    // The frame of the panel is a pseudo-element of the row, so this reads its
    // box from the computed style. The frame keeps the edge and the bottom
    // corners of the panel at the end of the area, with the margin of the tabs
    // below it as beside it.
    const list = box.tablist("Sticky tab row");
    await test.expect
      .poll(async () => {
        const frame = await getStickyFrame(list);
        return frame.bottomSpace - frame.sideSpace;
      })
      .toBe(0);
    const frame = await getStickyFrame(list);
    test.expect(frame.sideSpace).toBeGreaterThan(0);
    test.expect(frame.bottomStartCorner).toBe(12);
    test.expect(frame.bottomEndCorner).toBe(12);
  });

  test("lets the content in the frame of a sticky tab row take a press, but not the content under the margin", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Sticky tab row"));
    const area = box.group("Sticky tab row scroll area");
    const list = box.tablist("Sticky tab row");
    const row = list.locator("..");
    const lastPart = box.button("Sticky tab row new tab");
    const panel = box.tabpanel("Preview");
    // At rest, the panel starts below the top of its edge, which the bottom of
    // the row reaches over.
    const restRow = await getBox(row);
    const restPanel = await getBox(panel.locator(".."));
    const overlap = restRow.y + restRow.height - restPanel.y;
    test.expect(overlap).toBeGreaterThan(2);
    await scrollAreaTo(area, 90);
    await test
      .expect(box.checkbox("Preview line 1"))
      .not.toBeInViewport({ ratio: 1 });
    const areaBox = await getBox(area);
    const rowBox = await getBox(row);
    const partBox = await getBox(lastPart);
    const unselectedTab = await getBox(box.tab("Code"));
    // Past the last part of the row, so no part takes the press.
    const besideParts =
      (partBox.x + partBox.width + rowBox.x + rowBox.width) / 2;
    // The margin of the tabs is around the frame, above the strip color that
    // fills the padding of the tabs above the row.
    const { sideSpace } = await getStickyFrame(list);
    // The content shows in the frame, so it takes a press there. The strip
    // color covers it in the margin, which takes the press instead.
    const presses = [
      // The bottom of the row, which reaches below the top edge of the panel,
      // under an unselected tab. The strip ends at that edge.
      {
        x: unselectedTab.x + unselectedTab.width / 2,
        y: rowBox.y + rowBox.height - overlap / 2,
        reaches: true,
      },
      // The middle of the frame of the panel. The frame is a part of the row,
      // so it takes no pointer either.
      {
        x: areaBox.x + areaBox.width / 2,
        y: areaBox.y + areaBox.height / 2,
        reaches: true,
      },
      // The margin of the tabs above the row.
      { x: besideParts, y: areaBox.y + sideSpace / 2, reaches: false },
      // The margin of the tabs below the frame.
      {
        x: besideParts,
        y: areaBox.y + areaBox.height - sideSpace / 2,
        reaches: false,
      },
    ];
    for (const { x, y, reaches } of presses) {
      const name = await getLineAt(area, y);
      const line = box.checkbox(name);
      const checked = await line.isChecked();
      await page.mouse.click(x, y);
      // A press toggles a checkbox during the click, so a line that keeps its
      // state after the click didn't take the press.
      await test.expect(line).toBeChecked({ checked: reaches !== checked });
    }
  });

  test("keeps the top corners of a sticky frame with those of the panel while the selected box travels", async ({
    q,
  }) => {
    const title = "Sticky tab row with a glider";
    const list = query(q.article(title)).tablist(title);
    const second = query(list).tab("Week");
    await second.click();
    await test.expect.poll(() => getBoxOffset(second)).toBeLessThan(1);
    // The travel is motion, and the frame is a pseudo-element of the row, so
    // this reads both corners in each frame of the travel back to the first
    // tab, until the corner stays the same for a few frames. The corner depends
    // on the box only near the start of the strip, where the box slows down at
    // the end of its one-second travel.
    const corners = await query(list)
      .tab("Day")
      .evaluate(async (tab) => {
        const row = tab.closest("[role=tablist]")?.parentElement;
        const panels = row?.nextElementSibling;
        if (!row || !panels) return [];
        if (!(tab instanceof HTMLElement)) return [];
        const read = () => ({
          frame: Number.parseFloat(
            getComputedStyle(row, "::after").borderStartStartRadius,
          ),
          panel: Number.parseFloat(
            getComputedStyle(panels).borderStartStartRadius,
          ),
        });
        // The first sample is the corner before the press.
        const samples = [read()];
        tab.click();
        let still = 0;
        while (still < 5 && samples.length < 300) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const sample = read();
          const changed = sample.frame !== samples[0]?.frame;
          const same = sample.frame === samples.at(-1)?.frame;
          still = changed && same ? still + 1 : 0;
          samples.push(sample);
        }
        return samples;
      });
    test.expect(corners.length).toBeLessThan(300);
    for (const { frame, panel } of corners) {
      test.expect(Math.abs(frame - panel)).toBeLessThan(0.5);
    }
    const start = corners[0]?.frame ?? 0;
    const end = corners.at(-1)?.frame ?? 0;
    // The corner is round away from the first tab, and small beside it.
    test.expect(start).toBeGreaterThan(end + 1);
    // The corner changes with the box while it travels, not at once.
    const between = corners.filter(
      ({ frame }) => frame < start - 0.5 && frame > end + 0.5,
    );
    test.expect(between.length).toBeGreaterThan(1);
  });

  // The panel squares and opens its top corners with scroll-driven animations
  // while the strip scrolls. Each step polls until the frame of the row has the
  // corners of the panel, and the steps reach different corners.
  for (const name of [
    "Sticky strip with fades",
    "Sticky strip without fades",
  ]) {
    test(`keeps the top corners of the frame of a ${name.toLowerCase()} with those of the panel while the strip scrolls`, async ({
      q,
    }) => {
      const list = query(
        q.article("Sticky tab row with an overflowing strip"),
      ).tablist(name);
      const panelCorners = new Set<string>();
      for (const distance of [0, 10, 40, 120]) {
        await scrollStripFromStart(list, distance);
        await test.expect
          .poll(async () => {
            const { frame, panel } = await getStickyCorners(list);
            return frame.join() === panel.join();
          })
          .toBe(true);
        panelCorners.add((await getStickyCorners(list)).panel.join());
      }
      for (const distance of [40, 10, 0]) {
        await scrollStripFromEnd(list, distance);
        await test.expect
          .poll(async () => {
            const { frame, panel } = await getStickyCorners(list);
            return frame.join() === panel.join();
          })
          .toBe(true);
        panelCorners.add((await getStickyCorners(list)).panel.join());
      }
      test.expect(panelCorners.size).toBeGreaterThan(1);
    });
  }

  test("scrolls the strip of a sticky row with a sideways wheel between two tabs", async ({
    page,
    q,
  }) => {
    const name = "Sticky strip with fades";
    const area = q.group(`${name} scroll area`);
    const list = query(area).tablist(name);
    await area.scrollIntoViewIfNeeded();
    const [first, second] = await Promise.all([
      getBox(query(list).tab("Getting started")),
      getBox(query(list).tab("Usage")),
    ]);
    const gap = second.x - (first.x + first.width);
    test.expect(gap).toBeGreaterThan(2);
    await page.mouse.move(
      first.x + first.width + gap / 2,
      first.y + first.height / 2,
    );
    await page.mouse.wheel(120, 0);
    await test.expect
      .poll(() => list.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(0);
  });

  test("scrolls the strip of a row without a panel with a sideways wheel below the tabs", async ({
    page,
    q,
  }) => {
    // A narrow window makes the box narrow, so the strip has tabs to scroll.
    await page.setViewportSize({ width: 420, height: 800 });
    const name = "Tab row without a panel";
    const list = query(q.article("Tab row")).tablist(name);
    await list.scrollIntoViewIfNeeded();
    await test.expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth))
      .toBeGreaterThan(0);
    // Without a panel, the strip color below the tabs belongs to the strip.
    const [tab, row] = await Promise.all([
      getBox(query(list).tab("Billing")),
      getBox(list.locator("..")),
    ]);
    const below = tab.y + tab.height;
    test.expect(row.y + row.height - below).toBeGreaterThan(4);
    await page.mouse.move(
      tab.x + tab.width / 2,
      (below + row.y + row.height) / 2,
    );
    await page.mouse.wheel(120, 0);
    await test.expect
      .poll(() => list.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(0);
  });

  test("moves the parts of a tab row without tabs onto the root edge like those of a row with tabs", async ({
    q,
  }) => {
    const box = query(q.article("Tab row frame"));
    // A part of a row moves onto a root edge wider than the space above the
    // row, so it starts above the top of the row by the same amount.
    const getOffset = async (name: string) => {
      const button = box.button(`${name} sidebar`);
      const [buttonBox, rowBox] = await Promise.all([
        getBox(button),
        getBox(button.locator("..")),
      ]);
      return buttonBox.y - rowBox.y;
    };
    test
      .expect(await getOffset("Logo"))
      .toBeCloseTo(await getOffset("Notes"), 1);
    test.expect(await getOffset("Notes")).toBeLessThan(0);
  });

  test("lines up a tab row frame with the buttons and the tabs of the row", async ({
    q,
  }) => {
    const box = query(q.article("Tab row frame"));
    for (const name of ["Notes", "Compact notes"]) {
      const frame = getRowFrame(box.text(name, { exact: true }));
      const button = box.button(`${name} sidebar`);
      const tab = query(box.tablist(name)).tab("Quotes");
      const [frameBox, buttonBox, tabBox] = await Promise.all([
        getBox(frame),
        getBox(button),
        getBox(tab),
      ]);
      // The frame has the box of the button and the tabs.
      test.expect(frameBox.y).toBeCloseTo(buttonBox.y, 0);
      test.expect(frameBox.height).toBeCloseTo(buttonBox.height, 0);
      test.expect(frameBox.height).toBeCloseTo(tabBox.height, 0);
      // The icons have the same size and place in their boxes.
      const frameIcon = await getBox(frame.locator("svg"));
      const buttonIcon = await getBox(button.locator("svg"));
      test.expect(frameIcon.width).toBeCloseTo(buttonIcon.width, 0);
      test.expect(frameIcon.y).toBeCloseTo(buttonIcon.y, 0);
      test
        .expect(frameIcon.x - frameBox.x)
        .toBeCloseTo(buttonIcon.x - buttonBox.x, 0);
      // The name is in line with the labels of the tabs.
      const nameBox = await getBox(box.text(name, { exact: true }));
      const labelBox = await getBox(query(tab).text("Quotes", { exact: true }));
      test
        .expect(nameBox.y + nameBox.height / 2)
        .toBeCloseTo(labelBox.y + labelBox.height / 2, 0);
    }
  });

  test("shows what is under the strip of a transparent root @visual", async ({
    page,
    q,
    visual,
  }) => {
    const title = "Transparent tabs over a pattern";
    await forEachColorSchemeOf(page, [title], (colorScheme) =>
      visual(
        getCapture(q.article(title), colorScheme, {
          item: "ariakit-ui-tabs/transparent-pattern",
        }),
      ),
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
});

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

// Brings an area into view and scrolls it at once. A wheel scroll can animate
// on Linux.
async function scrollAreaTo(area: Locator, top: number) {
  await area.scrollIntoViewIfNeeded();
  await area.evaluate((node, value) => {
    node.scrollTo({ top: value, behavior: "instant" });
  }, top);
}

// Returns the top corners of the frame of a sticky row and of the panel below
// it, in pixels. The frame is a pseudo-element of the row that holds the tab
// list.
function getStickyCorners(list: Locator) {
  return list.evaluate((node) => {
    const row = node.parentElement;
    const panel = row?.nextElementSibling;
    if (!row || !panel) {
      throw new Error("Missing tab row or panel");
    }
    const frameStyle = getComputedStyle(row, "::after");
    const panelStyle = getComputedStyle(panel);
    return {
      frame: [
        Number.parseFloat(frameStyle.borderStartStartRadius),
        Number.parseFloat(frameStyle.borderStartEndRadius),
      ],
      panel: [
        Number.parseFloat(panelStyle.borderStartStartRadius),
        Number.parseFloat(panelStyle.borderStartEndRadius),
      ],
    };
  });
}

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("The element has no box");
  }
  return box;
}

// Returns the spaces between the frame of a sticky row and the end and the
// start side of its scroll area, and the bottom corners of the frame, in
// pixels. The frame is a pseudo-element of the row that holds the tab list.
function getStickyFrame(list: Locator) {
  return list.evaluate((node) => {
    const row = node.parentElement;
    const area = row?.closest("[role=group]");
    if (!row || !area) {
      throw new Error("Missing tab row or scroll area");
    }
    const style = getComputedStyle(row, "::after");
    const frameBottom =
      row.getBoundingClientRect().top +
      Number.parseFloat(style.top) +
      Number.parseFloat(style.height);
    const frameLeft =
      row.getBoundingClientRect().left + Number.parseFloat(style.left);
    return {
      bottomSpace: Math.round(
        area.getBoundingClientRect().bottom - frameBottom,
      ),
      sideSpace: Math.round(frameLeft - area.getBoundingClientRect().left),
      bottomStartCorner: Number.parseFloat(style.borderEndStartRadius),
      bottomEndCorner: Number.parseFloat(style.borderEndEndRadius),
    };
  });
}

// Returns the name of the line of a scroll area at a height on the page. The
// lines reach across the panel, so the height alone finds the line.
async function getLineAt(area: Locator, y: number) {
  const name = await area.evaluate((node, top) => {
    for (const line of node.querySelectorAll("label")) {
      const rect = line.getBoundingClientRect();
      if (rect.top <= top && top < rect.bottom) return line.textContent;
    }
    return null;
  }, y);
  if (!name) {
    throw new Error(`No line at ${y}px`);
  }
  return name;
}

// The frame of a tab row is the parent of its name.
function getRowFrame(name: Locator) {
  return name.locator("..");
}
