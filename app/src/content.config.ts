/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { join } from "node:path";
import { invariant } from "@ariakit/utils";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection, reference } from "astro:content";
import { jsdoc } from "./lib/jsdoc-loader.ts";
import { componentLoader, recipeLoader } from "./lib/mdx-loader.ts";
import { PreviewKindSchema, previewConfig } from "./lib/preview-config.ts";
import { previewLoader } from "./lib/preview-discovery.ts";

// Recipes and component docs share these collections, so the id keeps the
// content directory, as in recipes/navigation or component-docs/separator.
function generateContentId(options: { entry: string }) {
  return options.entry.replace(/\/[^/]+\.mdx?$/, "");
}

const guides = defineCollection({
  loader: glob({
    pattern: "*/*.mdx",
    base: join(import.meta.dirname, "guides"),
    generateId(options) {
      const [group, entry] = options.entry.split("/");
      invariant(group, "Guide must belong to a group or framework");
      invariant(entry, "Guide must have an id");
      const id = entry.replace(/^(?:\d-)?(.+)\.mdx?$/, "$1");
      return `${group}/${id}`;
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

// The card size on the recipe and component list pages. Pick the shape that
// fits the thumbnail scene: a whole screen, a popup that opens down from a
// trigger, a section that runs across a page, or a single control.
const ThumbnailShapeSchema = z
  .enum(["screen", "popup", "section", "control"])
  .default("control");

const components = defineCollection({
  loader: componentLoader({
    base: join(import.meta.dirname, "component-docs"),
  }),
  schema: componentLoader.schema(
    z.object({
      title: z.string(),
      shape: ThumbnailShapeSchema,
    }),
  ),
});

const recipes = defineCollection({
  loader: recipeLoader({
    base: join(import.meta.dirname, "recipes"),
  }),
  schema: recipeLoader.schema(
    z.object({
      title: z.string(),
      shape: ThumbnailShapeSchema,
      components: z.array(reference("components")).default([]),
    }),
  ),
});

const descriptions = defineCollection({
  loader: glob({
    pattern: "{recipes,component-docs}/*/description.mdx",
    base: import.meta.dirname,
    generateId: generateContentId,
  }),
});

const galleries = defineCollection({
  loader: glob({
    pattern: "{recipes,component-docs}/*/gallery.mdx",
    base: import.meta.dirname,
    generateId: generateContentId,
  }),
});

const previews = defineCollection({
  loader: previewLoader(previewConfig),
  schema: previewLoader.schema.extend({ source: PreviewKindSchema }),
});

const references = defineCollection({
  loader: jsdoc(
    {
      framework: "react",
      corePath: join(
        import.meta.dirname,
        "../../packages/ariakit-react-components",
      ),
      packagePath: join(import.meta.dirname, "../../packages/ariakit-react"),
      // watch: true,
    },
    {
      framework: "solid",
      corePath: join(
        import.meta.dirname,
        "../../packages/ariakit-solid-components",
      ),
      packagePath: join(import.meta.dirname, "../../packages/ariakit-solid"),
      // watch: true,
    },
  ),
});

export const collections = {
  guides,
  components,
  recipes,
  descriptions,
  galleries,
  previews,
  references,
};
