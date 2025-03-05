import { join } from "node:path";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const examples = defineCollection({
  loader: glob({
    pattern: "**/index.mdx",
    base: join(import.meta.dirname, "examples"),
  }),
  schema: z.object({
    title: z.string().optional(),
    frameworks: z.array(
      z.union([
        z.literal("preact"),
        z.literal("react"),
        z.literal("solid"),
        z.literal("svelte"),
        z.literal("vue"),
      ]),
    ),
  }),
});

export const collections = { examples };
