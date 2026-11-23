import type { Locator } from "@playwright/test";
import { getBoxOffset } from "#app/sandbox/ariakit-ui-glider/test-helpers.ts";
import { withFramework } from "#app/test-utils/preview.ts";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("The element has no box");
  }
  return box;
}

// The surface around the panels is the parent of each tab panel.
function getPanelSurface(panel: Locator) {
  return panel.locator("..");
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the tabs and the toggle button at the top while the page scrolls the note", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const tab = q.tab("Trip");
    const toggle = q.button("Toggle sidebar");
    const tabBox = await getBox(tab);
    const toggleBox = await getBox(toggle);
    // The tabs start with the same space above them as beside the panel. The
    // edge of the panel can be a ring outside the box of the tabs, so the two
    // spaces can differ by that edge.
    const surface = getPanelSurface(q.tabpanel("Trip"));
    const spaceBeside = await getSpaceBeside(surface);
    test.expect(Math.abs(tabBox.y - spaceBeside)).toBeLessThanOrEqual(1);
    await q.text(/dining car/).scrollIntoViewIfNeeded();
    await test.expect(q.text(/night train/)).not.toBeInViewport();
    test.expect((await getBox(tab)).y).toBeCloseTo(tabBox.y, 0);
    test.expect((await getBox(toggle)).y).toBeCloseTo(toggleBox.y, 0);
  });

  test("keeps the same space below the panel as beside it at the end of the page", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const surface = getPanelSurface(q.tabpanel("Trip"));
    await page.mouse.move(450, 250);
    // The wheel moves the page to its end, past the last paragraph.
    await page.mouse.wheel(0, 2000);
    await test.expect
      .poll(async () => {
        const box = await getBox(surface);
        return 500 - (box.y + box.height);
      })
      .toBeCloseTo(await getSpaceBeside(surface), 0);
  });

  test("fills the page with a short note", async ({ page, q }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await q.tab("Groceries").click();
    const surface = getPanelSurface(q.tabpanel("Groceries"));
    await test.expect(q.tabpanel("Groceries")).toBeVisible();
    const box = await getBox(surface);
    const space = await getSpaceBeside(surface);
    test.expect(500 - (box.y + box.height)).toBeCloseTo(space, 0);
    // The page has nothing to scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    test.expect(overflow).toBe(0);
  });

  test("keeps the toggle button and the logo in place and moves the first tab to the edge of the panel when the sidebar opens", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const toggle = q.button("Toggle sidebar");
    const logo = getLogo(getLogoName(q.text("Notes", { exact: true })));
    const tab = q.tab("Trip");
    const surface = getPanelSurface(q.tabpanel("Trip"));
    const closedToggle = await getBox(toggle);
    const closedLogo = await getBox(logo);
    const closedTab = await getBox(tab);
    // While the sidebar is closed, the logo starts where the button ends, and
    // the first tab starts where the logo ends.
    test
      .expect(closedLogo.x)
      .toBeCloseTo(closedToggle.x + closedToggle.width, 0);
    test.expect(closedTab.x).toBeCloseTo(closedLogo.x + closedLogo.width, 0);
    // The button has the box of a button of the tab row.
    const rowButton = await getBox(q.button("New note"));
    test.expect(closedToggle.y).toBeCloseTo(rowButton.y, 0);
    test.expect(closedToggle.width).toBeCloseTo(rowButton.width, 0);
    test.expect(closedToggle.height).toBeCloseTo(rowButton.height, 0);
    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.navigation("Notebooks")).toBeVisible();
    // The tabs follow the sidebar, so the positions settle with its fold.
    await test.expect
      .poll(() => getFirstTabInset(tab, surface))
      .toBeLessThan(0.5);
    const openToggle = await getBox(toggle);
    test.expect(openToggle.x).toBeCloseTo(closedToggle.x, 0);
    test.expect(openToggle.y).toBeCloseTo(closedToggle.y, 0);
    const openLogo = await getBox(logo);
    test.expect(openLogo.x).toBeCloseTo(closedLogo.x, 0);
    test.expect(openLogo.y).toBeCloseTo(closedLogo.y, 0);
    test.expect((await getBox(tab)).x).toBeGreaterThan(closedTab.x);
  });

  test("keeps the note on the center of the window when the sidebar opens", async ({
    page,
    q,
  }) => {
    // The window is wide enough for the panel to keep the note on the center of
    // the window beside the open sidebar.
    await page.setViewportSize({ width: 1280, height: 500 });
    const paragraph = q.text(/night train/);
    const getCenter = async () => {
      const box = await getBox(paragraph);
      return box.x + box.width / 2;
    };
    test.expect(await getCenter()).toBeCloseTo(640, 0);
    await q.button("Toggle sidebar").click();
    await test.expect(q.navigation("Notebooks")).toBeVisible();
    const tab = q.tab("Trip");
    const surface = getPanelSurface(q.tabpanel("Trip"));
    // The first tab reaches the edge of the panel when the fold ends.
    await test.expect
      .poll(() => getFirstTabInset(tab, surface))
      .toBeLessThan(0.5);
    test.expect(await getCenter()).toBeCloseTo(640, 0);
  });

  test("keeps the folder of the glider on the first tab when the sidebar opens and closes", async ({
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    const tab = q.tab("Trip");
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(1);
    await toggle.click();
    await test.expect(q.navigation("Notebooks")).toBeVisible();
    // The indent of the tabs follows the sidebar, and the folder follows the
    // first tab to the edge of the panel.
    const surface = getPanelSurface(q.tabpanel("Trip"));
    await test.expect
      .poll(() => getFirstTabInset(tab, surface))
      .toBeLessThan(0.5);
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(1);
    await toggle.click();
    await test.expect(q.navigation("Notebooks")).toBeHidden();
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(1);
  });

  test("keeps the folder of the glider on a note while the pointer drags it", async ({
    page,
    q,
  }) => {
    const tab = q.tab("Trip");
    const next = q.tab("Workshop");
    const from = await getBox(tab);
    const to = await getBox(next);
    const y = from.y + from.height / 2;
    await page.mouse.move(from.x + from.width / 2, y);
    await page.mouse.down();
    // The folder goes with the note on each frame of the drag. A folder that
    // traveled to the note would be behind it while the pointer moves, and
    // would reach it only after the pointer rests, so no state after the move
    // shows the difference. This reads the largest distance between the two on
    // the frames of the move.
    const farthest = tab.evaluate((element) => {
      return new Promise<number>((resolve) => {
        const group = element.closest(".glider-group");
        const box = group?.querySelector('.glider-box[data-selected="true"]');
        let distance = box ? 0 : Number.POSITIVE_INFINITY;
        let frames = 0;
        const step = () => {
          if (box) {
            const { left } = element.getBoundingClientRect();
            const gap = Math.abs(left - box.getBoundingClientRect().left);
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
    await page.mouse.move(to.x + to.width / 2, y, { steps: 20 });
    test.expect(await farthest).toBeLessThan(2);
    // The folder of the glider is behind all the notes, so the dragged note
    // paints its own surface, which covers the notes that it passes. At rest,
    // only the folder paints it.
    const getBackground = () =>
      tab.evaluate((element) => getComputedStyle(element).backgroundColor);
    test.expect(await getBackground()).not.toBe("rgba(0, 0, 0, 0)");
    await test.expect
      .poll(async () => (await getBox(next)).x)
      .toBeLessThan(from.x + 1);
    await page.mouse.up();
    await test.expect
      .poll(() => q.tab().allTextContents())
      .toEqual(["Workshop", "Trip", "Groceries"]);
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(1);
    await test.expect.poll(getBackground).toBe("rgba(0, 0, 0, 0)");
  });

  test("keeps the corner of the sticky frame with the corner of the panel while the folder travels", async ({
    q,
  }) => {
    await q.button("Toggle sidebar").click();
    const tab = q.tab("Trip");
    const surface = getPanelSurface(q.tabpanel("Trip"));
    // With the sidebar open, the first tab is at the edge of the panel, so the
    // panel and the frame start with a square corner.
    await test.expect
      .poll(() => getFirstTabInset(tab, surface))
      .toBeLessThan(0.5);
    await test.expect.poll(() => getBoxOffset(tab)).toBeLessThan(1);
    // The frame is a pseudo-element of the tab row, and the travel is motion,
    // so this reads both corners on each frame. The travel takes 200ms (the
    // default glider duration), and 30 frames cover it at 60Hz and at 120Hz.
    const corners = await q.tab("Workshop").evaluate(async (workshop) => {
      const row = workshop.closest(".tab-row");
      const panels = row?.nextElementSibling;
      if (!row || !panels) return [];
      if (!(workshop instanceof HTMLElement)) return [];
      const samples: Array<[number, number]> = [];
      workshop.click();
      for (let frame = 0; frame < 30; frame++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const frameStyle = getComputedStyle(row, "::after");
        const panelsStyle = getComputedStyle(panels);
        samples.push([
          Number.parseFloat(frameStyle.borderStartStartRadius),
          Number.parseFloat(panelsStyle.borderStartStartRadius),
        ]);
      }
      return samples;
    });
    const differences = corners.map(([frame, panel]) =>
      Math.abs(frame - panel),
    );
    test.expect(corners.length).toBe(30);
    test.expect(Math.max(...differences)).toBeLessThan(0.5);
    // Both corners are round when the folder is away from the edge.
    test.expect(corners.at(-1)?.[0]).toBeGreaterThan(1);
  });

  test("keeps the same space on each side of the sidebar links", async ({
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    await toggle.click();
    const link = q.link("All notes");
    await test.expect(link).toBeVisible();
    const tab = q.tab("Trip");
    const surface = getPanelSurface(q.tabpanel("Trip"));
    // The tabs follow the sidebar, so the positions settle with its fold.
    await test.expect
      .poll(() => getFirstTabInset(tab, surface))
      .toBeLessThan(0.5);
    const linkBox = await getBox(link);
    const surfaceBox = await getBox(surface);
    const spaceAfter = surfaceBox.x - (linkBox.x + linkBox.width);
    test.expect(spaceAfter).toBeCloseTo(linkBox.x, 0);
    // The icon of the link is below the icon of the toggle button.
    const toggleIcon = await getBox(toggle.locator("svg"));
    const linkIcon = await getBox(link.locator("svg"));
    test.expect(linkIcon.x).toBeCloseTo(toggleIcon.x, 0);
  });

  test("lines up the logo with the toggle button and the tabs", async ({
    q,
  }) => {
    const name = getLogoName(q.text("Notes", { exact: true }));
    const toggle = q.button("Toggle sidebar");
    const getMiddle = async (locator: Locator) => {
      const box = await getBox(locator);
      return box.y + box.height / 2;
    };
    // The name is in line with the labels of the tabs.
    const tabLabel = query(q.tab("Trip")).text("Trip", { exact: true });
    test
      .expect(await getMiddle(name))
      .toBeCloseTo(await getMiddle(tabLabel), 0);
    // The mark of the logo has the size of the icon of the button, and it is in
    // line with it.
    const mark = await getBox(getLogo(name).locator("svg"));
    const icon = await getBox(toggle.locator("svg"));
    test.expect(mark.width).toBeCloseTo(icon.width, 0);
    test.expect(mark.y).toBeCloseTo(icon.y, 0);
  });

  test("keeps the separator before the logo while the pointer is on the logo", async ({
    q,
  }) => {
    const logo = getLogo(getLogoName(q.text("Notes", { exact: true })));
    // The separator is hidden from screen readers, so it has no role or name.
    const separator = logo.locator("xpath=preceding-sibling::*[1]");
    await test.expect(separator).toHaveCSS("opacity", "1");
    // The toggle button has a hover surface, so the separator gives way to it.
    await q.button("Toggle sidebar").hover();
    await test.expect(separator).toHaveCSS("opacity", "0");
    // The logo is static, so the separator shows beside it again. Each step
    // waits for a change, so the fade of the separator can't hide a failure.
    await logo.hover();
    await test.expect(separator).toHaveCSS("opacity", "1");
  });

  test("keeps the selected note whole in view while the sidebar opens", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 7; count++) {
      await newNote.click();
    }
    const tab = q.tab("Note 7");
    await test.expect(tab).toBeInViewport({ ratio: 1 });
    // The sidebar makes the strip narrower, and the strip scrolls with it.
    await q.button("Toggle sidebar").click();
    const link = q.link("All notes");
    await test.expect(link).toBeVisible();
    // The tab shows whole at the start of the fold too, so this waits for the
    // end of the fold: the panel is then as far from the links as the links are
    // from the side of the window.
    const surface = getPanelSurface(q.tabpanel("Note 7"));
    await test.expect
      .poll(async () => {
        const [linkBox, surfaceBox] = await Promise.all([
          getBox(link),
          getBox(surface),
        ]);
        return surfaceBox.x - (linkBox.x + linkBox.width) - linkBox.x;
      })
      .toBeCloseTo(0, 0);
    await test.expect(tab).toBeInViewport({ ratio: 1 });
  });

  test("keeps the tabs that scroll and the scroll button after the logo", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 7; count++) {
      await newNote.click();
    }
    const tab = q.tab("Note 7");
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    // A new note comes into view at the end of the full row. The strip clips
    // the tabs that are out of its view.
    await test.expect(tab).toBeInViewport({ ratio: 1 });
    // The strip scrolled to its end, so the button that scrolls back shows at
    // the start of the strip, after the logo.
    const previous = q.button("Previous tabs");
    await test.expect(previous).toBeVisible();
    const logo = await getBox(
      getLogo(getLogoName(q.text("Notes", { exact: true }))),
    );
    const previousBox = await getBox(previous);
    test.expect(previousBox.x).toBeGreaterThanOrEqual(logo.x + logo.width);
    // The first tab scrolled out of view, not under the logo.
    await test.expect(q.tab("Trip")).not.toBeInViewport();
  });

  test("keeps the sidebar links in place while the sidebar opens", async ({
    q,
  }) => {
    const toggle = q.button("Toggle sidebar");
    await toggle.click();
    const link = q.link("All notes");
    await test.expect(link).toBeVisible();
    // The link is in the page from the first frame of the fold, so its place on
    // each frame shows whether it moves. The samples end when the first tab
    // stops, which is when the fold ends.
    const places = await link.evaluate(async (element) => {
      const tab = document.querySelector("[role='tab']");
      const samples: number[] = [];
      let lastTabPlace = Number.NaN;
      let still = 0;
      while (still < 5 && samples.length < 300) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        samples.push(element.getBoundingClientRect().x);
        const tabPlace = tab?.getBoundingClientRect().x ?? 0;
        still = tabPlace === lastTabPlace ? still + 1 : 0;
        lastTabPlace = tabPlace;
      }
      return samples;
    });
    // The panel grows from 95% of its size, from its top corner at the side of
    // the window, so the link moves by less than a pixel. A panel that moves
    // with main would move by its whole width.
    test.expect(Math.max(...places) - Math.min(...places)).toBeLessThan(1.5);
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("scrolls a link that gets the focus out from under the sticky row", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const link = q.link("booking");
    const tabBox = await getBox(q.tab("Trip"));
    const rowEnd = tabBox.y + tabBox.height;
    // The wheel moves the link under the row, where it is still in the window.
    // A browser doesn't scroll an element that is in the window when it gets
    // the focus, unless the scroll padding of the page covers it.
    const start = (await getBox(link)).y;
    await page.mouse.move(450, 250);
    await page.mouse.wheel(0, start - tabBox.y);
    await test.expect
      .poll(async () => (await getBox(link)).y)
      .toBeLessThan(rowEnd - 10);
    await test.expect(link).toBeInViewport();
    // Safari skips links on the Tab key by default, so the link gets the focus
    // from a script. The browser scrolls it into view in the same way.
    await link.focus();
    await test.expect(link).toBeFocused();
    // The link shows in the frame below the tabs, not under the row.
    await test.expect
      .poll(async () => (await getBox(link)).y)
      .toBeGreaterThan(rowEnd);
  });
});

/** The distance between the first tab and the start edge of the panel. */
async function getFirstTabInset(tab: Locator, surface: Locator) {
  const [tabBox, surfaceBox] = await Promise.all([
    getBox(tab),
    getBox(surface),
  ]);
  return Math.abs(tabBox.x - surfaceBox.x);
}

/** The space between the panel and the side of the page. */
async function getSpaceBeside(surface: Locator) {
  const box = await getBox(surface);
  const viewport = surface.page().viewportSize();
  if (!viewport) {
    throw new Error("The page has no viewport size");
  }
  return viewport.width - (box.x + box.width);
}

/**
 * The name of the logo that shows. An invisible copy of the logo holds its room
 * before the tabs, hidden from screen readers.
 */
function getLogoName(text: Locator) {
  return text.filter({ visible: true });
}

/** The frame of the logo, around its mark and its name. */
function getLogo(name: Locator) {
  return name.locator("xpath=..");
}
