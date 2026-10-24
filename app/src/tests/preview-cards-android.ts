import { query } from "@ariakit/test/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

interface Point {
  x: number;
  y: number;
}

async function getCenter(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no bounding box.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

// Playwright can tap, but it cannot swipe or keep two fingers down, so the
// tests send touches through the Chrome DevTools Protocol. Chrome then scrolls
// as it would for a person.
async function openTouchscreen(page: Page) {
  const session = await page.context().newCDPSession(page);
  return {
    send: async (
      type: "touchStart" | "touchMove" | "touchEnd",
      touchPoints: Point[],
      timestamp?: number,
    ) => {
      await session.send("Input.dispatchTouchEvent", {
        type,
        touchPoints,
        timestamp,
      });
    },
    [Symbol.asyncDispose]: () => session.detach(),
  };
}

interface SwipeParams {
  page: Page;
  from: Point;
  /**
   * How far the finger moves up, or down when it is negative.
   */
  distance: number;
  /**
   * Lifts the finger while it moves fast, so the page keeps scrolling.
   */
  fling?: boolean;
}

// Unless the swipe flings, the finger rests before it lifts, as the event
// timestamps tell Chrome, so the scroll stops with it. Chrome would take the
// next tap during a fling as a tap that stops the fling.
async function swipe({ page, from, distance, fling = false }: SwipeParams) {
  const { x, y } = from;
  await using touchscreen = await openTouchscreen(page);
  const steps = 10;
  const stepTime = fling ? 0.008 : 0.016;
  const start = Date.now() / 1000;
  const moveEnd = start + steps * stepTime;
  const end = fling ? moveEnd : moveEnd + 0.3;
  await touchscreen.send("touchStart", [{ x, y }], start);
  for (let step = 1; step <= steps; step++) {
    const point = { x, y: y - (distance * step) / steps };
    await touchscreen.send("touchMove", [point], start + step * stepTime);
  }
  if (!fling) {
    await touchscreen.send("touchMove", [{ x, y: y - distance }], end);
  }
  await touchscreen.send("touchEnd", [], end);
}

interface TwoFingerTouchParams {
  page: Page;
  first: Point;
  second: Point;
  whileDown: () => Promise<void>;
}

// Puts a finger on each point, runs the callback while both are down, and lifts
// the first finger before the second one. The second finger keeps the first one
// from being a tap.
async function touchWithTwoFingers({
  page,
  first,
  second,
  whileDown,
}: TwoFingerTouchParams) {
  await using touchscreen = await openTouchscreen(page);
  await touchscreen.send("touchStart", [first]);
  await touchscreen.send("touchStart", [first, second]);
  await whileDown();
  // A point missing from the active points lifts.
  await touchscreen.send("touchMove", [second]);
  await touchscreen.send("touchEnd", []);
}

// A position in the padding of the example, away from its controls.
const paddingPosition = { x: 8, y: 120 };

async function getPaddingPoint(viewport: Locator): Promise<Point> {
  const box = await viewport.boundingBox();
  if (!box) throw new Error("The example has no bounding box.");
  return { x: box.x + paddingPosition.x, y: box.y + paddingPosition.y };
}

async function getComboboxFrame(page: Page) {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  await iframe.scrollIntoViewIfNeeded();
  // The frame scrolls to the popup that it opens before the card shows it.
  await expect(iframe.locator("xpath=..")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const frame = iframe.contentFrame();
  const listbox = query(frame).listbox();
  await expect(listbox).toBeVisible();
  // The popup has more options than it fits, so a touch over it could scroll
  // it. Its contained overscroll would also keep the touch from the page.
  await expect
    .poll(() =>
      listbox.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    )
    .toBe(true);
  return { frame, listbox };
}

async function getSlotsViewport(page: Page, card: Locator) {
  await gotoAndSettle(page, "/react/recipes/text-field/");
  await card.scrollIntoViewIfNeeded();
  // The card hydrates when it scrolls into view, and then measures the width
  // that the handle can resize to. The handle names the viewport it resizes.
  const handle = query(card).separator("Resize preview", {
    includeHidden: true,
  });
  await handle.and(page.locator("[data-enabled]")).waitFor({
    state: "attached",
  });
  const viewportId = await handle.getAttribute("aria-controls");
  const viewport = page.locator(`[id="${viewportId}"]`);
  // The example is taller than the card on a phone, so it scrolls in it.
  await expect
    .poll(() =>
      viewport.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    )
    .toBe(true);
  return viewport;
}

function getPageScroll(page: Page) {
  return page.evaluate(() => window.scrollY);
}

function getScrollTop(locator: Locator) {
  return locator.evaluate((element) => element.scrollTop);
}

test("preview card frames pass touch scrolling to the page until activated", async ({
  page,
  q,
}) => {
  const { frame, listbox } = await getComboboxFrame(page);
  const pageScroll = await getPageScroll(page);
  await swipe({ page, from: await getCenter(listbox), distance: 100 });
  await expect.poll(() => getPageScroll(page)).toBeGreaterThan(pageScroll);
  expect(await getScrollTop(listbox)).toBe(0);

  // The swipe is not an interaction, so the frame still ignores focus calls,
  // such as from a component that moves focus on hover.
  const combobox = query(frame).combobox("Find records");
  await combobox.evaluate((element) => element.focus());
  await expect(combobox).not.toBeFocused();

  // A tap on the combobox moves focus into the frame, so the next touch scrolls
  // the popup.
  await combobox.tap();
  await expect(combobox).toBeFocused();
  await expect(listbox).toBeVisible();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-active",
    "",
  );
  await swipe({ page, from: await getCenter(listbox), distance: 100 });
  await expect.poll(() => getScrollTop(listbox)).toBeGreaterThan(0);

  // A swipe on the docs page makes the frame inactive again, even though focus
  // stays in it, so only a tap activates it again. The popup scrolled down, so
  // the next swipes move the finger down.
  const cardTitle = query(q.region("Combobox Group", { exact: true })).heading(
    "Combobox Group",
  );
  await cardTitle.scrollIntoViewIfNeeded();
  const cardScroll = await getPageScroll(page);
  await swipe({ page, from: await getCenter(cardTitle), distance: 100 });
  await expect.poll(() => getPageScroll(page)).toBeGreaterThan(cardScroll);
  await expect(combobox).toBeFocused();
  await expect(frame.locator("html")).not.toHaveAttribute(
    "data-preview-active",
    "",
  );
  // The frame still ignores focus calls, so an example that moves focus on its
  // own does not make it active again.
  const option = query(frame).option(/Emma Johnson/);
  await option.evaluate((element) => element.focus());
  await expect(frame.locator("html")).not.toHaveAttribute(
    "data-preview-active",
    "",
  );
  const inactiveScroll = await getPageScroll(page);
  const listboxScroll = await getScrollTop(listbox);
  await swipe({ page, from: await getCenter(listbox), distance: -100 });
  await expect.poll(() => getPageScroll(page)).toBeLessThan(inactiveScroll);
  expect(await getScrollTop(listbox)).toBe(listboxScroll);

  await combobox.tap();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-active",
    "",
  );
  await expect(listbox).toBeVisible();
  const activeScroll = await getScrollTop(listbox);
  await swipe({ page, from: await getCenter(listbox), distance: -100 });
  await expect.poll(() => getScrollTop(listbox)).toBeLessThan(activeScroll);
});

test("preview card frames take arrow keys after a touch on the docs page", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/app-shell/");
  const iframe = page.locator('iframe[title="Dashboard"]');
  await iframe.scrollIntoViewIfNeeded();
  // The card shows the frame once it has hydrated and the frame has loaded.
  await expect(iframe.locator("xpath=..")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const frame = iframe.contentFrame();
  const root = frame.locator("html");
  await expect(root).toHaveAttribute("data-preview-hydrated", "");
  const today = query(frame).radio("Today");
  await today.tap();
  await expect(today).toBeFocused();
  await expect(root).toHaveAttribute("data-preview-active", "");

  const cardTitle = query(q.region("Dashboard", { exact: true })).heading(
    "Dashboard",
  );
  await cardTitle.scrollIntoViewIfNeeded();
  const pageScroll = await getPageScroll(page);
  await swipe({ page, from: await getCenter(cardTitle), distance: 40 });
  await expect.poll(() => getPageScroll(page)).toBeGreaterThan(pageScroll);
  await expect(root).not.toHaveAttribute("data-preview-active", "");

  // The radio group moves focus with the arrow keys, and the key brings the
  // person back to the frame.
  await page.keyboard.press("ArrowRight");
  await expect(query(frame).radio("7D")).toBeFocused();
  await expect(root).toHaveAttribute("data-preview-active", "");
});

test("preview card frames stop scrolling only while a touch is in them", async ({
  page,
  q,
}) => {
  const { frame, listbox } = await getComboboxFrame(page);
  const cardTitle = query(q.region("Combobox Group", { exact: true })).heading(
    "Combobox Group",
  );
  // A finger on the docs page that lifts last does not keep the popup still.
  await touchWithTwoFingers({
    page,
    first: await getCenter(query(frame).text("Members")),
    second: await getCenter(cardTitle),
    whileDown: async () => {
      await expect(listbox).toHaveCSS("overflow-y", "hidden");
    },
  });
  await expect(listbox).toHaveCSS("overflow-y", "auto");
});

test("inline previews pass touch scrolling to the page until tapped", async ({
  page,
  q,
}) => {
  const card = q.region("Slots", { exact: true });
  const viewport = await getSlotsViewport(page, card);
  const pageScroll = await getPageScroll(page);
  await swipe({ page, from: await getCenter(viewport), distance: 100 });
  await expect.poll(() => getPageScroll(page)).toBeGreaterThan(pageScroll);
  expect(await getScrollTop(viewport)).toBe(0);

  // A tap in the example activates it, so the next touch scrolls it.
  await viewport.tap({ position: paddingPosition });
  await expect(viewport).toBeFocused();
  await swipe({ page, from: await getCenter(viewport), distance: 100 });
  await expect.poll(() => getScrollTop(viewport)).toBeGreaterThan(0);

  // A swipe on the card outside the example makes it inactive again. Focus
  // stays in the example, so only the click of a tap activates it again. The
  // example scrolled to its end, so the next swipes move the finger down.
  const email = query(viewport).textbox("Email");
  await email.tap();
  await expect(email).toBeFocused();
  const cardTitle = query(card).heading("Slots");
  await cardTitle.scrollIntoViewIfNeeded();
  const cardScroll = await getPageScroll(page);
  await swipe({ page, from: await getCenter(cardTitle), distance: 100 });
  await expect.poll(() => getPageScroll(page)).toBeGreaterThan(cardScroll);
  await expect(email).toBeFocused();
  const inactiveScroll = await getPageScroll(page);
  const viewportScroll = await getScrollTop(viewport);
  expect(viewportScroll).toBeGreaterThan(0);
  await swipe({ page, from: await getCenter(viewport), distance: -100 });
  await expect.poll(() => getPageScroll(page)).toBeLessThan(inactiveScroll);
  expect(await getScrollTop(viewport)).toBe(viewportScroll);

  await email.tap();
  const activeScroll = await getScrollTop(viewport);
  expect(activeScroll).toBeGreaterThan(0);
  await swipe({ page, from: await getCenter(viewport), distance: -100 });
  await expect.poll(() => getScrollTop(viewport)).toBeLessThan(activeScroll);
});

test("inline previews stay inactive after a tap that stops the page", async ({
  page,
  q,
}) => {
  const card = q.region("Slots", { exact: true });
  const viewport = await getSlotsViewport(page, card);
  const header = await q.banner().boundingBox();
  const pageSize = page.viewportSize();
  if (!header || !pageSize) throw new Error("The page has no header.");
  await swipe({
    page,
    from: await getCenter(viewport),
    distance: 300,
    fling: true,
  });
  // The tap lands on the part of the example that is on the screen while the
  // page still scrolls.
  const box = await viewport.boundingBox();
  if (!box) throw new Error("The example has no bounding box.");
  const top = Math.max(box.y, header.y + header.height);
  const bottom = Math.min(box.y + box.height, pageSize.height);
  const middle = (top + bottom) / 2;
  await page.touchscreen.tap(box.x + paddingPosition.x, middle);

  const pageScroll = await getPageScroll(page);
  await swipe({
    page,
    from: { x: box.x + box.width / 2, y: middle },
    distance: 50,
  });
  await expect.poll(() => getPageScroll(page)).toBeGreaterThan(pageScroll);
  expect(await getScrollTop(viewport)).toBe(0);
});

test("inline previews stop scrolling only while a touch is in them", async ({
  page,
  q,
}) => {
  const card = q.region("Slots", { exact: true });
  const viewport = await getSlotsViewport(page, card);
  // A finger outside the example that lifts last does not keep it still.
  await touchWithTwoFingers({
    page,
    first: await getPaddingPoint(viewport),
    second: await getCenter(query(card).heading("Slots")),
    whileDown: async () => {
      await expect(viewport).toHaveCSS("overflow-y", "hidden");
    },
  });
  await expect(viewport).toHaveCSS("overflow-y", "auto");
});
