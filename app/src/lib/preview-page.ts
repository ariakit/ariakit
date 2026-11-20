/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { CollectionEntry } from "astro:content";
import { isNextjsPreviewId } from "./nextjs.ts";

type PreviewEntry = CollectionEntry<"previews">;

/**
 * Returns the static paths of the preview pages of the given entries. Two pages
 * render these paths: `[...preview].astro` for the recipe, component page, and
 * Styles page previews, and `[...sandbox].astro` for the sandbox previews. Each
 * page loads its own CSS entry point. The `param` argument is the name of the
 * rest parameter of the page.
 */
export function getPreviewPagePaths(param: string, entries: PreviewEntry[]) {
  const getParams = (value: string) => ({ [param]: value });
  return entries.flatMap((entry) => {
    // Next.js previews are redirected by the Worker wrapper.
    if (isNextjsPreviewId(entry.id)) return [];
    return entry.data.frameworks.flatMap((framework) => {
      const preview = `${framework}/previews/${entry.id}`;
      const paths = [
        {
          params: getParams(preview),
          props: { framework, entry, isolated: false },
        },
      ];
      // Capture tests load an Ariakit UI sandbox many times, and most of them
      // need only a few of its cards. See forEachColorSchemeOf.
      if (framework === "react" && entry.id.startsWith("ariakit-ui-")) {
        paths.push({
          params: getParams(`${preview}/isolated`),
          props: { framework, entry, isolated: true },
        });
      }
      return paths;
    });
  });
}
