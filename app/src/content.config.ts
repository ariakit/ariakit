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
import { componentLoader, exampleLoader } from "./lib/mdx-loader.ts";
import { previewConfig } from "./lib/preview-config.ts";
import { previewLoader } from "./lib/preview-discovery.ts";
import { TagSchema } from "./lib/schemas.ts";

function generateExampleId(options: { entry: string }) {
  return options.entry
    .replace(/\/[^/]+\.mdx?$/, "")
    .replace(/^(?:examples|sandbox)\//, "");
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

const components = defineCollection({
  loader: componentLoader({
    base: join(import.meta.dirname, "examples"),
  }),
  schema: componentLoader.schema(
    z.object({
      title: z.string(),
      tags: TagSchema.array().default([]),
    }),
  ),
});

const examples = defineCollection({
  loader: exampleLoader({
    base: join(import.meta.dirname, "examples"),
  }),
  schema: exampleLoader.schema(
    z.object({
      title: z.string(),
      tags: TagSchema.array().default([]),
      components: z.array(reference("components")).default([]),
    }),
  ),
});

const descriptions = defineCollection({
  loader: glob({
    pattern: "**/description.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId: generateExampleId,
  }),
});

const galleries = defineCollection({
  loader: glob({
    pattern: "**/gallery.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId: generateExampleId,
  }),
});

const previews = defineCollection({
  loader: previewLoader(previewConfig),
  schema: previewLoader.schema,
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
  examples,
  descriptions,
  galleries,
  previews,
  references,
};
