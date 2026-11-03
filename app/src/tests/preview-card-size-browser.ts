import { query } from "@ariakit/test/playwright";
import type { FrameLocator, Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";
import {
  waitForFrameHydration,
  waitForShownFrame,
} from "./preview-cards-helpers.ts";

const SIZE_PREVIEW = "/react/previews/popover-preview-card-size/";
// The height of a frame whose page reports no height, outside a preview grid.
const FALLBACK_HEIGHT = 25 * 16;

async function getHeight(locator: Locator) {
  return locator.evaluate((element) => element.getBoundingClientRect().height);
}

// The height that fits the example inside the page padding of a preview.
async function getContentHeight(iframe: Locator) {
  const content = iframe.contentFrame().locator("[data-preview-content]");
  return content.evaluate((element) => {
    const { paddingTop, paddingBottom } = getComputedStyle(element);
    const example = element.querySelector("astro-island");
    if (!example) throw new Error("No example");
    return Math.ceil(
      example.getBoundingClientRect().height +
        Number.parseFloat(paddingTop) +
        Number.parseFloat(paddingBottom),
    );
  });
}

// The content of the Next.js size sandbox ends after the bottom margin of its
// footer element and the bottom padding of the element around it.
async function getContentBottom(frame: FrameLocator) {
  return frame.locator("footer").evaluate((element) => {
    const { marginBottom } = getComputedStyle(element);
    const content = element.closest("[data-preview-content]");
    if (!content) {
      throw new Error("No content");
    }
    const { paddingBottom } = getComputedStyle(content);
    const { bottom } = element.getBoundingClientRect();
    return (
      bottom +
      window.scrollY +
      Number.parseFloat(marginBottom) +
      Number.parseFloat(paddingBottom)
    );
  });
}

// The Combobox Group card is outside a preview grid and has no minimum height,
// so its frame has no floor and no grid row to fill. The frame loads another
// preview, as it does after a link in the page.
async function gotoPreviewInCard(page: Page, src: string) {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = await waitForShownFrame(page, "Combobox Group");
  await loadInFrame(iframe, src);
  return iframe;
}

async function loadInFrame(iframe: Locator, src: string) {
  const frame = await (await iframe.elementHandle())?.contentFrame();
  if (!frame) throw new Error("No frame");
  const previousUrl = frame.url();
  await iframe.evaluate((element, src) => {
    if (element instanceof HTMLIFrameElement) {
      element.src = src;
    }
  }, src);
  // A Next.js preview redirects to the Next.js server, so the frame URL is not
  // the one set here. The wait includes the load event.
  await frame.waitForURL((url) => url.href !== previousUrl);
  await iframe.scrollIntoViewIfNeeded();
}

async function gotoSizePreview(page: Page) {
  const iframe = await gotoPreviewInCard(page, SIZE_PREVIEW);
  await waitForFrameHydration(iframe);
  return iframe;
}

test("preview card frames fit their content and follow its changes", async ({
  page,
}) => {
  const iframe = await gotoSizePreview(page);
  const preview = query(iframe.contentFrame());
  await expect.poll(() => getHeight(iframe)).toBeLessThan(FALLBACK_HEIGHT);
  expect(await getHeight(iframe)).toBe(await getContentHeight(iframe));
  const height = await getHeight(iframe);

  await preview.button("Toggle details").click();
  await expect.poll(() => getHeight(iframe)).toBeGreaterThan(height + 300);
  expect(await getHeight(iframe)).toBe(await getContentHeight(iframe));

  await preview.button("Toggle details").click();
  await expect.poll(() => getHeight(iframe)).toBe(height);
});

test("preview card frames follow content that grows with an animation", async ({
  page,
}) => {
  const iframe = await gotoSizePreview(page);
  const preview = query(iframe.contentFrame());
  await expect.poll(() => getHeight(iframe)).toBeLessThan(FALLBACK_HEIGHT);
  const height = await getHeight(iframe);

  // The content grows on each frame, including right after the frame takes the
  // height that the page reported.
  await preview.button("Animate details").click();
  await expect.poll(() => getHeight(iframe)).toBe(height + 300);
  expect(await getHeight(iframe)).toBe(await getContentHeight(iframe));
});

test("preview card frames follow content that wraps in a narrower card", async ({
  page,
  q,
}) => {
  const iframe = await gotoPreviewInCard(
    page,
    "/react/previews/preview-card-size-nextjs/",
  );
  const frame = iframe.contentFrame();
  await expect(query(frame).link("Long route")).toBeVisible();
  const getOverflow = async () => {
    return (await getContentBottom(frame)) - (await getHeight(iframe));
  };
  await expect.poll(getOverflow).toBe(0);
  const card = query(q.region("Combobox Group", { exact: true }));
  const handle = card.separator("Resize preview");
  // Below the sm breakpoint, so the footer margin stays the same below.
  await handle.press("Shift+ArrowLeft");
  await expect(frame.locator("footer")).toHaveCSS("margin-bottom", "16px");
  await expect.poll(getOverflow).toBe(0);
  const height = await getHeight(iframe);

  // The paragraph wraps onto more lines at the narrowest width, with any font,
  // so the content grows.
  await handle.press("Home");
  await expect.poll(() => getHeight(iframe)).toBeGreaterThan(height);
  await expect.poll(getOverflow).toBe(0);

  await handle.press("Shift+ArrowRight");
  await expect.poll(() => getHeight(iframe)).toBe(height);
  await expect.poll(getOverflow).toBe(0);
});

test("preview card frames follow a margin that changes at a breakpoint", async ({
  page,
  q,
}) => {
  const iframe = await gotoPreviewInCard(
    page,
    "/react/previews/preview-card-size-nextjs/",
  );
  const frame = iframe.contentFrame();
  await expect(query(frame).text("Footer")).toBeVisible();
  const getOverflow = async () => {
    return (await getContentBottom(frame)) - (await getHeight(iframe));
  };
  await expect.poll(getOverflow).toBe(0);
  const height = await getHeight(iframe);
  const card = query(q.region("Combobox Group", { exact: true }));
  const handle = card.separator("Resize preview");

  // The frame gets narrower than the sm breakpoint, which shrinks the bottom
  // margin of the footer from 4rem to 1rem. The main element keeps its maximum
  // width, so neither element that the page measures changes size.
  await handle.press("Shift+ArrowLeft");
  await expect.poll(() => getHeight(iframe)).toBe(height - 48);
  await expect.poll(getOverflow).toBe(0);

  // Back above the breakpoint, the margin grows to 4rem again.
  await handle.press("Shift+ArrowRight");
  await expect.poll(() => getHeight(iframe)).toBe(height);
  await expect.poll(getOverflow).toBe(0);
});

test("preview card frames grow to fit an open popup", async ({ page }) => {
  // The popover is taller than the maximum height of the frame on this screen.
  await page.setViewportSize({ width: 1280, height: 500 });
  const iframe = await gotoSizePreview(page);
  const preview = query(iframe.contentFrame());
  await expect.poll(() => getHeight(iframe)).toBeLessThan(FALLBACK_HEIGHT);
  const height = await getHeight(iframe);
  const trigger = preview.button("Open popover");
  const triggerTop = await trigger.evaluate((element) => {
    return element.getBoundingClientRect().top;
  });
  // The example stays pinned until the frame shrinks back. The observer reads
  // the trigger position right as the pin goes, before the next frame, so an
  // example that moved in the still tall frame would show here.
  const unpinnedTops = await trigger.evaluateHandle((element) => {
    const content = element.ownerDocument.querySelector(
      "[data-preview-content]",
    );
    if (!(content instanceof HTMLElement)) throw new Error("No content");
    const tops: number[] = [];
    const observer = new MutationObserver(() => {
      if (content.style.paddingTop) return;
      tops.push(element.getBoundingClientRect().top);
    });
    observer.observe(content, { attributes: true, attributeFilter: ["style"] });
    return tops;
  });

  await trigger.click();
  const popover = preview.dialog("Tall popover");
  await expect(popover).toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBeGreaterThan(480);
  const getOverflow = async () => {
    const frameBox = await iframe.boundingBox();
    const popoverBox = await popover.boundingBox();
    if (!frameBox || !popoverBox) return Number.POSITIVE_INFINITY;
    const above = frameBox.y - popoverBox.y;
    const below =
      popoverBox.y + popoverBox.height - (frameBox.y + frameBox.height);
    return Math.max(above, below);
  };
  await expect.poll(getOverflow).toBeLessThanOrEqual(0);

  await page.keyboard.press("Escape");
  await expect(popover).not.toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBe(height);
  // The pin can wait for a short timer after the frame shrinks.
  await expect.poll(() => unpinnedTops.evaluate((tops) => tops.length)).toBe(1);
  for (const top of await unpinnedTops.jsonValue()) {
    expect(top).toBeCloseTo(triggerTop, 0);
  }
});

test("preview card frames keep a centered Next.js example in place while a popup needs room", async ({
  page,
}) => {
  // The popover doesn't fit below its trigger in the frame, so the frame grows.
  await page.setViewportSize({ width: 1280, height: 720 });
  const iframe = await gotoPreviewInCard(
    page,
    "/react/previews/preview-card-size-nextjs/",
  );
  const frame = iframe.contentFrame();
  await expect
    .poll(
      async () => (await getContentBottom(frame)) - (await getHeight(iframe)),
    )
    .toBe(0);
  const height = await getHeight(iframe);
  const trigger = query(frame).button("Open popover");
  const getTriggerPosition = () => {
    return trigger.evaluate((element) => {
      const { left, top } = element.getBoundingClientRect();
      return { left, top };
    });
  };
  const position = await getTriggerPosition();

  // The Next.js root layout centers the example in a column, so the pin keeps
  // it from moving on both axes while the frame grows below it.
  await trigger.click();
  await expect(query(frame).dialog("Tall popover")).toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBeGreaterThan(height);
  const pinnedPosition = await getTriggerPosition();
  expect(pinnedPosition.left).toBeCloseTo(position.left, 0);
  expect(pinnedPosition.top).toBeCloseTo(position.top, 0);
});

test("preview card frames give a popup that scrolls its content the fallback height", async ({
  page,
}) => {
  const iframe = await gotoSizePreview(page);
  const preview = query(iframe.contentFrame());
  await expect.poll(() => getHeight(iframe)).toBeLessThan(FALLBACK_HEIGHT);
  const height = await getHeight(iframe);

  // The popup limits its height to the room in the frame, so it fits the short
  // frame with only a few items in view.
  const trigger = preview.button("Open list");
  const getTriggerTop = () => {
    return trigger.evaluate((element) => element.getBoundingClientRect().top);
  };
  const triggerTop = await getTriggerTop();
  await trigger.click();
  const popover = preview.dialog("List popover");
  await expect(popover).toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBe(FALLBACK_HEIGHT);
  // The example stays in place, so the popup opens in the room below it.
  expect(await getTriggerTop()).toBe(triggerTop);
  // The grown frame can extend past the docs page viewport.
  await iframe.scrollIntoViewIfNeeded();
  await expect(preview.text("Item 5")).toBeInViewport();

  await page.keyboard.press("Escape");
  await expect(popover).not.toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBe(height);
});

function getCard(iframe: Locator) {
  return iframe.locator("xpath=ancestor::*[@data-preview-card][1]");
}

// Checks that a card stops at the maximum height while its page reports the
// height of content that follows the frame, and that the frame fits the card.
async function expectCardToStopAt(
  page: Page,
  iframe: Locator,
  maxHeight: number,
) {
  const card = getCard(iframe);
  const preview = query(iframe.contentFrame());
  // Each height that the page reports makes the content taller again.
  await preview.button("Fill the viewport").click();
  await expect.poll(() => getHeight(card)).toBeCloseTo(maxHeight, 0);
  // A card without a maximum height would keep growing on the following frames,
  // since each report reaches the card in a message task and the resized frame
  // reports again on its next rendering update. No state shows a growth that
  // didn't happen.
  await flushFrames(page, 10);
  expect(await getHeight(card)).toBeCloseTo(maxHeight, 0);
  await expectFrameToFitViewport(iframe);
}

// Checks that the viewport around a frame, which clips it, shows all of it, so
// the page can scroll to its end.
async function expectFrameToFitViewport(iframe: Locator) {
  const viewport = iframe.locator("xpath=../..");
  const viewportBox = await viewport.boundingBox();
  const frameBox = await iframe.boundingBox();
  if (!viewportBox || !frameBox) throw new Error("No box");
  expect(frameBox.y + frameBox.height).toBeLessThanOrEqual(
    viewportBox.y + viewportBox.height,
  );
}

// Returns the maximum card height that the preview grid around the frame sets.
async function getGridMaxHeight(iframe: Locator) {
  return iframe
    .locator("xpath=ancestor::*[contains(@class,'preview-grid')][1]")
    .evaluate((grid) => {
      const probe = grid.ownerDocument.createElement("div");
      probe.style.cssText =
        "position: absolute; height: var(--preview-card-max-height)";
      grid.append(probe);
      const { height } = probe.getBoundingClientRect();
      probe.remove();
      return height;
    });
}

test("preview cards stop at the screen height for content that fills the viewport", async ({
  page,
}) => {
  const iframe = await gotoSizePreview(page);
  await expect.poll(() => getHeight(iframe)).toBeLessThan(FALLBACK_HEIGHT);
  const screenHeight = await page.evaluate(() => window.innerHeight);
  await expectCardToStopAt(page, iframe, screenHeight);
});

test("preview cards in a preview grid stop at the grid height for content that fills the viewport", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  // The frame loads lazily, as it comes near the viewport.
  const title = "Collapsing Labels";
  await page.locator(`iframe[title="${title}"]`).scrollIntoViewIfNeeded();
  const iframe = await waitForShownFrame(page, title);
  await loadInFrame(iframe, SIZE_PREVIEW);
  await waitForFrameHydration(iframe);
  // The grid limits its cards to the room below the sticky headers.
  const gridHeight = await getGridMaxHeight(iframe);
  const screenHeight = await page.evaluate(() => window.innerHeight);
  expect(gridHeight).toBeGreaterThan(0);
  expect(gridHeight).toBeLessThan(screenHeight);
  await expectCardToStopAt(page, iframe, gridHeight);
});

test("preview card frames fit their viewport in a grid card shorter than its minimum height", async ({
  page,
}) => {
  // The grid limit leaves less room for the frame than the 16rem minimum height
  // of the grid.
  await page.setViewportSize({ width: 1280, height: 320 });
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  const title = "Collapsing Labels";
  await page.locator(`iframe[title="${title}"]`).scrollIntoViewIfNeeded();
  const iframe = await waitForShownFrame(page, title);
  await waitForFrameHydration(iframe);
  const card = getCard(iframe);
  expect(await getHeight(card)).toBeCloseTo(await getGridMaxHeight(iframe), 0);
  expect(await getHeight(iframe)).toBe(16 * 16);
  await expectFrameToFitViewport(iframe);
});

test("fullscreen preview cards in a preview grid stop at the grid height", async ({
  page,
}) => {
  // The fullscreen frame is 40rem tall, more than the grid limit on this
  // screen.
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoAndSettle(page, "/react/recipes/table-of-contents/");
  const iframe = await waitForShownFrame(page, "Table of Contents");
  const gridHeight = await getGridMaxHeight(iframe);
  expect(gridHeight).toBeLessThan(40 * 16);
  await expect
    .poll(() => getHeight(getCard(iframe)))
    .toBeCloseTo(gridHeight, 0);
  expect(await getHeight(iframe)).toBeLessThan(40 * 16);
  await expectFrameToFitViewport(iframe);
});

test("preview card frames follow the routes of a Next.js preview", async ({
  page,
}) => {
  // The long route fits below the maximum height of the frame.
  await page.setViewportSize({ width: 1280, height: 1000 });
  const iframe = await gotoPreviewInCard(
    page,
    "/react/previews/preview-card-size-nextjs/",
  );
  const frame = iframe.contentFrame();
  const preview = query(frame);
  await expect(preview.link("Long route")).toBeVisible();
  const getOverflow = async () => {
    return (await getContentBottom(frame)) - (await getHeight(iframe));
  };
  await expect.poll(getOverflow).toBe(0);
  const shortHeight = await getHeight(iframe);

  await preview.link("Long route").click();
  await expect(preview.text("Long content")).toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBeGreaterThan(shortHeight + 300);
  await expect.poll(getOverflow).toBe(0);

  await preview.link("Short route").click();
  await expect(preview.text("Short content")).toBeVisible();
  await expect.poll(() => getHeight(iframe)).toBe(shortHeight);
});

test("preview card frames follow the minimum height of a centered Next.js example", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/recipes/tabs/");
  const title = "Tabs with the Next.js App Router";
  // The frame loads once it comes near the viewport.
  await page.locator(`iframe[title="${title}"]`).scrollIntoViewIfNeeded();
  const iframe = await waitForShownFrame(page, title);
  // The Next.js root layout centers the example in the viewport, so the frame
  // takes its minimum height of 18rem.
  await expect.poll(() => getHeight(iframe)).toBe(18 * 16);

  // A larger text size raises the minimum height. A page that reported the
  // height of its viewport would keep the frame at the larger height after the
  // text size goes back.
  const setFontSize = (fontSize: string) => {
    return page.evaluate((value) => {
      document.documentElement.style.fontSize = value;
    }, fontSize);
  };
  await setFontSize("24px");
  await expect.poll(() => getHeight(iframe)).toBe(18 * 24);
  await setFontSize("");
  await expect.poll(() => getHeight(iframe)).toBe(18 * 16);
});

test("preview card frames stay at the minimum height of their example", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  const iframe = page.locator('iframe[title="Collapsing Labels"]');
  await waitForFrameHydration(iframe);
  // The preview grid gives every card the same minimum height as `minHeight` in
  // the metadata of this example, so the grid drops its own.
  await page.locator(".preview-grid").evaluate((grid) => {
    if (!(grid instanceof HTMLElement)) return;
    grid.style.setProperty("--preview-card-min-height", "0px");
  });
  // The example is shorter than its minimum height.
  await expect.poll(() => getContentHeight(iframe)).toBeLessThan(16 * 16);
  await expect.poll(() => getHeight(iframe)).toBe(16 * 16);
});

test("fullscreen preview card frames ignore the height that a Next.js page reports", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, "/react/recipes/app-shell/");
  const iframe = await waitForShownFrame(page, "App Shell");
  // The Next.js root layout marks a wrapper around every route, so the page
  // reports the height of its content to any card.
  await loadInFrame(iframe, "/react/previews/preview-card-size-nextjs/");
  await expect(
    query(iframe.contentFrame()).text("Short content"),
  ).toBeVisible();
  // The page reports its height on DOMContentLoaded, before the load that
  // loadInFrame waits for, but the report reaches the card in a message task.
  // No state shows a report that the card ignored.
  await flushFrames(page);
  expect(await getHeight(iframe)).toBe(40 * 16);
});

test("preview card frames keep the fallback height of a page without a content height", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  // An app shell fills its frame.
  await gotoAndSettle(page, "/react/recipes/app-shell/");
  const shell = page.locator('iframe[title="App Shell"]');
  await waitForFrameHydration(shell);
  await waitForShownFrame(page, "App Shell");
  expect(await getHeight(shell)).toBe(40 * 16);

  // An open popup needs its room before the frame can measure it.
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const combobox = await waitForShownFrame(page, "Combobox Group");
  expect(await getHeight(combobox)).toBeGreaterThanOrEqual(25 * 16);
});

test("preview card frames go back to the fallback height after a navigation", async ({
  page,
}) => {
  const iframe = await gotoSizePreview(page);
  await expect.poll(() => getHeight(iframe)).toBeLessThan(FALLBACK_HEIGHT);
  // A preview with an open popup does not report a content height.
  await iframe.evaluate((element) => {
    if (element instanceof HTMLIFrameElement) {
      element.src = "/react/previews/combobox-group/";
    }
  });
  await expect.poll(() => getHeight(iframe)).toBe(FALLBACK_HEIGHT);
});
