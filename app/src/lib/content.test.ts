/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { compareNavigationOrder, descriptionToText } from "./content.ts";
import type { NavigationOrderData } from "./content.ts";

function getDescriptionFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) {
      return getDescriptionFiles(entryPath);
    }
    if (entry.name === "description.mdx") {
      return [entryPath];
    }
    return [];
  });
}

test("descriptionToText extracts text from description markdown", async () => {
  const body = [
    `import ContentLink from "#app/components/content-link.astro";`,
    "",
    "Build **accessible** {getFramework(props.framework).label} components with <ContentLink href={`/${props.framework}/components/checkbox/`}>Ariakit</ContentLink>.",
  ].join("\n");

  await expect(descriptionToText(body, "react")).resolves.toBe(
    "Build accessible React components with Ariakit.",
  );
});

test("descriptionToText extracts text from the first block", async () => {
  const body = `
First paragraph.

Second paragraph.
`;

  await expect(descriptionToText(body, "react")).resolves.toBe(
    "First paragraph.",
  );
});

test("descriptionToText handles real descriptions", async () => {
  const files = ["../recipes", "../component-docs"].flatMap((dir) =>
    getDescriptionFiles(join(import.meta.dirname, dir)),
  );
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    const text = await descriptionToText(body, "react");
    expect(text, file).toBeTruthy();
  }
});

test("compareNavigationOrder groups entries by category, then orders titles", () => {
  const entries: NavigationOrderData[] = [
    { title: "Tooltip", category: "overlays" },
    { title: "Tabs", category: "navigation" },
    { title: "Breadcrumb", category: "navigation" },
    { title: "App Shell", category: "layout" },
    { title: "Separator" },
    { title: "Checkbox", category: "forms" },
  ];
  // Entries without a category, such as component pages, come first.
  expect(entries.toSorted(compareNavigationOrder)).toEqual([
    { title: "Separator" },
    { title: "App Shell", category: "layout" },
    { title: "Breadcrumb", category: "navigation" },
    { title: "Tabs", category: "navigation" },
    { title: "Checkbox", category: "forms" },
    { title: "Tooltip", category: "overlays" },
  ]);
});
