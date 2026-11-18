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
import { keys } from "./lib/object.ts";
import { PreviewKindSchema, previewConfig } from "./lib/preview-config.ts";
import { previewLoader } from "./lib/preview-discovery.ts";
import { recipeIcons } from "./lib/recipe-icons.ts";
import { RECIPE_CATEGORIES } from "./lib/schemas.ts";

// Recipes and component pages share these collections, so the id keeps the
// content directory, as in recipes/navigation or docs/components/separator.
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

// The pages of the Styles section. Guides and utilities share one URL
// namespace, so the id keeps the group folder only for the navigation.
const styles = defineCollection({
  loader: glob({
    pattern: "{guides,utilities}/*/index.mdx",
    base: join(import.meta.dirname, "docs/styles"),
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // The place of the page in its group, so folder names stay plain slugs.
    order: z.number(),
  }),
});

const components = defineCollection({
  loader: componentLoader({
    base: join(import.meta.dirname, "docs/components"),
  }),
  schema: componentLoader.schema(
    z.object({
      title: z.string(),
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
      // The group of the recipe in the site navigation.
      category: z.enum(RECIPE_CATEGORIES),
      // The Lucide icon before the recipe label in the site navigation.
      icon: z.enum(keys(recipeIcons)),
      components: z.array(reference("components")).default([]),
    }),
  ),
});

const descriptions = defineCollection({
  loader: glob({
    pattern: "{recipes,docs/components}/*/description.mdx",
    base: import.meta.dirname,
    generateId: generateContentId,
  }),
});

const galleries = defineCollection({
  loader: glob({
    pattern: "{recipes,docs/components}/*/gallery.mdx",
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
  styles,
  components,
  recipes,
  descriptions,
  galleries,
  previews,
  references,
};
