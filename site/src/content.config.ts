import { join } from "node:path";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const frameworks = z.union([
  z.literal("preact"),
  z.literal("react"),
  z.literal("solid"),
  z.literal("svelte"),
  z.literal("vue"),
]);

const examples = defineCollection({
  loader: glob({
    pattern: "**/index.mdx",
    base: join(import.meta.dirname, "examples"),
  }),
  schema: z.object({
    title: z.string().optional(),
    frameworks: z.array(frameworks),
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
    frameworks: z.array(frameworks),
  }),
});

export const collections = { examples, previews };
