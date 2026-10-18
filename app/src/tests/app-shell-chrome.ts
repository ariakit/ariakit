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
  await expect(menu.link("Combobox Group")).toBeVisible();
  await menu.button("Close menu").click();
  await expect(q.navigation("Menu")).not.toBeVisible();
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
