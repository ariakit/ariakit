/**
 * Checks the origin and path, ignoring trailing slashes. The destination's hash
 * and search must match only when specified.
 */
export function isCurrentPage(
  currentUrl?: string | URL,
  href?: string | URL,
): boolean {
  if (!href) return false;
  if (!currentUrl) return false;
  // Anchor relative URLs to a reserved host that real destinations cannot
  // match. Destinations that target this sentinel host are unsupported.
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
