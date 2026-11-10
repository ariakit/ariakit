/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { expect, test } from "vitest";
import {
  getCollectionTrail,
  getTrailStructuredData,
  serializeStructuredData,
} from "./trail.ts";

test("getCollectionTrail names the collection of the page without a link", () => {
  expect(getCollectionTrail("recipes", "Navigation")).toEqual({
    steps: [{ label: "Recipes" }],
    current: "Navigation",
  });
  expect(getCollectionTrail("components", "Separator")).toEqual({
    steps: [{ label: "Components" }],
    current: "Separator",
  });
});

test("getTrailStructuredData lists home, the linked steps, and the page without a URL", () => {
  const trail = getCollectionTrail("components", "API reference");
  trail.steps.push({
    label: "Separator",
    href: "/react/components/separator/",
  });
  expect(getTrailStructuredData(trail, "https://ariakit.com")).toEqual({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ariakit.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Separator",
        item: "https://ariakit.com/react/components/separator/",
      },
      { "@type": "ListItem", position: 3, name: "API reference" },
    ],
  });
});

test("serializeStructuredData can't close its script element", () => {
  expect(serializeStructuredData({ name: "</script>" })).toBe(
    '{"name":"\\u003c/script>"}',
  );
});
