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
import type { FrameLocator, Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";

const recipePath = "/react/recipes/app-shell/";

// Each load of the recipe page loads several App Shell previews and hydrates
// the preview cards near the viewport, which keeps a slow runner busy for
// seconds. A test that loads the page twice and changes the mode of the site
// and its previews can take the whole default budget on CI, so it gets twice
// the budget.
// https://github.com/ariakit/ariakit/issues/8009
function allowTwoPageLoads() {
  test.setTimeout(test.info().timeout * 2);
}

/**
 * Adds an output to the preview page in the frame that counts how often its
 * viewport resizes. The preview page reports no layout of its own, so this
 * shows how often it lays out at a new width.
 */
async function countFrameResizes(frame: FrameLocator) {
  await frame.locator("html").evaluate(() => {
    const counter = document.createElement("output");
    counter.id = "resize-count";
    counter.value = "0";
    document.body.append(counter);
    window.addEventListener("resize", () => {
      counter.value = String(Number(counter.value) + 1);
    });
  });
  return frame.locator("#resize-count");
}

/**
 * Returns how much narrower the preview page is than the card viewport around
 * the frame, which is 0 once the frame fills the card.
 */
async function getUnfilledFrameWidth(iframe: Locator) {
  const frameWidth = await iframe
    .contentFrame()
    .locator("html")
    .evaluate(() => window.innerWidth);
  const cardWidth = await iframe.evaluate(
    (element) => element.parentElement?.clientWidth,
  );
  if (cardWidth == null) return null;
  return cardWidth - frameWidth;
}

test("site navigation collapses and stays collapsed after reload", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const toggle = q.button("Toggle navigation");
  const navigation = q.navigation("Site");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(query(navigation).link("App Shell")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).not.toBeVisible();
  await page.reload();
  await expect(q.button("Toggle navigation")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(q.navigation("Site")).not.toBeVisible();
});

test("site navigation marks the page without a trailing slash", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath.replace(/\/$/, ""));
  await expect(query(q.navigation("Site")).link("App Shell")).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("site navigation marks the component on its API reference pages", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/components/separator/separator/");
  await expect(query(q.navigation("Site")).link("Separator")).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("site navigation describes each page with its example count", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const navigation = query(q.navigation("Site"));
  await expect(navigation.link("App Shell")).toHaveAccessibleDescription(
    /^\d+ examples$/,
  );
  await expect(navigation.link("Combobox Group")).toHaveAccessibleDescription(
    /^\d+ examples?$/,
  );
});

test("site navigation lists only the pages of the current section", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const recipeNavigation = query(q.navigation("Site"));
  await expect(recipeNavigation.link("App Shell")).toBeVisible();
  await expect(recipeNavigation.link("Separator")).toHaveCount(0);
  await gotoAndSettle(page, "/react/components/separator/");
  const componentNavigation = query(q.navigation("Site"));
  await expect(componentNavigation.link("Separator")).toBeVisible();
  await expect(componentNavigation.link("App Shell")).toHaveCount(0);
});

test("site navigation opens one group at a time", async ({ page, q }) => {
  await gotoAndSettle(page, "/react/components/getting-started/");
  const navigation = query(q.navigation("Site"));
  const components = navigation.button("Components");
  const guides = navigation.button("Guides");
  // The group of the current page starts open.
  await expect(guides).toHaveAttribute("aria-expanded", "true");
  await expect(components).toHaveAttribute("aria-expanded", "false");
  await expect(navigation.link("Getting Started")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(navigation.link("Separator")).not.toBeVisible();
  // Astro removes the ssr attribute once the island hydrates, and the buttons
  // ignore clicks before that.
  await expect(q.navigation("Site").locator("astro-island[ssr]")).toHaveCount(
    0,
  );
  await components.click();
  await expect(components).toHaveAttribute("aria-expanded", "true");
  await expect(guides).toHaveAttribute("aria-expanded", "false");
  await expect(navigation.link("Separator")).toBeVisible();
  await expect(navigation.link("Getting Started")).not.toBeVisible();
});

test("site navigation fills the sidebar with the open group", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/components/separator/");
  const sidebar = await q.navigation("Site").boundingBox();
  const guides = await query(q.navigation("Site"))
    .button("Guides")
    .boundingBox();
  expect(sidebar).not.toBeNull();
  expect(guides).not.toBeNull();
  if (!sidebar || !guides) return;
  // The open Components group pushes the closed Guides group to the bottom.
  expect(guides.y + guides.height).toBeCloseTo(sidebar.y + sidebar.height, -1);
});

test("site navigation centers the current page bar before its row", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const sidebar = q.navigation("Site");
  const row = query(sidebar).link("App Shell");
  // The bar is a decorative, hidden element, so only its box can be queried.
  const bar = row.locator(".control-bar");
  const getOffsets = async () => {
    const [sidebarBox, rowBox, barBox] = await Promise.all([
      sidebar.boundingBox(),
      row.boundingBox(),
      bar.boundingBox(),
    ]);
    if (!sidebarBox || !rowBox || !barBox) return null;
    const gapCenter = (rowBox.x - sidebarBox.x) / 2;
    const barCenter = barBox.x + barBox.width / 2 - sidebarBox.x;
    return Math.abs(barCenter - gapCenter);
  };
  await expect.poll(getOffsets).toBeLessThan(0.5);
});

test("home page renders without the site navigation", async ({ page, q }) => {
  await gotoAndSettle(page, "/");
  await expect(q.heading("Ariakit")).toBeVisible();
  await expect(q.navigation("Site")).toHaveCount(0);
  await expect(q.button("Toggle navigation")).toHaveCount(0);
});

test("collection pages list entries without the site navigation", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/");
  await expect(q.heading("Recipes")).toBeVisible();
  await expect(q.navigation("Site")).toHaveCount(0);
  await expect(q.button("Toggle navigation")).toHaveCount(0);
  await expect(q.link("App Shell")).toHaveAccessibleDescription(
    /^\d+ examples$/,
  );
});

test("theme panel applies a mode to the site and its previews", async ({
  page,
  q,
}) => {
  allowTwoPageLoads();
  await gotoAndSettle(page, recipePath);
  const root = page.locator("html");
  const preview = page
    .frameLocator('iframe[title="App Shell"]')
    .first()
    .locator("html");
  await q.button("Theme", { exact: true }).click();
  const theme = query(q.complementary("Theme"));
  const mode = query(q.radiogroup("Mode"));
  await expect(mode.radio("System")).toHaveAttribute("aria-checked", "true");
  await mode.radio("Dark").click();
  await expect(mode.radio("Dark")).toHaveAttribute("aria-checked", "true");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(preview).toHaveAttribute("data-theme", "dark");
  // The options form a radio group, so arrow keys move focus between them.
  await page.keyboard.press("ArrowLeft");
  await expect(mode.radio("Light")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(mode.radio("Light")).toHaveAttribute("aria-checked", "true");
  await expect(root).toHaveAttribute("data-theme", "light");
  await theme.button("Close theme").click();
  await expect(q.complementary("Theme")).not.toBeVisible();
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(preview).toHaveAttribute("data-theme", "light");
  await q.button("Theme", { exact: true }).click();
  await theme.button("Reset").click();
  await expect(mode.radio("System")).toHaveAttribute("aria-checked", "true");
  await expect(root).not.toHaveAttribute("data-theme");
  await expect(preview).not.toHaveAttribute("data-theme");
});

test("theme panel tints the canvas of the site and its previews", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const root = page.locator("html");
  const preview = page
    .frameLocator('iframe[title="App Shell"]')
    .first()
    .locator("html");
  const getCanvas = () =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await q.button("Theme", { exact: true }).click();
  const canvas = query(q.radiogroup("Canvas"));
  const mode = query(q.radiogroup("Mode"));
  await mode.radio("Light").click();
  const lightDefault = await getCanvas();
  await canvas.radio("Warm").click();
  await expect(root).toHaveAttribute("data-canvas", "warm");
  await expect(preview).toHaveAttribute("data-canvas", "warm");
  await expect.poll(getCanvas).not.toBe(lightDefault);
  // Each canvas has a dark variant, so the tint follows the mode.
  const lightWarm = await getCanvas();
  await mode.radio("Dark").click();
  await expect.poll(getCanvas).not.toBe(lightWarm);
  const darkWarm = await getCanvas();
  await canvas.radio("Default").click();
  await expect(root).not.toHaveAttribute("data-canvas");
  await expect.poll(getCanvas).not.toBe(darkWarm);
  await query(q.complementary("Theme")).button("Reset").click();
});

test("theme panel follows choices from another tab", async ({
  context,
  page,
  q,
}) => {
  allowTwoPageLoads();
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  const mode = query(q.radiogroup("Mode"));
  await expect(mode.radio("System")).toHaveAttribute("aria-checked", "true");
  const otherPage = await context.newPage();
  await gotoAndSettle(otherPage, recipePath);
  const other = query(otherPage);
  // The other tab restores the open panel from storage.
  await expect(other.complementary("Theme")).toBeVisible();
  await query(other.radiogroup("Mode")).radio("Dark").click();
  await expect(mode.radio("Dark")).toHaveAttribute("aria-checked", "true");
  await query(other.complementary("Theme")).button("Reset").click();
  await expect(mode.radio("System")).toHaveAttribute("aria-checked", "true");
});

test("theme panel moves focus to Close theme and back when it closes", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const themeButton = q.button("Theme", { exact: true });
  const closeButton = query(q.complementary("Theme")).button("Close theme");
  await themeButton.click();
  await expect(closeButton).toBeFocused();
  await closeButton.press("Enter");
  await expect(q.complementary("Theme")).not.toBeVisible();
  await expect(themeButton).toBeFocused();
});

test("theme panel keeps focus on the page when it opens on load", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  await expect(q.complementary("Theme")).toBeVisible();
  // The reload restores the open panel. The layout script runs before the load
  // event, so focus has its final place when the reload resolves.
  await page.reload();
  await expect(q.complementary("Theme")).toBeVisible();
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).toBe("BODY");
});

test("theme panel applies a mode when storage is blocked", async ({
  page,
  q,
}) => {
  // Browsers throw on storage access when the user blocks site data.
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage is blocked", "SecurityError");
      },
    });
  });
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  const mode = query(q.radiogroup("Mode"));
  await mode.radio("Dark").click();
  await expect(mode.radio("Dark")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("theme panel applies a mode after storage recovers", async ({
  page,
  q,
}) => {
  // Storage can reject a write once, for example when it is over its quota.
  await page.addInitScript(() => {
    // oxlint-disable-next-line typescript/unbound-method -- called with the storage as the receiver
    const setItem = Storage.prototype.setItem;
    let failed = false;
    Storage.prototype.setItem = function (key, value) {
      if (!failed && key.startsWith("app-theme:")) {
        failed = true;
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      setItem.call(this, key, value);
    };
  });
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  const mode = query(q.radiogroup("Mode"));
  await mode.radio("Dark").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await mode.radio("Light").click();
  await expect(mode.radio("Light")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("theme panel keeps the accent and its color together after a failed write", async ({
  page,
  q,
}) => {
  // Storage can reject a write once, for example when it is over its quota.
  await page.addInitScript(() => {
    // oxlint-disable-next-line typescript/unbound-method -- called with the storage as the receiver
    const setItem = Storage.prototype.setItem;
    let failed = false;
    Storage.prototype.setItem = function (key, value) {
      if (!failed && key.startsWith("app-theme:")) {
        failed = true;
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      setItem.call(this, key, value);
    };
  });
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  const accent = query(q.radiogroup("Accent"));
  await accent.radio("Violet").click();
  await expect(accent.radio("Violet")).toHaveAttribute("aria-checked", "true");
  const root = page.locator("html");
  const getBrand = () =>
    root.evaluate((node) => node.style.getPropertyValue("--color-brand"));
  await expect.poll(getBrand).not.toBe("");
  // The choice did not persist, so a reload shows the default accent with the
  // default color instead of the default accent with the new color.
  await page.reload();
  await expect(accent.radio("Blue")).toHaveAttribute("aria-checked", "true");
  await expect.poll(getBrand).toBe("");
});

test("theme panel follows another tab after a failed write", async ({
  context,
  page,
  q,
}) => {
  allowTwoPageLoads();
  await page.addInitScript(() => {
    // oxlint-disable-next-line typescript/unbound-method -- called with the storage as the receiver
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("app-theme:")) {
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      setItem.call(this, key, value);
    };
  });
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  const mode = query(q.radiogroup("Mode"));
  await mode.radio("Dark").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const otherPage = await context.newPage();
  await gotoAndSettle(otherPage, recipePath);
  const other = query(otherPage);
  await expect(other.complementary("Theme")).toBeVisible();
  await query(other.radiogroup("Mode")).radio("Light").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(mode.radio("Light")).toHaveAttribute("aria-checked", "true");
  await query(other.complementary("Theme")).button("Reset").click();
});

test("theme button keeps its name when the panel narrows the page", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 800, height: 800 });
  await gotoAndSettle(page, recipePath);
  await q.button("Theme", { exact: true }).click();
  await expect(q.complementary("Theme")).toBeVisible();
  // The panel opens with a width transition, so the label hides only after it
  // ends. The reload restores the open panel without the transition.
  await page.reload();
  await expect(q.complementary("Theme")).toBeVisible();
  // The open panel narrows the inner shell, which hides the visible label.
  await expect(q.button("Theme", { exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("phone menu opens a navigation drawer", async ({ page, q }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, recipePath);
  await expect(q.navigation("Site")).not.toBeVisible();
  const menuButton = q.button("Open menu");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  const menu = query(q.navigation("Menu"));
  // A visible link can still be clipped to nothing by its disclosure content.
  await expect(menu.link("Combobox Group")).toBeInViewport();
  await menu.button("Close menu").click();
  await expect(q.navigation("Menu")).not.toBeVisible();
});

test("phone menu marks only the page entry on a recipe page", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, recipePath);
  await q.button("Open menu").click();
  const menu = q.navigation("Menu");
  await expect(query(menu).link("App Shell")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(query(menu).link("Recipes")).not.toHaveAttribute("aria-current");
  await expect(menu.locator('[aria-current="page"]')).toHaveCount(1);
});

test("phone menu moves focus and closes with Escape", async ({ page, q }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, recipePath);
  const menuButton = q.button("Open menu");
  await menuButton.click();
  await expect(q.button("Close menu")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(q.navigation("Menu")).not.toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton).toBeFocused();
  await menuButton.click();
  await q.button("Close menu").click();
  await expect(menuButton).toBeFocused();
});

test("phone menu holds the theme options", async ({ page, q }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, recipePath);
  // The full-height theme panel would leave no room for the page on phones.
  await expect(q.button("Theme", { exact: true })).not.toBeVisible();
  await q.button("Open menu").click();
  const mode = query(q.navigation("Menu")).radiogroup("Mode");
  await query(mode).radio("Dark").click();
  await expect(query(mode).radio("Dark")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await query(mode).radio("System").click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
});

test("site sidebars hold one navigation landmark each", async ({ page, q }) => {
  await gotoAndSettle(page, recipePath);
  // Astro renders the sidebars, and their rows hydrate as separate islands, so
  // the Nav and the Toc in them opt out of their own landmarks.
  const site = query(q.navigation("Site"));
  await expect(site.link("App Shell")).toBeVisible();
  await expect(site.navigation()).toHaveCount(0);
  const toc = query(q.navigation("On this page"));
  await expect(toc.link("Overview")).toBeVisible();
  await expect(toc.navigation()).toHaveCount(0);
});

test("table of contents marks the section in view", async ({ page, q }) => {
  await gotoAndSettle(page, recipePath);
  const toc = query(q.navigation("On this page"));
  // The table of contents marks the current section after its island hydrates.
  const island = q.navigation("On this page").locator("astro-island");
  await expect(island).not.toHaveAttribute("ssr");
  // The page title is current before the examples heading reaches the top.
  const title = q.navigation("On this page").locator('a[href="#top"]');
  await expect(title).toHaveText("App Shell");
  await expect(title).toHaveAttribute("aria-current", "location");
  await expect(toc.link("Overview")).not.toHaveAttribute("aria-current");
  // The sections after the gallery are too short to reach the top. At the end
  // of the page, the activation line has slid down past the last heading.
  await toc.link("Components").click();
  await expect(toc.link("Components")).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(toc.link("Overview")).not.toHaveAttribute("aria-current");
  // A click on the earlier section also scrolls to the end, so the current
  // section follows the scroll and stays the last one.
  await toc.link("Overview").click();
  await expect(toc.link("Components")).toHaveAttribute(
    "aria-current",
    "location",
  );
  // Scrolling up from the end slides the line back up, past the earlier
  // heading.
  await expect
    .poll(
      async () => {
        await page.mouse.wheel(0, -40);
        return toc.link("Overview").getAttribute("aria-current");
      },
      { intervals: [50] },
    )
    .toBe("location");
  await expect(toc.link("Components")).not.toHaveAttribute("aria-current");
});

test("table of contents keeps the page content in place while the page loads", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // Without motion, the shell changes the layout at once, so the counts below
  // show only where the content lands. A parse that pauses inside a sidebar can
  // also start its open transition, which this test doesn't cover.
  await page.emulateMedia({ reducedMotion: "reduce" });
  // A slow download lets the browser paint the page before it parses the end of
  // the document, as on a real network.
  const session = await page.context().newCDPSession(page);
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 50,
    downloadThroughput: 1_000_000,
    uploadThroughput: 1_000_000,
  });
  // Counts the distinct title positions, first preview card widths, and
  // positions of the visible table of contents on the frames from the first
  // paint.
  await page.addInitScript(() => {
    const titleXs = new Set<number>();
    const cardWidths = new Set<number>();
    const tocYs = new Set<number>();
    const counter = document.createElement("output");
    counter.id = "layout-count";
    counter.hidden = true;
    const record = () => {
      const title = document.querySelector("main h1");
      const card = document.querySelector("[data-preview-card]");
      const toc = document.querySelector('[aria-label="On this page"]');
      if (title) {
        titleXs.add(title.getBoundingClientRect().x);
      }
      if (card) {
        cardWidths.add(card.getBoundingClientRect().width);
      }
      if (toc?.checkVisibility({ visibilityProperty: true })) {
        tocYs.add(toc.getBoundingClientRect().y + window.scrollY);
      }
      counter.value = `${titleXs.size} ${cardWidths.size} ${tocYs.size}`;
      if (document.body && !counter.isConnected) {
        document.body.append(counter);
      }
      requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });
  // The page content shifts during the download, so the test needs no more.
  await page.goto("/react/recipes/text-field/", { waitUntil: "commit" });
  await expect(q.navigation("On this page")).toBeVisible();
  // A table of contents that arrives after the content narrows it in the frame
  // that renders the table, which the counter records on the next frame.
  await flushFrames(page);
  await expect(page.locator("#layout-count")).toHaveText("1 1 1");
});

test("table of contents lists the gallery examples", async ({ page, q }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await gotoAndSettle(page, "/react/recipes/tooltip/");
  const toc = query(q.navigation("On this page"));
  const island = q.navigation("On this page").locator("astro-island");
  await expect(island).not.toHaveAttribute("ssr");
  // The examples heading is hidden in the page, and the card titles are
  // headings under it, with the same links as the other headings.
  await expect(q.heading("Examples", { level: 2 })).toHaveClass(/sr-only/);
  const cardTitle = query(q.region("Keyboard Shortcuts")).heading(
    "Keyboard Shortcuts",
    { level: 3 },
  );
  await expect(query(cardTitle).link("Keyboard Shortcuts")).toHaveAttribute(
    "href",
    "#shortcuts",
  );
  // The card titles nest under the examples link, and the other headings follow
  // it.
  const examples = query(
    toc.listitem().filter({ has: q.link("Examples", { exact: true }) }),
  );
  await expect(examples.link("Keyboard Shortcuts")).toBeVisible();
  await expect(examples.link("Overview")).toHaveCount(0);

  await query(cardTitle).link("Keyboard Shortcuts").click();
  await expect(page).toHaveURL(/#shortcuts$/);
  await expect(toc.link("Keyboard Shortcuts")).toHaveAttribute(
    "aria-current",
    "location",
  );
  // Cards side by side share a row, so their titles reach the top together. The
  // one that a link scrolled to is current.
  await toc.link("Truncated Text").click();
  await expect(toc.link("Truncated Text")).toHaveAttribute(
    "aria-current",
    "location",
  );
  // The link moves focus to the card, as a click on it does, so its preview
  // scrolls.
  const getCard = (title: string) =>
    q.region(title, { exact: true }).locator("[data-preview-card]");
  await expect(getCard("Truncated Text")).toBeFocused();
  // Scrolling on starts from the clicked card, without going back to the first
  // card of its row. The pointer stays over the header, since the focused card
  // would take the wheel.
  const current = q.navigation("On this page").locator("[aria-current]");
  const visited = new Set<string | null>();
  await page.mouse.move(1100, 24);
  await expect
    .poll(
      async () => {
        await page.mouse.wheel(0, 20);
        const text = await current.textContent();
        visited.add(text);
        return text;
      },
      { intervals: [50] },
    )
    .toBe("Collapsed Sidebar");
  expect([...visited]).toEqual(["Truncated Text", "Collapsed Sidebar"]);
  await toc.link("Disabled Action").click();
  await expect(toc.link("Disabled Action")).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(toc.link("Truncated Text")).not.toHaveAttribute("aria-current");
  // A preview frame becomes active too, and a card far below takes focus before
  // it hydrates, and then becomes active.
  await q.navigation("On this page").locator('a[href="#tooltip"]').click();
  await expect(getCard("Tooltip")).toBeFocused();
  await expect(
    page.locator('iframe[title="Tooltip"]').contentFrame().locator("html"),
  ).toHaveAttribute("data-preview-active", "");
  await toc.link("Placements").click();
  await expect(getCard("Placements")).toBeFocused();
  await expect(
    q.region("Placements", { exact: true }).locator("astro-island").first(),
  ).not.toHaveAttribute("ssr");

  // The examples link scrolls to the top of the gallery.
  await toc.link("Examples", { exact: true }).click();
  await expect(toc.link("Examples", { exact: true })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(q.region("Tooltip", { exact: true })).toBeInViewport();
  await expect(q.heading("Tooltip", { level: 1 })).not.toBeInViewport();

  // The page title links to the top of the page.
  const title = q.navigation("On this page").locator('a[href="#top"]');
  await title.click();
  await expect(title).toHaveAttribute("aria-current", "location");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("table of contents marks a shorter card in a gallery row", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await gotoAndSettle(page, "/react/recipes/text-field/");
  const toc = query(q.navigation("On this page"));
  const island = q.navigation("On this page").locator("astro-island");
  await expect(island).not.toHaveAttribute("ssr");
  // The Password Visibility Toggle card is shorter than the other card in its
  // row, so it sticks below the headers while the row scrolls. Its title would
  // stay below the place where the link scrolls to, but the link goes to the
  // card section, which shares the top of the row.
  await toc.link("Password Visibility Toggle").click();
  await expect(toc.link("Password Visibility Toggle")).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(
    q.region("Password Visibility Toggle", { exact: true }),
  ).toBeInViewport();
});

test("app shells in preview cards keep corners concentric with the card", async ({
  page,
  q,
}) => {
  // The toggle button in the frame corner shows only at wide shell widths.
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, recipePath);
  const iframe = page.locator('iframe[title="App Shell"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-hydrated",
    "",
  );
  const handle = query(q.region("App Shell", { exact: true })).separator(
    "Resize preview",
  );
  const viewportId = await handle.getAttribute("aria-controls");
  const viewport = page.locator(`[id="${viewportId}"]`);
  // The button sits in the top-left corner of the frame. Its radius plus its
  // inset is the radius of a concentric outer corner.
  const button = query(frame).button("Toggle navigation");
  const getViewportRadius = () =>
    viewport.evaluate((element) => {
      const style = getComputedStyle(element);
      const radius = Number.parseFloat(style.borderTopLeftRadius);
      return radius - Number.parseFloat(style.borderTopWidth);
    });
  const getButtonOuterRadius = () =>
    button.evaluate((element) => {
      const radius = getComputedStyle(element).borderTopLeftRadius;
      return Number.parseFloat(radius) + element.getBoundingClientRect().left;
    });

  const radius = await getViewportRadius();
  await expect.poll(getButtonOuterRadius).toBeCloseTo(radius, 1);

  // A larger theme radius rounds both the card and the frame content.
  await q.button("Theme", { exact: true }).click();
  const theme = query(q.complementary("Theme"));
  await query(q.radiogroup("Radius")).radio("Round").click();
  // The open panel narrows the page, which hides the button in the frame.
  await theme.button("Close theme").click();
  await expect(button).toBeVisible();
  await expect.poll(getViewportRadius).toBeGreaterThan(radius);
  const roundRadius = await getViewportRadius();
  await expect.poll(getButtonOuterRadius).toBeCloseTo(roundRadius, 1);
});

test("site navigation folds without resizing offscreen preview pages", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, recipePath);
  // Chrome loads lazy frames this close to the viewport, but the card stays
  // offscreen.
  const iframe = page.locator('iframe[title="Dashboard"]');
  const frame = iframe.contentFrame();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-hydrated",
    "",
  );
  await expect(iframe).not.toBeInViewport();
  const resizeCount = await countFrameResizes(frame);

  const toggle = q.button("Toggle navigation");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  // The navigation panel hides when the sidebar fold ends.
  await expect(q.navigation("Site")).not.toBeVisible();
  // The offscreen preview page keeps its width, so it does not lay out again on
  // each step of the fold.
  await expect(resizeCount).toHaveText("0");

  await iframe.scrollIntoViewIfNeeded();
  // The preview page fills the card again.
  const getUnfilledWidth = () => getUnfilledFrameWidth(iframe);
  await expect.poll(getUnfilledWidth).toBe(0);
  await expect(resizeCount).toHaveText("1");
  // The card measures its wider stage again, so its resize handle allows the
  // full width that the visible card already reported during the fold.
  const getHandle = (title: string) =>
    query(q.region(title, { exact: true })).separator("Resize preview");
  const fullWidth = await getHandle("App Shell").getAttribute("aria-valuemax");
  await expect(getHandle("Dashboard")).toHaveAttribute(
    "aria-valuemax",
    fullWidth ?? "",
  );
});

test("site navigation folds without resizing visible preview pages on each step", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, recipePath);
  const iframe = page.locator('iframe[title="App Shell"]');
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-hydrated",
    "",
  );
  const resizeCount = await countFrameResizes(frame);
  const getUnfilledWidth = () => getUnfilledFrameWidth(iframe);
  await expect.poll(getUnfilledWidth).toBe(0);

  const toggle = q.button("Toggle navigation");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  // The navigation panel hides when the sidebar fold ends.
  await expect(q.navigation("Site")).not.toBeVisible();
  // The preview page keeps its width during the fold, and then fills the wider
  // card with one layout.
  await expect.poll(getUnfilledWidth).toBe(0);
  await expect(resizeCount).toHaveText("1");
});
