import type { PageLink } from "@/build-pages/links.ts";
import invariant from "tiny-invariant";
import { getTagSlug, getTags } from "./tag.ts";

const cache = new WeakMap<PageLink[], Map<string, boolean>>();
const tags = getTags().map(getTagSlug);

export function isValidHref(href: string, links: PageLink[]) {
  if (!cache.has(links)) {
    const map = new Map<string, boolean>();
    cache.set(links, map);
  }
  const linksCache = cache.get(links);
  invariant(linksCache);
  if (linksCache.has(href)) {
    return !!linksCache.get(href);
  }

  const setResult = (result: boolean) => {
    linksCache.set(href, result);
    return result;
  };

  if (href.endsWith("#")) return setResult(false);
  const url = new URL(href, "https://ariakit.org");
  const link = links.find((link) => link.path === url.pathname);
  const hash = url.hash.replace("#", "");
  if (!link) {
    if (url.pathname === "/plus") return setResult(true);
    if (tags.some((tag) => url.pathname === `/tags/${tag}`)) {
      return setResult(true);
    }
    return setResult(false);
  }
  if (hash && !link.hashes.includes(hash)) return setResult(false);
  return setResult(true);
}
