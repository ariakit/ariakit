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
import { descriptionToText } from "./content.ts";

function getDescriptionFiles(
  path = join(import.meta.dirname, "../examples"),
): string[] {
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
  const files = getDescriptionFiles();
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    const text = await descriptionToText(body, "react");
    expect(text, file).toBeTruthy();
  }
});
