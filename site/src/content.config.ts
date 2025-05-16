import { join } from "node:path";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { FrameworkSchema } from "./lib/schemas.ts";

const examples = defineCollection({
  loader: glob({
    pattern: "*/index.mdx",
    base: join(import.meta.dirname, "examples"),
  }),
  schema: z.object({
    title: z.string().optional(),
    frameworks: FrameworkSchema.array(),
  }),
});

const previews = defineCollection({
  loader: glob({
    pattern: "**/preview.mdx",
    base: join(import.meta.dirname, "examples"),
    generateId(options) {
      return options.entry.replace("/preview.mdx", "");
    },
  }),
  schema: z.object({
    title: z.string().optional(),
    frameworks: FrameworkSchema.array(),
  }),
});

export const collections = { examples, previews };
