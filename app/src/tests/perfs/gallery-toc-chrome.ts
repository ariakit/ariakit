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
import { expectTocThumbStill } from "#app/test-utils/toc.ts";

type Query = ReturnType<typeof query>;

const recipePath = "/react/recipes/tooltip/";

// The first example of each gallery row at 1600px, which becomes the current
// link, and then the first section after the gallery. Each step moves the rows
// on screen, so the thumb glides again.
const steps = [
  { id: "disabled", link: "Disabled Action" },
  { id: "sidebar", link: "Collapsed Sidebar" },
  { id: "copy", link: "Copy Feedback" },
  { id: "time", link: "Exact Timestamp" },
  { id: "appearance", link: "Colors and Shapes" },
  { id: "overview", link: "Overview" },
];

function getNav(q: Query) {
  return q.navigation("On this page");
}

// https://github.com/ariakit/ariakit/issues/8141
test("scroll through the gallery of a recipe page", async ({ page, perf }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await gotoAndSettle(page, recipePath);
  await perf.measure(
    async ({ page, q }) => {
      for (const step of steps) {
        await page.evaluate((id) => {
          document.getElementById(id)?.scrollIntoView({ block: "start" });
        }, step.id);
        const link = query(getNav(q)).link(step.link);
        await expect(link).toHaveAttribute("aria-current", "location");
        await expectTocThumbStill(page, getNav(q));
      }
    },
    {
      setup: async ({ page, q }) => {
        await page.setViewportSize({ width: 1600, height: 1000 });
        // The table of contents is an island, which marks a current link once
        // it hydrates.
        await expect(getNav(q).locator("[aria-current]")).toHaveCount(1);
        await expectTocThumbStill(page, getNav(q));
      },
      verify: async ({ q }) => {
        const link = query(getNav(q)).link("Overview");
        await expect(link).toHaveAttribute("aria-current", "location");
      },
    },
  );
});
