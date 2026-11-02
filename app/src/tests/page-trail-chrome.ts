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
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

function getTrail(page: Page) {
  return query(page.locator("main")).navigation("Breadcrumb");
}

// Schema names are the contract with search engines, so the data stays raw
// here.
async function getStructuredData(page: Page) {
  const script = page.locator('script[type="application/ld+json"]');
  const text = await script.textContent();
  return JSON.parse(text ?? "null");
}

const pages = [
  {
    name: "recipe",
    path: "/react/recipes/navigation/",
    links: [
      ["Home", "/"],
      ["Recipes", "/react/recipes/"],
    ],
    current: "Navigation",
  },
  {
    name: "component",
    path: "/react/components/separator/",
    links: [
      ["Home", "/"],
      ["Components", "/react/components/"],
    ],
    current: "Separator",
  },
  {
    name: "guide",
    path: "/react/components/getting-started/",
    links: [
      ["Home", "/"],
      ["Components", "/react/components/"],
    ],
    current: "Getting Started",
  },
  {
    name: "API reference",
    path: "/react/components/separator/separator/",
    links: [
      ["Home", "/"],
      ["Components", "/react/components/"],
      ["Separator", "/react/components/separator/"],
    ],
    current: "API reference",
  },
];

// The site renders the trail with no hydration, so the links must work as they
// come from the server.
test.use({ javaScriptEnabled: false });

for (const { name, path, links, current } of pages) {
  test(`shows the trail above the title of a ${name} page`, async ({
    page,
  }) => {
    await gotoAndSettle(page, path);
    const trail = getTrail(page);
    for (const [label, href] of links) {
      await expect(query(trail).link(label)).toHaveAttribute(
        "href",
        href ?? "",
      );
    }
    await expect(query(trail).text(current)).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(query(trail).listitem()).toHaveCount(links.length + 1);
    const data = await getStructuredData(page);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(links.length + 1);
    expect(data.itemListElement.at(-1)).toEqual({
      "@type": "ListItem",
      position: links.length + 1,
      name: current,
    });
    const ancestors: Array<{ name: string; item: string }> =
      data.itemListElement.slice(0, -1);
    expect(ancestors.map((item) => item.name)).toEqual(
      links.map(([label]) => label),
    );
    expect(ancestors.map((item) => new URL(item.item).pathname)).toEqual(
      links.map(([, href]) => href),
    );
  });
}

test("shows no trail on a collection page", async ({ page }) => {
  await gotoAndSettle(page, "/react/recipes/");
  await expect(page.locator("h1")).toHaveText("Recipes");
  await expect(getTrail(page)).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  );
});

test("lines up the home icon with the title", async ({ page }) => {
  await gotoAndSettle(page, "/react/recipes/navigation/");
  const offset = await query(getTrail(page))
    .link("Home")
    .evaluate((link) => {
      const icon = link.querySelector("svg")?.getBoundingClientRect().left ?? 0;
      const title = link.ownerDocument.querySelector("h1");
      const left = title?.getBoundingClientRect().left ?? 0;
      return Math.abs(icon - left);
    });
  expect(offset).toBeLessThan(0.5);
});
