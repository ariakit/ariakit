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

test("getCollectionTrail links to the collection of the page", () => {
  expect(getCollectionTrail("react", "recipes", "Navigation")).toEqual({
    steps: [{ label: "Recipes", href: "/react/recipes/" }],
    current: "Navigation",
  });
  expect(getCollectionTrail("react", "components", "Separator")).toEqual({
    steps: [{ label: "Components", href: "/react/components/" }],
    current: "Separator",
  });
});

test("getTrailStructuredData lists home, the steps, and the page without a URL", () => {
  const trail = getCollectionTrail("react", "recipes", "Navigation");
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
        name: "Recipes",
        item: "https://ariakit.com/react/recipes/",
      },
      { "@type": "ListItem", position: 3, name: "Navigation" },
    ],
  });
});

test("serializeStructuredData can't close its script element", () => {
  expect(serializeStructuredData({ name: "</script>" })).toBe(
    '{"name":"\\u003c/script>"}',
  );
});
