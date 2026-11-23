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

test("the site navigation shows the Styles groups without disclosures", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/tailwind/styles/getting-started/");
  const navigation = query(q.navigation("Site"));
  await expect(navigation.button()).toHaveCount(0);
  const guides = query(navigation.group("Guides"));
  const utilities = query(navigation.group("Utilities"));
  await expect(guides.link("Getting started")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(utilities.link("ak-layer")).toBeVisible();
  const sidebar = await q.navigation("Site").boundingBox();
  const link = await utilities.link("ak-layer").boundingBox();
  expect(sidebar).not.toBeNull();
  expect(link).not.toBeNull();
  if (!sidebar || !link) return;
  // The links span the sidebar, so the space on each side of a link is the
  // padding of the sidebar body.
  const startSpace = link.x - sidebar.x;
  const endSpace = sidebar.x + sidebar.width - (link.x + link.width);
  expect(endSpace).toBeCloseTo(startSpace, -1);
  await utilities.link("ak-layer").click();
  await expect(page).toHaveURL(/\/tailwind\/styles\/ak-layer\/$/);
  await expect(utilities.link("ak-layer")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(guides.link("Getting started")).not.toHaveAttribute(
    "aria-current",
  );
});

test("the phone menu shows the Styles groups without disclosures", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndSettle(page, "/tailwind/styles/ak-layer/");
  await q.button("Open menu").click();
  const menu = query(q.navigation("Menu"));
  // The only button in the menu closes it.
  await expect(menu.button()).toHaveCount(1);
  await expect(menu.button("Close menu")).toBeVisible();
  await expect(
    query(menu.group("Guides")).link("Getting started"),
  ).toBeInViewport();
  await expect(query(menu.group("Utilities")).link("ak-layer")).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("an html preview fence renders its markup with its code", async ({
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
  // Tailwind scans the markup of the fence in a generated source, not the text
  // of the page. Only the fence names the ring utility of its second element,
  // and this file must not name it, because Tailwind scans this file too.
  const ring = stage.getByText("Ring from ak-layer", { exact: true });
  await expect(ring).not.toHaveCSS("box-shadow", "none");
  // The fence keeps its code, which renders as a code block in the card.
  await expect(card.locator("pre")).toContainText(
    '<div class="ak-layer ak-frame ak-frame-border">Border from ak-layer</div>',
  );
  await expect(query(card).button("Copy code")).toBeVisible();
});

test("an example card puts its code under the example, as wide as a fence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoAndSettle(page, "/tailwind/styles/ak-layer/");
  const card = page.locator("[data-example-card]").first();
  const cardBox = await card.boundingBox();
  const stage = await card.locator("[data-example-stage]").boundingBox();
  const code = await card.locator("pre").boundingBox();
  if (!cardBox || !stage || !code) {
    throw new Error("The card has no stage or code");
  }
  // The stage fills the width of the card, above the code.
  expect(stage.x).toBeCloseTo(cardBox.x, 0);
  expect(stage.width).toBeCloseTo(cardBox.width, 0);
  expect(stage.y + stage.height).toBeLessThanOrEqual(code.y);
  // The card goes in a popout, like a code fence, so its code lines up with the
  // code of a fence.
  const fence = page.locator("pre:not([data-example-card] pre)").first();
  const fenceBox = await fence.boundingBox();
  if (!fenceBox) throw new Error("The page has no code fence");
  expect(code.x).toBeCloseTo(fenceBox.x, 0);
  expect(code.width).toBeCloseTo(fenceBox.width, 0);
});

test("a wide table scrolls inside its own scroller with its column headers", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoAndSettle(page, "/tailwind/styles/theming/");
  const table = q.table().filter({ has: q.columnheader("Token family") });
  await expect(table).toBeVisible();
  await expect(query(table).columnheader()).toHaveText([
    "Token family",
    "Purpose",
    "Defaults",
  ]);
  // The main body clips its overflow, so the table must scroll on its own.
  const scroller = table.locator("..");
  const [scrollWidth, clientWidth] = await scroller.evaluate((element) => [
    element.scrollWidth,
    element.clientWidth,
  ]);
  expect(scrollWidth).toBeGreaterThan(clientWidth);
  await expect(scroller).toHaveCSS("overflow-x", "auto");
  // Docs tables are static, so the head row doesn't tint like a data row on
  // hover. The tint has no transition, and reading the computed style applies
  // the hover state, so no wait is needed.
  const header = query(table).columnheader("Token family");
  const getBackground = () =>
    header.evaluate((element) => {
      const row = element.closest("tr");
      if (!row) throw new Error("The header has no row");
      return [element, row].map((item) => getComputedStyle(item).background);
    });
  const before = await getBackground();
  await header.hover();
  expect(await getBackground()).toEqual(before);
});

test("the setup prompt copies its text", async ({ context, page, q }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await gotoAndSettle(page, "/tailwind/styles/getting-started/");
  const prompt = "Set up Ariakit Tailwind in this project.";
  const copy = q.button("Copy Prompt for your agent");
  await expect(q.text("Prompt for your agent", { exact: true })).toBeVisible();
  // The code block hydrates when it scrolls into view, and Astro removes the
  // ssr attribute of its island then. The page shows no other sign that the
  // button can copy.
  await copy.scrollIntoViewIfNeeded();
  await expect(
    page.locator("astro-island:not([ssr])").filter({ hasText: prompt }),
  ).toHaveCount(1);
  await copy.click();
  await expect(q.button("Copied")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.startsWith(`${prompt}\n`)).toBe(true);
  // The copied text keeps the indentation of the prompt source.
  expect(copied).toContain(
    '\n   @import "tailwindcss";\n   @import "@ariakit/tailwind";\n',
  );
});
