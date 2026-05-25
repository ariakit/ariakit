import { kebabCase } from "lodash-es";

export function getTagSlug(tag: string) {
  return kebabCase(tag);
}
