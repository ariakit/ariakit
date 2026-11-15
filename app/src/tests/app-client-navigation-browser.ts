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
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// The client router moves the elements that stay with `moveBefore` where the
// browser has it, and Safari doesn't, so these tests run in every desktop
// browser. History and fragment navigation also differ between browsers.

const recipePath = "/react/recipes/avatar/";

// A client navigation fetches the next page and swaps it in, which can take as
// long as a page load. Page loads have no time limit of their own in this
// config, so the heading of the next page gets the time of the test.
function expectNextPage(heading: Locator) {
  return expect(heading).toBeVisible({ timeout: 0 });
}

test("site navigation stays across pages and marks the next page", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  // The landmark belongs to the page, and the island in it stays.
  const navigation = q.navigation("Site");
  const island = navigation.locator("astro-island");
  await expect(island).not.toHaveAttribute("ssr");
  // A property on the elements stays only while the page doesn't load again and
  // the island keeps its element. No visible state can show either.
  await page.evaluate(() => {
    Object.assign(window, { appTestPage: true });
  });
  await island.evaluate((element) => {
    Object.assign(element, { appTestElement: true });
  });
  await query(navigation)
    .link(/^Breadcrumb/)
    .click();
  await expectNextPage(q.heading("Breadcrumb", { level: 1 }));
  await expect(query(navigation).link(/^Breadcrumb/)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(query(navigation).link(/^Avatar/)).not.toHaveAttribute(
    "aria-current",
  );
  expect(await page.evaluate(() => "appTestPage" in window)).toBe(true);
  expect(await island.evaluate((element) => "appTestElement" in element)).toBe(
    true,
  );
});

test("Back after a link to a place on the page shows that page", async ({
  page,
  q,
}) => {
  // The test loads a page and makes two client navigations that fetch a page,
  // which can take the whole default budget on a slow runner, so it gets twice
  // the budget.
  test.setTimeout(test.info().timeout * 2);
  await gotoAndSettle(page, recipePath);
  const toc = q.navigation("On this page");
  await expect(toc.locator("astro-island")).not.toHaveAttribute("ssr");
  await query(toc).link("Photo with Initials Fallback").click();
  await expect(page).toHaveURL(/\/react\/recipes\/avatar\/#.+$/);
  const hashURL = page.url();
  await query(q.navigation("Site"))
    .link(/^Breadcrumb/)
    .click();
  await expectNextPage(q.heading("Breadcrumb", { level: 1 }));
  await page.goBack();
  await expect(page).toHaveURL(hashURL);
  await expectNextPage(q.heading("Avatar", { level: 1 }));
  await page.goBack();
  await expect(page).toHaveURL(/\/react\/recipes\/avatar\/$/);
  await expect(q.heading("Avatar", { level: 1 })).toBeVisible();
});

test("saved panel states apply before the next page shows", async ({
  page,
  q,
}) => {
  // A saved state that applies after the next page shows would animate the
  // panel and move the content on each navigation. So the state must be in
  // place when the router puts the next page in.
  await page.addInitScript(() => {
    localStorage.setItem("app-panel:app-navigation", "false");
    localStorage.setItem("app-panel:app-theme", "true");
    document.addEventListener("astro:after-swap", () => {
      const getState = (id: string) => {
        const panel = document.getElementById(id);
        const selector = `[data-shell-toggle][aria-controls="${id}"]`;
        const toggle = document.querySelector(selector);
        return {
          open: panel?.hasAttribute("data-open") ?? null,
          expanded: toggle?.getAttribute("aria-expanded") ?? null,
        };
      };
      const states = {
        navigation: getState("app-navigation"),
        theme: getState("app-theme"),
      };
      document.documentElement.dataset.swapPanelStates = JSON.stringify(states);
    });
  });
  await gotoAndSettle(page, recipePath);
  await query(q.navigation("Main")).link("Components").click();
  await expectNextPage(q.heading("Separator", { level: 1 }));
  await expect(q.button("Toggle navigation")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(q.navigation("Site")).not.toBeVisible();
  await expect(q.button("Close theme")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-swap-panel-states",
    JSON.stringify({
      navigation: { open: false, expanded: "false" },
      theme: { open: true, expanded: "true" },
    }),
  );
});
