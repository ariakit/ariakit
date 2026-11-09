import { query } from "@ariakit/test/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";
import {
  getExampleBox,
  getPreviewViewport,
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

// The frame shows the server HTML of the tabs before Next.js hydrates them, and
// a click on a tab link then loads a new document, which starts a new frame
// history. The card shows the frame after its load event, which in practice
// comes after hydration.
// https://github.com/ariakit/ariakit/issues/8330
async function gotoNextjsCard(page: Page) {
  const title = "Tabs with the Next.js App Router";
  await gotoAndSettle(page, "/react/recipes/tabs/");
  await page.locator(`iframe[title="${title}"]`).scrollIntoViewIfNeeded();
  const iframe = await waitForShownFrame(page, title);
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

// A card near the height of its row grows to the row, with calc-size(), which
// only Chrome supports. The example stays in place when it grows in its card
// and when the other card in its row grows.
test("inline preview cards keep their examples in place when heights change", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndSettle(page, "/react/recipes/text-field/");
  const slots = q.region("Slots", { exact: true });
  const composer = q.region("Auto-Growing Textarea", { exact: true });
  await composer.scrollIntoViewIfNeeded();
  // Astro removes the ssr attribute once the island hydrates, and the composer
  // doesn't send messages before that.
  await expect(slots.locator("astro-island[ssr]")).toHaveCount(0);
  await expect(composer.locator("astro-island[ssr]")).toHaveCount(0);
  const messages = query(composer).list("Messages");
  const send = async (count: number) => {
    const input = query(composer).textbox("Message");
    for (let i = 0; i < count; i++) {
      const sent = await query(messages).listitem().count();
      await input.fill("A new message");
      await input.press("Enter");
      await expect(query(messages).listitem()).toHaveCount(sent + 1);
    }
  };
  // The region stretches to its row, and the card in it can grow to the row.
  // The element is in the example, so it moves with the example.
  const measure = async (article: Locator, element: Locator) => {
    const card = await article.locator(":scope > *").boundingBox();
    const box = await element.boundingBox();
    if (!card || !box) throw new Error("The card or the element has no box");
    return { card: card.height, height: box.height, offset: box.y - card.y };
  };
  const getComposer = () => measure(composer, messages);
  const getSlots = () => measure(slots, query(slots).textbox("Email"));

  // The new messages bring the composer card to the height of the row, which
  // the Slots card sets.
  await send(5);
  const slotsStart = await getSlots();
  await expect
    .poll(async () => (await getComposer()).card)
    .toBe(slotsStart.card);

  // The next message makes the example taller, and its card stays at the height
  // of the row.
  const composerStart = await getComposer();
  await send(1);
  await expect
    .poll(async () => (await getComposer()).height)
    .toBeGreaterThan(composerStart.height);
  expect((await getComposer()).card).toBe(composerStart.card);
  expect((await getComposer()).offset).toBe(composerStart.offset);

  // More messages make the row taller than the Slots example, and its card
  // grows too.
  await send(3);
  await expect
    .poll(async () => (await getSlots()).card)
    .toBeGreaterThan(slotsStart.card);
  expect((await getSlots()).offset).toBe(slotsStart.offset);
});

// The Scrolling Tab Strip card grows toward the taller card next to it, with
// calc-size(), which only Chrome supports. Its short example stays centered
// within the minimum height of the card, where it would be in a shorter row.
test("inline preview cards center short examples within the minimum height", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const article = q.region("Scrolling Tab Strip", { exact: true });
  await article.scrollIntoViewIfNeeded();
  // Astro removes the ssr attribute once the island hydrates, and the tab strip
  // can change its layout then.
  await expect(article.locator("astro-island[ssr]")).toHaveCount(0);
  const viewport = await getPreviewViewport(article);
  const minHeight = await viewport.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).minHeight),
  );
  await expect
    .poll(async () => (await viewport.boundingBox())?.height)
    .toBeGreaterThan(minHeight);
  // The viewport padding is the same above and below the example, so the
  // example is centered within the minimum height when its gaps match there.
  const example = await getExampleBox(viewport);
  expect(example.top).toBeCloseTo((minHeight - example.height) / 2, 0);
});

// The height of a frame viewport and its minimum height, and the box of an
// element in it, from the top of the viewport.
async function measureInViewport(viewport: Locator, element: Locator) {
  const area = await viewport.boundingBox();
  const box = await element.boundingBox();
  if (!area || !box) throw new Error("The viewport or the element has no box");
  const minHeight = await viewport.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).minHeight),
  );
  return {
    viewport: area.height,
    minHeight,
    height: box.height,
    top: box.y - area.y,
    center: box.y - area.y + box.height / 2,
  };
}

// The Collapsing Labels card grows to the taller Collapsed Sidebar card in its
// row, with calc-size(), which only Chrome supports. Its frame keeps the
// minimum height of the card, where its page centers the example, and the
// height that the row adds goes below the frame.
test("preview card frames center their examples within the minimum height", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  const title = "Collapsing Labels";
  const article = q.region(title, { exact: true });
  await article.scrollIntoViewIfNeeded();
  const iframe = await waitForShownFrame(page, title);
  const viewport = await getPreviewViewport(article);
  const frame = await measureInViewport(viewport, iframe);
  expect(frame.viewport).toBeGreaterThan(frame.minHeight);
  expect(frame.height).toBeCloseTo(frame.minHeight, 0);
  expect(frame.top).toBeCloseTo(0, 0);
});

// While the Collapsing Labels page loads, its card already grows to the taller
// Collapsed Sidebar card in its row. The loader shows where the page will
// center the example, in the middle of the frame, not of the taller card.
test("preview card frames show their loader where their page centers the example", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // Holding the document of the frame keeps the card loading.
  const { promise: released, resolve: release } = Promise.withResolvers();
  await page.route("**/react/previews/tooltip/responsive/", async (route) => {
    await released;
    await route.continue();
  });
  await page.goto("/react/recipes/tooltip/", { waitUntil: "commit" });
  const title = "Collapsing Labels";
  const article = q.region(title, { exact: true });
  await article.scrollIntoViewIfNeeded();
  const iframe = page.locator(`iframe[title="${title}"]`);
  await expect(iframe.locator("xpath=..")).toHaveAttribute("aria-busy", "true");
  const viewport = await getPreviewViewport(article);
  await expect
    .poll(async () => {
      const { viewport: height, minHeight } = await measureInViewport(
        viewport,
        iframe,
      );
      return height - minHeight;
    })
    .toBeGreaterThan(0);
  // The loader draws the only graphics in the viewport, as the page in the
  // frame is another document. Its first graphic is the symbol, which doesn't
  // turn like the dot over it.
  const symbol = viewport.locator("svg").first();
  const loader = await measureInViewport(viewport, symbol);
  const frame = await measureInViewport(viewport, iframe);
  expect(loader.center).toBeCloseTo(frame.center, 0);
  release(undefined);
});

// Returns whether the loader of a preview card frame shows, which lies next to
// the frame in the same grid cell.
function isLoaderShown(viewport: Element) {
  const loader = viewport.lastElementChild;
  if (!loader) return false;
  return getComputedStyle(loader).display !== "none";
}

test("preview card frames show their loader at once while their first page loads", async ({
  page,
}) => {
  // Holding the document of the frame keeps the card loading.
  const { promise: released, resolve: release } = Promise.withResolvers();
  await page.route("**/react/previews/app-shell/", async (route) => {
    await released;
    await route.continue();
  });
  await page.goto("/react/recipes/app-shell/", { waitUntil: "commit" });
  const iframe = page.locator('iframe[title="App Shell"]');
  const viewport = iframe.locator("xpath=..");
  // The server renders the card with its loader, which shows from the first
  // paint, before the card hydrates. A loader that waited would hide until some
  // time after the card hydrates.
  await viewport.waitFor({ state: "attached" });
  expect(await viewport.evaluate(isLoaderShown)).toBe(true);
  await expect(viewport).toHaveAttribute("aria-busy", "true");
  release(undefined);
  await waitForShownFrame(page, "App Shell");
});

test("preview card frames show their loader on a reload once the page takes a while", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/app-shell/");
  const iframe = await waitForShownFrame(page, "App Shell");
  const viewport = iframe.locator("xpath=..");
  const frame = await iframe
    .elementHandle()
    .then((element) => element?.contentFrame());
  // Holding the scripts and fonts of the reloaded page delays its load event,
  // so the page stays in the state that its embed script reports while it
  // parses.
  const { promise: released, resolve: release } = Promise.withResolvers();
  await page.route("**/*", async (route) => {
    const request = route.request();
    const type = request.resourceType();
    if (request.frame() === frame && (type === "script" || type === "font")) {
      await released;
    }
    await route.continue();
  });
  // The page measures the time from the busy state to the loader, since a test
  // that checks in between can be late on a busy machine.
  const loaderDelay = viewport.evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        let busyTime = 0;
        const observer = new MutationObserver(() => {
          if (element.getAttribute("aria-busy") === "true") {
            busyTime ||= performance.now();
          }
          if (!busyTime) return;
          // The loader lies next to the frame, in the same grid cell.
          const loader = element.lastElementChild;
          if (!loader) return;
          if (getComputedStyle(loader).display === "none") return;
          observer.disconnect();
          resolve(performance.now() - busyTime);
        });
        observer.observe(element, { attributes: true });
      }),
  );
  await query(q.region("App Shell", { exact: true }))
    .button("Reload preview")
    .click();
  // The card is busy and hides the frame at once, but shows the loader only
  // once the page takes 300ms. A timer never fires early.
  await expect(viewport).toHaveAttribute("aria-busy", "true");
  await expect(iframe).toHaveCSS("opacity", "0");
  expect(await loaderDelay).toBeGreaterThanOrEqual(250);
  release(undefined);
  await waitForShownFrame(page, "App Shell");
  // A loader that shows stays for 200ms, so it can outlast the busy state.
  await expect.poll(() => viewport.evaluate(isLoaderShown)).toBe(false);
});
