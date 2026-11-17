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
import { getStylePage, getStylePages } from "./styles.ts";

function entry(id: string, title: string, order: number) {
  return { id, data: { title, order } };
}

test("a Styles page path drops its group", () => {
  const page = getStylePage(entry("utilities/ak-layer", "ak-layer", 1));
  expect(page.group).toBe("utilities");
  expect(page.slug).toBe("ak-layer");
  expect(page.path).toBe("/tailwind/styles/ak-layer/");
});

test.each(["examples/ak-layer", "utilities", "utilities/ak-layer/extra"])(
  "rejects the Styles page id %s",
  (id) => {
    expect(() => getStylePage(entry(id, "Title", 1))).toThrow();
  },
);

test("orders guides before utilities, then by order and title", () => {
  const pages = getStylePages([
    entry("utilities/ak-text", "ak-text", 2),
    entry("guides/theming", "Theming", 2),
    entry("utilities/ak-layer", "ak-layer", 1),
    entry("guides/getting-started", "Getting started", 1),
    entry("utilities/variants", "Variants", 2),
  ]);
  expect(pages.map((page) => page.path)).toEqual([
    "/tailwind/styles/getting-started/",
    "/tailwind/styles/theming/",
    "/tailwind/styles/ak-layer/",
    "/tailwind/styles/ak-text/",
    "/tailwind/styles/variants/",
  ]);
});

test("rejects a guide and a utility with the same slug", () => {
  const entries = [
    entry("guides/variants", "Variants guide", 1),
    entry("utilities/variants", "Variants", 1),
  ];
  expect(() => getStylePages(entries)).toThrow(
    "The Styles pages guides/variants and utilities/variants share the path /tailwind/styles/variants/",
  );
});
