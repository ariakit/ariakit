import { join } from "node:path";
import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";
import { FrameworkSchema } from "./lib/schemas.ts";
import { tags as tagData } from "./lib/tags.ts";

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
    frameworks: FrameworkSchema.array(),
    tags: reference("tags").array().default([]),
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

const tags = defineCollection({
  loader() {
    return Object.entries(tagData).map(([id, { label }]) => ({
      id,
      label,
    }));
  },
  schema: z.object({
    label: z.string(),
  }),
});

export const collections = {
  examples,
  descriptions,
  galleries,
  previews,
  tags,
};
