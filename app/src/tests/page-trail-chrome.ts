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

// A step without a URL is a level without a page, such as Recipes. It shows as
// text, and the structured data leaves it out.
type Step = readonly [label: string, href?: string];

const pages: Array<{
  name: string;
  path: string;
  steps: Step[];
  current: string;
}> = [
  {
    name: "recipe",
    path: "/react/recipes/navigation/",
    steps: [["Home", "/"], ["Recipes"]],
    current: "Navigation",
  },
  {
    name: "component",
    path: "/react/components/separator/",
    steps: [["Home", "/"], ["Components"]],
    current: "Separator",
  },
  {
    name: "guide",
    path: "/react/components/getting-started/",
    steps: [["Home", "/"], ["Components"]],
    current: "Getting Started",
  },
  {
    name: "API reference",
    path: "/react/components/separator/separator/",
    steps: [
      ["Home", "/"],
      ["Components"],
      ["Separator", "/react/components/separator/"],
    ],
    current: "API reference",
  },
];

// The site renders the trail with no hydration, so the links must work as they
// come from the server.
test.use({ javaScriptEnabled: false });

for (const { name, path, steps, current } of pages) {
  test(`shows the trail above the title of a ${name} page`, async ({
    page,
  }) => {
    await gotoAndSettle(page, path);
    const trail = query(getTrail(page));
    for (const [label, href] of steps) {
      if (href) {
        await expect(trail.link(label)).toHaveAttribute("href", href);
        continue;
      }
      await expect(trail.text(label)).toBeVisible();
      await expect(trail.text(label)).not.toHaveAttribute("aria-current");
      await expect(trail.link(label)).toHaveCount(0);
    }
    await expect(trail.text(current)).toHaveAttribute("aria-current", "page");
    await expect(trail.listitem()).toHaveCount(steps.length + 1);
    const linkSteps = steps.filter(([, href]) => href);
    const data = await getStructuredData(page);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(linkSteps.length + 1);
    expect(data.itemListElement.at(-1)).toEqual({
      "@type": "ListItem",
      position: linkSteps.length + 1,
      name: current,
    });
    const ancestors: Array<{ name: string; item: string }> =
      data.itemListElement.slice(0, -1);
    expect(ancestors.map((item) => item.name)).toEqual(
      linkSteps.map(([label]) => label),
    );
    expect(ancestors.map((item) => new URL(item.item).pathname)).toEqual(
      linkSteps.map(([, href]) => href),
    );
  });
}

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
