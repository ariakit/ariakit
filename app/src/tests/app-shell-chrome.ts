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
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

const examplePath = "/react/examples/app-shell/";

test("site navigation collapses and stays collapsed after reload", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath.replace(/\/$/, ""));
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
  const exampleNavigation = query(q.navigation("Site"));
  await expect(exampleNavigation.link("App Shell")).toBeVisible();
  await expect(exampleNavigation.link("Separator")).toHaveCount(0);
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
  await gotoAndSettle(page, examplePath);
  const sidebar = q.navigation("Site");
  // The bar is a decorative, hidden glider, so only its box can be queried.
  const bar = sidebar.locator(".nav > .glider");
  const getOffsets = async () => {
    const [sidebarBox, rowBox, barBox] = await Promise.all([
      sidebar.boundingBox(),
      query(sidebar).link("App Shell").boundingBox(),
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
  await gotoAndSettle(page, "/react/examples/");
  await expect(q.heading("Examples")).toBeVisible();
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
  await q.button("Theme", { exact: true }).click();
  const mode = query(q.radiogroup("Mode"));
  await expect(mode.radio("System")).toHaveAttribute("aria-checked", "true");
  const otherPage = await context.newPage();
  await gotoAndSettle(otherPage, examplePath);
  const other = query(otherPage);
  // The other tab restores the open panel from storage.
  await expect(other.complementary("Theme")).toBeVisible();
  await query(other.radiogroup("Mode")).radio("Dark").click();
  await expect(mode.radio("Dark")).toHaveAttribute("aria-checked", "true");
  await query(other.complementary("Theme")).button("Reset").click();
  await expect(mode.radio("System")).toHaveAttribute("aria-checked", "true");
});

test("theme panel returns focus to the Theme button when it closes", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, examplePath);
  const themeButton = q.button("Theme", { exact: true });
  await themeButton.click();
  await query(q.complementary("Theme")).button("Close theme").press("Enter");
  await expect(q.complementary("Theme")).not.toBeVisible();
  await expect(themeButton).toBeFocused();
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
  await q.button("Theme", { exact: true }).click();
  const mode = query(q.radiogroup("Mode"));
  await mode.radio("Dark").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const otherPage = await context.newPage();
  await gotoAndSettle(otherPage, examplePath);
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
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
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

test("phone menu marks only the page entry on an example page", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, examplePath);
  await q.button("Open menu").click();
  const menu = q.navigation("Menu");
  await expect(query(menu).link("App Shell")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(query(menu).link("Examples")).not.toHaveAttribute(
    "aria-current",
  );
  await expect(menu.locator('[aria-current="page"]')).toHaveCount(1);
});

test("phone menu moves focus and closes with Escape", async ({ page, q }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
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

test("table of contents marks the section in view", async ({ page, q }) => {
  await gotoAndSettle(page, examplePath);
  const toc = query(q.navigation("On this page"));
  // The gallery comes before the first heading, so no section is current yet.
  await expect(toc.link("Overview")).not.toHaveAttribute("aria-current");
  await toc.link("Overview").click();
  await expect(toc.link("Overview")).toHaveAttribute(
    "aria-current",
    "location",
  );
  // The last section is too short to reach the top, so the end of the page
  // marks it.
  await toc.link("Components").click();
  await expect(toc.link("Components")).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(toc.link("Overview")).not.toHaveAttribute("aria-current");
});

test("app shells in preview cards keep corners concentric with the card", async ({
  page,
  q,
}) => {
  // The toggle button in the frame corner shows only at wide shell widths.
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoAndSettle(page, examplePath);
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
  await gotoAndSettle(page, examplePath);
  // Chrome loads lazy frames this close to the viewport, but the card stays
  // offscreen, so only the page load can hydrate it.
  const iframe = page.locator('iframe[title="Dashboard"]');
  const frame = iframe.contentFrame();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-preview-hydrated",
    "",
  );
  await expect(iframe).not.toBeInViewport();
  // The hydrated card keeps its offscreen frame at a fixed width.
  await expect(iframe).toHaveAttribute("style", /(^|;\s*)width:/);
  // The preview page reports no layout of its own, so it shows how often its
  // viewport resizes.
  await frame.locator("html").evaluate(() => {
    const counter = document.createElement("output");
    counter.id = "resize-count";
    counter.value = "0";
    document.body.append(counter);
    window.addEventListener("resize", () => {
      counter.value = String(Number(counter.value) + 1);
    });
  });
  const resizeCount = frame.locator("#resize-count");

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
  const getUnfilledWidth = async () => {
    const frameWidth = await frame
      .locator("html")
      .evaluate(() => window.innerWidth);
    const cardWidth = await iframe.evaluate(
      (element) => element.parentElement?.clientWidth,
    );
    if (cardWidth == null) return null;
    return cardWidth - frameWidth;
  };
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
