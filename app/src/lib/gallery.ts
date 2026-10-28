/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getEntry } from "astro:content";
import type { AppExample } from "./app.ts";
import type { Framework } from "./schemas.ts";

/**
 * Returns the examples of a gallery that the framework of the page renders, in
 * page order, from the `examples` field that `remarkGalleryExamples` adds to
 * its remark plugin frontmatter.
 */
export async function getGalleryExamples(
  frontmatter: Record<string, unknown> | undefined,
  framework: Framework,
) {
  const examples = frontmatter?.examples;
  if (!Array.isArray(examples)) return [];
  const previews = await Promise.all(
    examples.map(async (previewId: unknown) => {
      if (typeof previewId !== "string") return;
      return getEntry("previews", previewId);
    }),
  );
  // A card renders nothing for a framework that its preview doesn't support.
  return previews.flatMap((preview): AppExample[] => {
    if (!preview) return [];
    if (!preview.data.frameworks.includes(framework)) return [];
    return [{ previewId: preview.id, title: preview.data.title }];
  });
}
