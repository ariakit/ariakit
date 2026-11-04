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

type Query = ReturnType<typeof query>;

// The tabs gallery has a Next.js example, whose card shows browser chrome.
const recipePath = "/react/recipes/tabs/";

function getThemePanel(q: Query) {
  return q.complementary("Theme");
}

function getToc(q: Query) {
  return q.navigation("On this page");
}

// At 1440px, the open theme panel leaves no room for the table of contents. The
// folds change the width of the gallery cards on each step, and Chrome lays out
// the nested grids of the shell around each card. A size container query in the
// browser chrome of a card took over a second for each step.
// https://issues.chromium.org/issues/578117951
test("open the theme panel on a page with a browser preview card", async ({
  page,
  perf,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndSettle(page, recipePath);
  await perf.measure(
    async ({ q }) => {
      await q.button("Theme").click();
      // The panel column reaches its width, and the table of contents leaves
      // the accessibility tree, when the folds end.
      await expect(getThemePanel(q).locator("..")).toHaveCSS("width", "320px");
      await expect(getToc(q)).toBeHidden();
    },
    {
      setup: async ({ page, q }) => {
        // Iteration pages load at the viewport of the perf project, and preview
        // frames keep their width through a resize, so the page loads again.
        await page.setViewportSize({ width: 1440, height: 900 });
        await gotoAndSettle(page, recipePath);
        const card = query(q.region("Tabs with the Next.js App Router"));
        await expect(card.textbox("Address")).toBeAttached();
        await expect(getToc(q)).toBeVisible();
      },
      verify: async ({ q }) => {
        const toggle = q.button("Theme");
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
      },
    },
  );
});
