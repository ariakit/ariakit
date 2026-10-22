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
import type {
  ComponentRecipeEntry,
  FilterablePreview,
  PreviewOwnerEntry,
} from "./content.ts";
import {
  countEntryExamples,
  descriptionToText,
  filterPreviews,
} from "./content.ts";

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

function preview(
  id: string,
  source: FilterablePreview["data"]["source"],
  frameworks: FilterablePreview["data"]["frameworks"] = ["react"],
): FilterablePreview {
  return { id, data: { frameworks, source } };
}

const separatorComponent: PreviewOwnerEntry = {
  id: "separator",
  collection: "components",
};

const separatorRecipe: ComponentRecipeEntry = {
  id: "separator",
  collection: "recipes",
  data: { components: [] },
};

const toolbarRecipe: ComponentRecipeEntry = {
  id: "toolbar",
  collection: "recipes",
  data: { components: [{ id: "separator" }] },
};

// Component page preview ids start with components/, so a recipe and a
// component page can share an entry id.
const previews = [
  preview("components/separator", "components"),
  preview("separator", "recipes"),
  preview("separator/vertical", "recipes"),
  preview("separator/solid-only", "recipes", ["solid"]),
  preview("toolbar", "recipes"),
  preview("toolbar/menu", "recipes"),
  preview("separator-1234", "sandbox"),
];

test("filterPreviews keeps only the previews of the collection type", () => {
  expect(filterPreviews(previews, { type: "recipes" })).toEqual([
    preview("separator", "recipes"),
    preview("separator/vertical", "recipes"),
    preview("separator/solid-only", "recipes", ["solid"]),
    preview("toolbar", "recipes"),
    preview("toolbar/menu", "recipes"),
  ]);
  expect(filterPreviews(previews, { type: "components" })).toEqual([
    preview("components/separator", "components"),
  ]);
});

test("countEntryExamples counts the examples of a recipe", () => {
  const count = (entry: PreviewOwnerEntry) =>
    countEntryExamples({ entry, framework: "react", recipes: [], previews });
  expect(count(separatorRecipe)).toBe(2);
  expect(count(toolbarRecipe)).toBe(2);
});

test("countEntryExamples counts a component page and the recipes that list it", () => {
  const count = countEntryExamples({
    entry: separatorComponent,
    framework: "react",
    recipes: [separatorRecipe, toolbarRecipe],
    previews,
  });
  expect(count).toBe(3);
});
