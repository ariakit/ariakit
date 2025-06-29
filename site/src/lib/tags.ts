import { nonNullable } from "./non-nullable.ts";
import type { Framework } from "./schemas.ts";

type Tags = Record<string, { label: string; frameworks?: Framework[] }>;

const customTags = {
  plus: { label: "Plus" },
  dropdowns: { label: "Dropdowns" },
  forms: { label: "Forms" },
  nextjs: { label: "Next.js", frameworks: ["react"] },
  "nextjs-app-router": { label: "Next.js App Router", frameworks: ["react"] },
  search: { label: "Search" },
} as const satisfies Tags;

export const tags = {
  ...customTags,
} as const satisfies Tags;

export function isTagEnabled(
  id: string,
  frameworks?: Framework[],
): id is keyof typeof tags {
  const tag = tags[id as keyof typeof tags];
  if (!tag) return false;
  if (!frameworks) return true;
  if (!("frameworks" in tag)) return true;
  return frameworks.every((framework) =>
    tag.frameworks.includes(framework as never),
  );
}

export function getTag(id: string, frameworks?: Framework[]) {
  if (!isTagEnabled(id, frameworks)) return null;
  return { id, ...tags[id as keyof typeof tags] };
}

export function mapTags(tags: string[], frameworks?: Framework[]) {
  return [...new Set(tags)]
    .map((tag) => getTag(tag, frameworks))
    .filter(nonNullable);
}

export function getTags(frameworks?: Framework[]) {
  const allTags = Object.entries(tags).map(([id, tag]) => ({ id, ...tag }));
  if (!frameworks) return allTags;
  return allTags.filter((tag) => isTagEnabled(tag.id, frameworks));
}
