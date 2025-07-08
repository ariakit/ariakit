import { join } from "node:path";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { FrameworkSchema, TagSchema } from "./lib/schemas.ts";

function generateId(options: { entry: string }) {
  return options.entry.replace(/\/[^/]+\.mdx?$/, "");
}

const examples = defineCollection({
  loader: glob({
    pattern: "*/index.mdx",
    base: join(import.meta.dirname, "examples"),
  }),
  schema: z.object({
    title: z.string(),
    component: z.boolean().default(false),
    frameworks: FrameworkSchema.array(),
    tags: TagSchema.array().default([]),
  }),
});

const descriptions = defineCollection({
  loader: glob({
    pattern: "*/description.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId,
  }),
});

const galleries = defineCollection({
  loader: glob({
    pattern: "*/gallery.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId,
  }),
  schema: z.object({
    length: z.number().default(1),
  }),
});

const previews = defineCollection({
  loader: glob({
    pattern: "**/preview.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId,
  }),
  schema: z.object({
    title: z.string(),
    frameworks: FrameworkSchema.array(),
  }),
});

export const collections = {
  examples,
  descriptions,
  galleries,
  previews,
};
