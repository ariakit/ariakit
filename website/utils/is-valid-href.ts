import type { PageLink } from "build-pages/links.js";

export function isValidHref(href: string, links: PageLink[]) {
  if (href.endsWith("#")) return false;
  const url = new URL(href, "https://ariakit.org");
  const link = links.find((link) => link.path === url.pathname);
  const hash = url.hash.replace("#", "");
  if (!link) return false;
  if (hash && !link.hashes.includes(hash)) return false;
  return true;
}
