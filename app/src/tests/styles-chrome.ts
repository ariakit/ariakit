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

test("the main navigation lists Styles after Components", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/tailwind/styles/ak-layer/");
  const main = query(q.navigation("Main"));
  const labels = await main.link().allTextContents();
  expect(labels.map((label) => label.trim())).toEqual([
    "Components",
    "Styles",
    "Recipes",
  ]);
  // The section has no page of its own, so it links to its first guide.
  await expect(main.link("Styles")).toHaveAttribute(
    "href",
    "/tailwind/styles/getting-started/",
  );
  await expect(main.link("Styles")).toHaveAttribute("aria-current", "page");
});

test("the site navigation opens the group of the Styles page", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/tailwind/styles/getting-started/");
  const navigation = query(q.navigation("Site"));
  await expect(navigation.button("Guides")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(navigation.button("Utilities")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(navigation.link("Getting started")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await navigation.button("Utilities").click();
  await navigation.link("ak-layer").click();
  await expect(page).toHaveURL(/\/tailwind\/styles\/ak-layer\/$/);
  const utilities = query(q.navigation("Site"));
  await expect(utilities.button("Utilities")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(utilities.link("ak-layer")).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("an html preview fence renders its markup next to its code", async ({
  page,
}) => {
  await gotoAndSettle(page, "/tailwind/styles/ak-layer/");
  const card = page.locator("[data-example-card]").first();
  const stage = card.locator("[data-example-stage]");
  const live = stage.getByText("Border from ak-layer", { exact: true });
  await expect(live).toBeVisible();
  // Preflight gives every element a solid zero-width border, so only the width
  // shows that Tailwind generated the ak-frame-border class of the fence.
  await expect(live).toHaveCSS("border-top-width", "1px");
  await expect(card.locator("pre")).toContainText(
    '<div class="ak-layer ak-frame ak-frame-border">Border from ak-layer</div>',
  );
});

test("the setup prompt copies its text", async ({ context, page, q }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await gotoAndSettle(page, "/tailwind/styles/getting-started/");
  // Astro removes the ssr attribute of an island once it hydrates. The page
  // shows no other sign that the button can copy.
  await expect(
    page.locator("astro-island:not([ssr]) [data-agent-prompt]"),
  ).toHaveCount(1);
  const prompt = query(q.region("Prompt for your agent"));
  await prompt.button("Copy prompt").click();
  await expect(prompt.button("Copied")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^Set up Ariakit Tailwind in this project\./);
  // The copied text keeps the indentation of the prompt source.
  expect(copied).toContain(
    '\n   @import "tailwindcss";\n   @import "@ariakit/tailwind";\n',
  );
});
