import type { PageLink } from "build-pages/links.js";
import invariant from "tiny-invariant";

const cache = new WeakMap<PageLink[], Map<string, boolean>>();

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
  if (!link) return setResult(false);
  if (hash && !link.hashes.includes(hash)) return setResult(false);
  return setResult(true);
}
