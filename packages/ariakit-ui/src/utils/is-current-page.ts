/**
 * Whether `href` points to the page at `currentUrl`. Cross-origin
 * destinations never match. Pathnames compare with trailing slashes
 * stripped; the destination's hash and search only need to match when the
 * destination declares them.
 */
export function isCurrentPage(
  currentUrl?: string | URL,
  href?: string | URL,
): boolean {
  if (!href) return false;
  if (!currentUrl) return false;
  // The fallback base only anchors path-only current URLs. The reserved
  // .invalid host keeps real-world absolute destinations from matching it
  // by origin; destinations that literally target the sentinel host are
  // not supported inputs.
  const base = new URL(currentUrl, "https://_.invalid");
  let dest: URL;
  try {
    dest = new URL(href, base);
  } catch {
    return false;
  }
  if (dest.origin !== base.origin) return false;
  const basePathname = base.pathname.replace(/\/$/, "");
  const destPathname = dest.pathname.replace(/\/$/, "");
  if (destPathname !== basePathname) return false;
  if (dest.hash && dest.hash !== base.hash) return false;
  base.searchParams.sort();
  dest.searchParams.sort();
  if (dest.search && dest.search !== base.search) return false;
  return true;
}
