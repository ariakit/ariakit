import { z } from "zod";

export const FRAMEWORKS = [
  "react",
  "solid",
  "svelte",
  "vue",
  "preact",
] as const;
export const FrameworkSchema = z.enum(FRAMEWORKS);
export type Framework = z.infer<typeof FrameworkSchema>;

export const PLUS_TYPES = ["personal", "team"] as const;
export const PlusTypeSchema = z.enum(PLUS_TYPES);
export type PlusType = z.infer<typeof PlusTypeSchema>;
