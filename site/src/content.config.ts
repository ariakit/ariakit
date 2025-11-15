/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { defineCollection, reference, z } from "astro:content";
import { join } from "node:path";
import { invariant } from "@ariakit/core/utils/misc";
import { glob } from "astro/loaders";
import { jsdoc } from "./lib/jsdoc-loader.ts";
import { FrameworkSchema, TagSchema } from "./lib/schemas.ts";

function generateExampleId(options: { entry: string }) {
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

const components = defineCollection({
  loader: glob({
    pattern: "*/_component/index.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId(options) {
      const [id] = options.entry.split("/");
      invariant(id, "Component must have an id");
      return id;
    },
  }),
  schema: z.object({
    title: z.string(),
    frameworks: FrameworkSchema.array(),
    tags: TagSchema.array().default([]),
  }),
});

const examples = defineCollection({
  loader: glob({
    pattern: "*/index.mdx",
    base: join(import.meta.dirname, "examples"),
  }),
  schema: z.object({
    title: z.string(),
    frameworks: FrameworkSchema.array(),
    tags: TagSchema.array().default([]),
    components: z.array(reference("components")).default([]),
  }),
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
  loader: glob({
    pattern: "**/preview.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId: generateExampleId,
  }),
  schema: z.object({
    title: z.string(),
    fullscreen: z.boolean().optional(),
    frameworks: FrameworkSchema.array(),
  }),
});

const references = defineCollection({
  loader: jsdoc(
    {
      framework: "react",
      corePath: join(import.meta.dirname, "../../packages/ariakit-react-core"),
      packagePath: join(import.meta.dirname, "../../packages/ariakit-react"),
      // watch: true,
    },
    {
      framework: "solid",
      corePath: join(import.meta.dirname, "../../packages/ariakit-solid-core"),
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
