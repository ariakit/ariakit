/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { query } from "@ariakit/test/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames } from "#app/test-utils/preview.ts";
import { gotoPage } from "./app-navigation-card-helpers.ts";

// The show timeout of the card, half the default of a hovercard.
const SHOW_TIMEOUT = 250;

function getCard(page: Page, title: string) {
  return query(page).dialog(title);
}

// The time that the pointer rests on a link before the card renders its
// examples, once the card shows.
const SETTLE_DELAY = 100;

interface CardSwitch {
  /** The previews that show when the card first shows the title. */
  frames: number;
  /** The milliseconds from the title to the first preview that shows. */
  delay: number;
  /** The box of the frame around the previews, in the card. */
  before: DOMRectInit | null;
  after: DOMRectInit | null;
}

// Watches the card from the moment it takes the given title until a preview
// shows in it. The page measures the time, since a test that checks in between
// can be late on a busy machine.
function watchCard(page: Page, title: string) {
  return page.evaluate(
    (title) =>
      new Promise<CardSwitch>((resolve) => {
        const isShown = (element: Element) =>
          element.getBoundingClientRect().width > 0;
        const getCard = () => document.querySelector("[role=dialog]");
        // The card slides and scales as it moves and opens, so the box is the
        // layout box of the frame in the card.
        const getFrameBox = (card: Element) => {
          const frame = Array.from(
            card.querySelectorAll("[data-app-navigation-frame]"),
          ).find(isShown);
          if (!(frame instanceof HTMLElement)) return null;
          let x = 0;
          let y = 0;
          let element: Element | null = frame;
          for (
            ;
            element instanceof HTMLElement;
            element = element.offsetParent
          ) {
            if (element === card) break;
            x += element.offsetLeft;
            y += element.offsetTop;
          }
          return { x, y, width: frame.offsetWidth, height: frame.offsetHeight };
        };
        let titled: { time: number; frames: number; box: DOMRectInit | null };
        const observer = new MutationObserver(() => {
          const card = getCard();
          if (!card) return;
          const frames = Array.from(card.querySelectorAll("iframe"));
          if (!titled) {
            const heading = Array.from(
              card.querySelectorAll("h1, h2, h3, h4, h5, h6"),
            ).find(isShown);
            if (heading?.textContent !== title) return;
            titled = {
              time: performance.now(),
              frames: frames.filter(isShown).length,
              box: getFrameBox(card),
            };
          }
          if (!frames.some(isShown)) return;
          observer.disconnect();
          resolve({
            frames: titled.frames,
            delay: performance.now() - titled.time,
            before: titled.box,
            after: getFrameBox(card),
          });
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
      }),
    title,
  );
}

// The number that a link shows at its end, which describes it.
async function getCount(link: Locator) {
  const description = await link.evaluate((element) => {
    const id = element.getAttribute("aria-describedby");
    return id ? element.ownerDocument.getElementById(id)?.textContent : null;
  });
  return Number.parseInt(description ?? "", 10);
}

test("site navigation card shows the examples of the hovered link", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  const link = navigation.link("Breadcrumb");
  await link.hover();
  // The card takes the title of the example that shows. The first example of a
  // recipe takes the title of the recipe.
  const card = query(page).dialog();
  await expect(card).toHaveAccessibleName("Breadcrumb");
  const carousel = query(card).region("Breadcrumb examples");
  // The card has a slide tab for each example that the link counts.
  await expect(query(carousel).tab(/^Slide \d+$/)).toHaveCount(
    await getCount(link),
  );
  // Only the slide that shows loads its preview page, which fades in once the
  // page reports that it loaded.
  const frames = card.locator("iframe");
  await expect(frames).toHaveCount(1);
  await expect(frames.first()).toHaveAttribute(
    "src",
    "/react/previews/breadcrumb/",
  );
  await expect(frames.first()).toHaveCSS("opacity", "1");
  await query(carousel).button("Next slide").click();
  await expect(query(carousel).tab("Slide 2")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  // The next slide loads its page once it shows, and the first slide keeps its
  // page.
  await expect(frames).toHaveCount(2);
  await expect(frames.nth(1)).toHaveCSS("opacity", "1");
  // The frame takes the title of its example, which now names the card.
  const title = await frames.nth(1).getAttribute("title");
  expect(title).toBeTruthy();
  expect(title).not.toBe("Breadcrumb");
  await expect(card).toHaveAccessibleName(title ?? "");
});

test("site navigation card lays out its previews beside the link", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  // A link in the middle of the sidebar leaves room to center the card on it.
  const link = navigation.link("Radio");
  await link.hover();
  const card = query(page).dialog("Radio");
  const frame = card.locator("iframe");
  await expect(frame).toHaveCSS("opacity", "1");
  // A preview draws at three quarters of the default font size, and leaves no
  // room to scroll below a short example.
  const html = frame.contentFrame().locator("html");
  await expect(html).toHaveCSS("font-size", "12px");
  await expect
    .poll(() => html.evaluate((root) => root.scrollHeight - root.clientHeight))
    .toBe(0);
  const layout = await card.evaluate(
    (element, anchor) => {
      const viewport = element.querySelector(".carousel-viewport");
      const slide = element.querySelector(".carousel-slide");
      const iframe = element.querySelector("iframe");
      const tabList = element.querySelector("[role=tablist]");
      const button = element.querySelector(".carousel-button");
      if (!viewport) return null;
      if (!slide) return null;
      if (!iframe) return null;
      if (!tabList) return null;
      if (!button) return null;
      const box = (node: Element) => node.getBoundingClientRect();
      return {
        card: box(element),
        position: element.parentElement
          ? getComputedStyle(element.parentElement).position
          : null,
        link: box(anchor),
        padding: Number.parseFloat(
          getComputedStyle(anchor).getPropertyValue("--nav-py"),
        ),
        viewport: box(viewport),
        viewportRadius: getComputedStyle(viewport).borderTopLeftRadius,
        slideGap: getComputedStyle(viewport).columnGap,
        snapStop: getComputedStyle(slide).scrollSnapStop,
        iframe: box(iframe),
        iframeRadius: getComputedStyle(iframe).borderTopLeftRadius,
        tabList: box(tabList),
        button: box(button),
      };
    },
    await link.elementHandle(),
  );
  expect(layout).not.toBeNull();
  if (!layout) return;
  // The card keeps twice the navigation padding from the link, centered on it,
  // with a fixed position. The popover rounds its position to whole pixels, and
  // the link can sit on a half pixel.
  const gutter = layout.card.left - layout.link.right;
  const cardCenter = layout.card.top + layout.card.height / 2;
  const linkCenter = layout.link.top + layout.link.height / 2;
  expect(Math.abs(gutter - layout.padding * 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(cardCenter - linkCenter)).toBeLessThanOrEqual(1);
  expect(layout.position).toBe("fixed");
  // The viewport rounds and borders the previews, which sit inside its border
  // with no space between them, so the corners stay in place while the slides
  // scroll.
  expect(layout.viewportRadius).not.toBe("0px");
  expect(layout.iframeRadius).toBe("0px");
  expect(layout.slideGap).toBe("0px");
  // A fast flick, such as on a trackpad, stops at the next slide.
  expect(layout.snapStop).toBe("always");
  expect(layout.iframe.left).toBeGreaterThan(layout.viewport.left);
  expect(layout.iframe.top).toBeGreaterThan(layout.viewport.top);
  expect(layout.iframe.bottom).toBeLessThan(layout.viewport.bottom);
  // The slide tabs keep the same space from the previews as from the edge of
  // the card, which adds its 1px border.
  const above = layout.tabList.top - layout.viewport.bottom;
  const below = layout.card.bottom - layout.tabList.bottom;
  expect(Math.abs(above - below)).toBeLessThanOrEqual(1);
  // The previous and next buttons stay small over the previews.
  expect(layout.button.width).toBeLessThanOrEqual(24);
  // A fullscreen preview, such as an app shell, draws smaller still.
  await navigation.link("App Shell").hover();
  // The card keeps the examples of the previous link, hidden.
  const shellCard = query(page).dialog("App Shell");
  const shell = shellCard.locator("iframe:visible");
  const shellRoot = shell.contentFrame().locator("html");
  await expect(shellRoot).toHaveCSS("font-size", "10px");
  // An app shell rounds its corners to the inner corners of the frame around
  // it, which clips the page.
  const innerRadius = await shellCard
    .locator(".carousel-viewport:visible")
    .evaluate((viewport) => {
      const style = getComputedStyle(viewport);
      const radius = Number.parseFloat(style.borderTopLeftRadius);
      return `${radius - Number.parseFloat(style.borderTopWidth)}px`;
    });
  await expect
    .poll(() =>
      shellRoot.evaluate((root) =>
        getComputedStyle(root).getPropertyValue("--preview-viewport-radius"),
      ),
    )
    .toBe(innerRadius);
});

test("site navigation card clips its previews only at the corners of their frame", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Radio").hover();
  const frame = query(page).dialog("Radio").locator("iframe");
  await expect(frame).toHaveCSS("opacity", "1");
  // Inside another rounded clip, Chrome can skip the rounded clip of the frame
  // around a preview when it draws with the GPU, and the preview covers the
  // corners of the frame. Headless Chrome draws without the GPU and clips both,
  // so the test checks that no other element around the preview rounds a clip.
  const roundedClips = await frame.evaluate((iframe) => {
    const clips: string[] = [];
    let element = iframe.parentElement;
    for (; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.overflowX === "visible" && style.overflowY === "visible") {
        continue;
      }
      const radii = [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomLeftRadius,
        style.borderBottomRightRadius,
      ];
      if (radii.every((radius) => Number.parseFloat(radius) === 0)) continue;
      const isFrame = element.hasAttribute("data-app-navigation-frame");
      const name = element.getAttribute("role") ?? element.localName;
      clips.push(isFrame ? "frame" : name);
    }
    return clips;
  });
  expect(roundedClips).toEqual(["frame"]);
});

test("site navigation card shows a loader until the preview loads", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  // The preview page waits for the test, so the loader shows for as long as the
  // assertions need.
  const { promise: released, resolve: release } = Promise.withResolvers<void>();
  await page.route("**/react/previews/breadcrumb/", async (route) => {
    await released;
    await route.continue();
  });
  // The loader waits 300ms after the frame mounts, so a page that loads by then
  // shows no loader. The page measures the wait, since a test that checks in
  // between can be late on a busy machine. A timer never fires early.
  const loaderDelay = page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let frameTime = 0;
        const observer = new MutationObserver(() => {
          const frame = document.querySelector("[role=dialog] iframe");
          if (!frame) return;
          frameTime ||= performance.now();
          // The loader lies next to the frame, in the same grid cell.
          if (!frame.nextElementSibling) return;
          observer.disconnect();
          resolve(performance.now() - frameTime);
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }),
  );
  await navigation.link("Breadcrumb").hover();
  const frame = query(page).dialog("Breadcrumb").locator("iframe");
  const loader = frame.locator("xpath=following-sibling::*[1]");
  await expect(loader).toBeVisible();
  // The portal of the card can join the document after the timer starts, so the
  // measured wait can be shorter than the delay, but a loader without one shows
  // at once.
  expect(await loaderDelay).toBeGreaterThanOrEqual(150);
  await expect(frame).toHaveCSS("opacity", "0");
  release();
  await expect(frame).toHaveCSS("opacity", "1");
  await expect(loader).toHaveCount(0);
});

test("site navigation card shows a loader while a preview loads a new page", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Breadcrumb").hover();
  const frame = query(page).dialog("Breadcrumb").locator("iframe");
  await expect(frame).toHaveCSS("opacity", "1");
  // Holding the scripts and fonts of the next page delays its load event, so
  // the page stays in the state that its embed script reports while it parses.
  const { promise: released, resolve: release } = Promise.withResolvers<void>();
  const frameElement = await frame.elementHandle();
  const contentFrame = await frameElement?.contentFrame();
  await page.route("**/*", async (route) => {
    const request = route.request();
    const type = request.resourceType();
    if (request.frame() === contentFrame) {
      if (type === "script" || type === "font") {
        await released;
      }
    }
    await route.continue();
  });
  // An example can load another page in its frame, as a reload does here.
  await frame
    .contentFrame()
    .locator("html")
    .evaluate(() => {
      location.reload();
    });
  const loader = frame.locator("xpath=following-sibling::*[1]");
  await expect(loader).toBeVisible();
  await expect(frame).toHaveCSS("opacity", "0");
  release();
  await expect(frame).toHaveCSS("opacity", "1");
  await expect(loader).toHaveCount(0);
});

test("site navigation card keeps the room below a preview that opens a popup", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Combobox Group").hover();
  const frame = query(page).dialog("Combobox Group").locator("iframe");
  await expect(frame).toHaveCSS("opacity", "1");
  // The page opens its popup below the trigger, in the room below the example.
  const html = frame.contentFrame().locator("html");
  await expect
    .poll(() => html.evaluate((root) => root.scrollHeight - root.clientHeight))
    .toBeGreaterThan(0);
});

test("site navigation card preview scrolls with the wheel after it loses focus", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Combobox Group").hover();
  const card = query(page).dialog("Combobox Group");
  const frame = card.locator("iframe");
  await expect(frame).toHaveCSS("opacity", "1");
  const html = frame.contentFrame().locator("html");
  await expect
    .poll(() => html.evaluate((root) => root.scrollHeight - root.clientHeight))
    .toBeGreaterThan(0);
  // The person tries the example, then clicks the card outside the preview,
  // which takes focus from the preview page.
  await frame.contentFrame().getByRole("combobox").click();
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error("The card has no box");
  await page.mouse.click(cardBox.x + 2, cardBox.y + cardBox.height / 2);
  await expect(card).toHaveAttribute("data-open");
  // The page marks itself active while it scrolls with the wheel.
  await expect(html).toHaveAttribute("data-preview-active");
  await html.evaluate((root) => {
    root.scrollTop = 0;
  });
  const scrollY = await page.evaluate(() => window.scrollY);
  const frameBox = await frame.boundingBox();
  if (!frameBox) throw new Error("The preview has no box");
  await page.mouse.move(
    frameBox.x + frameBox.width / 2,
    frameBox.y + frameBox.height / 2,
  );
  await page.mouse.wheel(0, 120);
  // The wheel scrolls the preview page, not the docs page behind the card.
  await expect
    .poll(() => html.evaluate((root) => root.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
});

test("site navigation card keeps the previews of a link that shows again", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  let loads = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/react/previews/breadcrumb/")) {
      loads++;
    }
  });
  await navigation.link("Breadcrumb").hover();
  const breadcrumb = query(page).dialog("Breadcrumb").locator("iframe");
  await expect(breadcrumb).toHaveCSS("opacity", "1");
  const frame = await breadcrumb.elementHandle();
  await navigation.link("Radio").hover();
  const radio = query(page).dialog("Radio").locator("iframe:visible");
  await expect(radio).toHaveCSS("opacity", "1");
  // The previous preview stays in the card without a layout, so its page
  // doesn't render in the background.
  expect(await frame?.isVisible()).toBe(false);
  await navigation.link("Breadcrumb").hover();
  await expect(query(page).dialog("Breadcrumb")).toBeVisible();
  // The card records the link again once the pointer rests on it, after the
  // settle delay, and a frame that moves in the document loads its page again.
  // No state shows that the timer passed, so the test waits past the timer and
  // the render after it before it counts the loads.
  await page.waitForTimeout(SETTLE_DELAY * 2);
  // The same frame shows again, without loading its page again.
  expect(await frame?.isVisible()).toBe(true);
  expect(loads).toBe(1);
});

test("site navigation card stays open over a preview that it kept", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  const link = navigation.link("Radio");
  await link.hover();
  const card = query(page).dialog("Radio");
  await expect(card.locator("iframe")).toHaveCSS("opacity", "1");
  // The card hides, and shows again with the preview that it kept.
  await page.mouse.move(1200, 650);
  await expect(card).toBeHidden();
  await link.hover();
  await expect(card).toBeVisible();
  // The mouse moves within the preview page, which Ariakit also follows.
  const viewport = await card.locator(".carousel-viewport").boundingBox();
  if (!viewport) throw new Error("The card has no viewport");
  const center = {
    x: viewport.x + viewport.width / 2,
    y: viewport.y + viewport.height / 2,
  };
  await page.mouse.move(center.x, center.y, { steps: 8 });
  await page.mouse.move(center.x + 30, center.y + 10, { steps: 8 });
  // The card would hide after the default 500ms hide timeout of a hovercard,
  // and no state shows that the timeout passed without it. A closing card stays
  // visible while it fades out, so the open state shows that it didn't start to
  // close.
  await page.waitForTimeout(600);
  await expect(card).toHaveAttribute("data-open");
});

test("site navigation card title links to the example on its page", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Breadcrumb").hover();
  const card = query(page).dialog("Breadcrumb");
  const title = query(card).link("Breadcrumb");
  // The title keeps the color of the heading, and underlines only on hover.
  await expect(title).toHaveCSS("text-decoration-line", "none");
  const href = await title.getAttribute("href");
  expect(href).toMatch(/^\/react\/recipes\/breadcrumb\/#./);
  const id = href?.split("#")[1] ?? "";
  await title.click();
  await expect(page).toHaveURL(new RegExp(`/react/recipes/breadcrumb/#${id}$`));
  // The gallery card of the example takes the id that the title links to.
  await expect(page.locator(`section[id="${id}"]`)).toHaveAccessibleName(
    "Breadcrumb",
  );
});

test("site navigation marks the link of the card while it shows", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  // The surface and the text of a link. The link transitions its colors, so the
  // look settles once the transitions that a state change starts end.
  const getLook = async (link: Locator) => {
    // A state change starts its transitions on the next style update.
    await flushFrames(page);
    return link.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations().map((animation) => animation.finished),
      );
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color };
    });
  };
  // The pointer moves from a link onto its card, and the link keeps the look of
  // a hovered link.
  const expectHoveredLook = async (link: Locator, name: string) => {
    await link.hover();
    const card = query(page).dialog(name);
    await expect(card).toBeVisible();
    const hovered = await getLook(link);
    await card.hover();
    expect(await getLook(link)).toEqual(hovered);
    return hovered;
  };
  const link = navigation.link("Breadcrumb");
  const idle = await getLook(link);
  expect(await expectHoveredLook(link, "Breadcrumb")).not.toEqual(idle);
  // The link of the current page has its own surface, which a hover keeps.
  await expectHoveredLook(navigation.link("Tabs"), "Tabs");
});

test("site navigation card moves to another link while it shows", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Breadcrumb").hover();
  await expect(getCard(page, "Breadcrumb")).toBeVisible();
  await navigation.link("Radio").hover();
  const card = getCard(page, "Radio");
  await expect(card).toBeVisible();
  await expect(getCard(page, "Breadcrumb")).toHaveCount(0);
  // The card keeps the examples of the previous link, hidden.
  await expect(card.locator("iframe:visible")).toHaveAttribute(
    "src",
    "/react/previews/radio/",
  );
});

test("site navigation card renders the examples of a link once the pointer rests on it", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  // The pointer rests on the link that opens the card for the show timeout, so
  // the card shows its examples at once.
  const opened = watchCard(page, "Breadcrumb");
  await navigation.link("Breadcrumb").hover();
  expect((await opened).frames).toBe(1);
  // A link that the pointer moves to shows its title over an empty frame, laid
  // out as its examples, until the pointer rests on it. A timer never fires
  // early, so the examples render no sooner than that.
  const moved = watchCard(page, "Radio");
  await navigation.link("Radio").hover();
  const radio = await moved;
  expect(radio.frames).toBe(0);
  expect(radio.delay).toBeGreaterThanOrEqual(SETTLE_DELAY - 20);
  expect(radio.before).not.toBeNull();
  expect(radio.after).toEqual(radio.before);
  // A link that the card keeps shows its examples at once.
  const kept = watchCard(page, "Breadcrumb");
  await navigation.link("Breadcrumb").hover();
  expect((await kept).frames).toBe(1);
});

test("site navigation card shows a single example without the carousel", async ({
  page,
}) => {
  const navigation = await gotoPage(page, "/react/components/separator/");
  const link = navigation.link("Separator");
  expect(await getCount(link)).toBe(1);
  await link.hover();
  const card = getCard(page, "Separator");
  await expect(card.locator("iframe")).toHaveAttribute(
    "src",
    "/react/previews/components/separator/",
  );
  await expect(query(card).region()).toHaveCount(0);
  await expect(query(card).button()).toHaveCount(0);
});

test("site navigation card doesn't open on focus", async ({ page }) => {
  const navigation = await gotoPage(page);
  await navigation.link("Breadcrumb").focus();
  // The card would open after the show timeout, and no state shows that the
  // timeout passed without it.
  await page.waitForTimeout(SHOW_TIMEOUT + 100);
  await expect(query(page).dialog()).toHaveCount(0);
});

test("site navigation card follows the link that a scroll brings under the pointer", async ({
  page,
}) => {
  // A short viewport makes the open group scroll its links.
  await page.setViewportSize({ width: 1280, height: 420 });
  const navigation = await gotoPage(page);
  const link = navigation.link("Breadcrumb");
  await link.hover();
  await expect(getCard(page, "Breadcrumb")).toBeVisible();
  const box = await link.boundingBox();
  if (!box) throw new Error("The link has no box");
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  // Chrome sends no mouse move after a scroll, so only the scroll can move the
  // card to the link that comes under the resting pointer.
  await page.mouse.wheel(0, box.height * 3);
  // The card shows the root example of the link under the pointer first, so its
  // preview page matches the link once the scroll ends.
  const getState = () =>
    page.evaluate(({ x, y }) => {
      const link = document.elementFromPoint(x, y)?.closest("a");
      // The card keeps the examples of the previous links, hidden.
      const frames = document.querySelectorAll("[role=dialog] iframe");
      const frame = [...frames].find((frame) => frame.checkVisibility());
      return {
        link: link?.getAttribute("href")?.replace("/recipes/", "/previews/"),
        frame: frame?.getAttribute("src"),
      };
    }, point);
  await expect
    .poll(async () => {
      const state = await getState();
      if (state.link === "/react/previews/breadcrumb/") return false;
      return !!state.link && state.link === state.frame;
    })
    .toBe(true);
});

test("site navigation card hides when its link is clicked", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  // The page of the link doesn't load, so the card stays in this page after the
  // click. Preventing the default action still runs the click handlers.
  await page.evaluate(() => {
    window.addEventListener("click", (event) => event.preventDefault());
  });
  const link = navigation.link("Breadcrumb");
  await link.hover();
  const card = getCard(page, "Breadcrumb");
  await expect(card).toHaveAttribute("data-open");
  await link.click();
  await expect(card).toBeHidden();
  // The pointer moves on the link that it clicked, which doesn't open the card
  // again. The card would open after the show timeout, and no state shows that
  // the timeout passed without it.
  await link.hover({ position: { x: 4, y: 4 } });
  await link.hover({ position: { x: 8, y: 8 } });
  await page.waitForTimeout(SHOW_TIMEOUT + 100);
  await expect(query(page).dialog()).toHaveCount(0);
  // Once the pointer leaves the link, the link opens the card again.
  await page.locator("main h1").hover();
  await link.hover();
  await expect(card).toHaveAttribute("data-open");
});
