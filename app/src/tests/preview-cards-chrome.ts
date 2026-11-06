import { query } from "@ariakit/test/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";
import {
  getViewportEdge,
  waitForArticle,
  waitForFrameHydration,
  waitForShownFrame,
  widenExample,
} from "./preview-cards-helpers.ts";

// Frames without the Navigation API, such as WebKit frames, keep their own
// entries. Removing the API in Chrome frames runs the same code while Chrome
// still adds real frame history entries, so native traversals reach the frame.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.self === window.top) return;
    Object.defineProperty(window, "navigation", { value: undefined });
  });
});

async function gotoNextjsCard(page: Page) {
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const iframe = page.locator(
    'iframe[title="Tabs with the Next.js App Router"]',
  );
  await iframe.scrollIntoViewIfNeeded();
  return iframe.contentFrame();
}

test("Next.js preview cards stay in sync after the browser moves their frame", async ({
  page,
  q,
}) => {
  const frame = await gotoNextjsCard(page);
  const preview = query(frame);
  const card = query(q.region("Tabs with the Next.js App Router"));
  const address = card.textbox("Address");

  await preview.tab("Sent").click();
  await expect(address).toHaveValue("/tabs/nextjs/sent");
  await expect(card.button("Back")).toBeEnabled();

  // This is the traversal of the browser back button, which page.goBack()
  // cannot run because it waits for the top-level page to navigate.
  await frame.locator("body").evaluate(() => history.back());
  await expect(address).toHaveValue("/tabs/nextjs");
  await expect(preview.tabpanel("Inbox")).toBeVisible();
  await expect(card.button("Back")).toBeDisabled();
  await expect(card.button("Forward")).toBeDisabled();
  await expect(page).toHaveURL(/\/react\/recipes\/tabs\/$/);
});

test("Next.js preview cards keep their history after fragment links", async ({
  page,
  q,
}) => {
  const frame = await gotoNextjsCard(page);
  const preview = query(frame);
  const card = query(q.region("Tabs with the Next.js App Router"));
  const address = card.textbox("Address");

  await preview.tab("Sent").click();
  await expect(address).toHaveValue("/tabs/nextjs/sent");

  // The example has no fragment links, which fire popstate like a traversal.
  await frame.locator("body").evaluate((body) => {
    const link = document.createElement("a");
    link.href = "#posts";
    link.textContent = "Skip to posts";
    body.prepend(link);
  });
  await preview.link("Skip to posts").click();
  await expect(address).toHaveValue("/tabs/nextjs/sent#posts");
  await expect(card.button("Back")).toBeEnabled();

  await card.button("Back").click();
  await expect(address).toHaveValue("/tabs/nextjs");
  await expect(preview.tabpanel("Inbox")).toBeVisible();
  await expect(page).toHaveURL(/\/react\/recipes\/tabs\/$/);
});

test("inline preview cards reload their example from its initial state", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/skeleton/");
  const card = query(q.region("Timing", { exact: true }));
  const status = card.status();
  await card.radio("Medium").scrollIntoViewIfNeeded();
  // The server HTML only shows the loading status, so the loaded status means
  // the example hydrated.
  await expect(status).toHaveText("Contact loaded");
  await card.radio("Slow").click();
  await expect(card.radio("Slow")).toBeChecked();
  await expect(status).toHaveText("Loading contact");

  await card.button("Reload preview").click();
  await expect(card.radio("Medium")).toBeChecked();
  await expect(card.button("Reload preview")).toBeFocused();
  await expect(status).toHaveText("Contact loaded");
});

test("browser preview cards keep the reload button in their navigation", async ({
  page,
  q,
}) => {
  await gotoNextjsCard(page);
  const card = query(q.region("Tabs with the Next.js App Router"));
  await expect(card.button("Reload")).toBeVisible();
  await expect(card.button("Reload preview")).toHaveCount(0);
});

interface Point {
  x: number;
  y: number;
}

// Playwright sends each wheel event when the previous one is done, so their
// timing varies. Chrome takes the time of each event from the DevTools
// Protocol, which sets how the preview groups events into gestures.
async function openWheel(page: Page, point: Point) {
  const session = await page.context().newCDPSession(page);
  return {
    send: (deltaX: number, deltaY: number, timestamp: number) =>
      session.send("Input.dispatchMouseEvent", {
        type: "mouseWheel",
        ...point,
        deltaX,
        deltaY,
        timestamp,
      }),
    [Symbol.asyncDispose]: () => session.detach(),
  };
}

// The first event of a gesture scrolls the docs page, so the next events land
// further down in the preview, which must still be under the point.
function isUnderPoint(target: Locator, { x, y }: Point) {
  return target.evaluate(
    (element, point) => {
      const hit = element.ownerDocument.elementFromPoint(point.x, point.y);
      return !!hit && element.contains(hit);
    },
    { x, y },
  );
}

test("inline previews judge the direction of a whole wheel gesture", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await gotoAndSettle(page, "/react/recipes/skeleton/");
  const article = q.region("Paragraph Lines", { exact: true });
  await waitForArticle(article);
  const handle = query(article).separator("Resize preview", {
    includeHidden: true,
  });
  const viewportId = await handle.getAttribute("aria-controls");
  const viewport = page.locator(`[id="${viewportId}"]`);
  await widenExample(viewport);
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollWidth > el.clientWidth))
    .toBe(true);
  await viewport.evaluate((element) => element.scrollIntoView());
  const box = await viewport.boundingBox();
  if (!box) throw new Error("The viewport has no bounding box.");
  const point = { x: box.x + 24, y: box.y + 120 };
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  const getScrollLeft = () => viewport.evaluate((el) => el.scrollLeft);
  const inactiveEdge = await getViewportEdge(viewport);
  await using wheel = await openWheel(page, point);
  const start = Date.now() / 1000;

  // A sideways event 16ms into a vertical gesture belongs to it, so the gesture
  // still scrolls the docs page.
  const pageScroll = await getPageScroll();
  await wheel.send(0, 100, start);
  await expect.poll(getPageScroll).toBeGreaterThan(pageScroll);
  expect(await isUnderPoint(viewport, point)).toBe(true);
  await wheel.send(20, 0, start + 0.016);
  // The card would show an activation on the next frame, which no state reports
  // before it.
  await flushFrames(page);
  expect(await getScrollLeft()).toBe(0);
  expect(await getViewportEdge(viewport)).toBe(inactiveEdge);

  // The same event after the gesture ended starts a horizontal gesture.
  await wheel.send(20, 0, start + 0.4);
  await expect.poll(getScrollLeft).toBeGreaterThan(0);
  await expect.poll(() => getViewportEdge(viewport)).not.toBe(inactiveEdge);
});

test("preview card frames judge the direction of a whole wheel gesture", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = page.locator('iframe[title="Combobox Group"]');
  const frame = await waitForFrameHydration(iframe);
  // The card activates the frame for the page, so it waits for the card to
  // hydrate too, which can come after the frame.
  await waitForShownFrame(page, "Combobox Group");
  const html = frame.locator("html");
  await widenExample(frame.locator("body"));
  await expect
    .poll(() => html.evaluate((el) => el.scrollWidth > el.clientWidth))
    .toBe(true);
  await iframe.scrollIntoViewIfNeeded();
  const box = await iframe.boundingBox();
  if (!box) throw new Error("The frame has no bounding box.");
  // The popup contains its overscroll, so the wheel starts above it.
  const point = { x: box.x + box.width / 2, y: box.y + 16 };
  const getPageScroll = () => page.evaluate(() => window.scrollY);
  const getScrollLeft = () => html.evaluate((el) => el.scrollLeft);
  await using wheel = await openWheel(page, point);
  const start = Date.now() / 1000;

  // A sideways event 16ms into a vertical gesture belongs to it, so the gesture
  // still scrolls the docs page.
  const pageScroll = await getPageScroll();
  await wheel.send(0, 100, start);
  await expect.poll(getPageScroll).toBeGreaterThan(pageScroll);
  expect(await isUnderPoint(iframe, point)).toBe(true);
  await wheel.send(20, 0, start + 0.016);
  // The card would activate the frame with messages between the documents,
  // which no state reports until the frame becomes active.
  await flushFrames(page);
  expect(await getScrollLeft()).toBe(0);
  await expect(html).not.toHaveAttribute("data-preview-active", "");

  // The same event after the gesture ended starts a horizontal gesture.
  await wheel.send(20, 0, start + 0.4);
  await expect.poll(getScrollLeft).toBeGreaterThan(0);
  await expect(html).toHaveAttribute("data-preview-active", "");
});
