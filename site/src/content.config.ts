import { defineCollection, z } from "astro:content";
import { join } from "node:path";
import { glob } from "astro/loaders";
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
      const id = entry.replace(/^(?:\d-)?(.+)\.mdx?$/, "$1");
      return `${group}/${id}`;
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

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
    generateId: generateExampleId,
  }),
});

const galleries = defineCollection({
  loader: glob({
    pattern: "*/gallery.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId: generateExampleId,
  }),
  schema: z.object({
    length: z.number().default(1),
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
    frameworks: FrameworkSchema.array(),
  }),
});

export const collections = {
  guides,
  examples,
  descriptions,
  galleries,
  previews,
};
