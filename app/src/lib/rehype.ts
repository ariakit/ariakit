/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Root } from "hast";
import { visit } from "unist-util-visit";

interface RehypeAsTagNameOptions {
  tags: string[];
}

/**
 * Block-level tags that map to polymorphic content components needing an `as`
 * prop. Shared so the build-time (Sätteri) and runtime (unified) pipelines stay
 * in sync.
 */
export const AS_TAG_NAMES = ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"];

/**
 * This plugin adds the `as` property to matching elements (headings and lists)
 * so the polymorphic content components render the correct tag.
 *
 * Used by the runtime `astro-remote` rendering path (see content.ts), which
 * stays on the unified processor because Sätteri's native binding is not
 * bundled into the Cloudflare worker runtime. The build-time pipeline uses the
 * Sätteri equivalent in satteri-plugins.ts instead.
 */
export function rehypeAsTagName({ tags }: RehypeAsTagNameOptions) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (!node.tagName) return;
      if (!tags.includes(node.tagName)) return;
      node.properties.as = node.tagName;
    });
  };
}
