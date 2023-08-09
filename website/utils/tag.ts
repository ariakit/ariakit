import pageIndex from "build-pages/index.js";
import { kebabCase } from "lodash-es";

const tags: string[] = [];
const pages = Object.values(pageIndex).flat();

for (const page of pages) {
  for (const tag of page.tags) {
    if (tags.some((item) => getTagSlug(item) === getTagSlug(tag))) continue;
    tags.push(tag);
  }
}

export function getTags() {
  return tags;
}

export function getTagSlug(tag: string) {
  return kebabCase(tag);
}

export function getTagTitle(tag: string) {
  return tags.find((item) => getTagSlug(item) === getTagSlug(tag));
}

export function getPagesByTag(tag: string) {
  return pages.filter((item) =>
    item.tags.some((item) => getTagSlug(item) === getTagSlug(tag)),
  );
}
