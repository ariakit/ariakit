import type { Page } from "@playwright/test";

// Playwright computes accessible names in the page instead of reading the
// browser tree, so it resolves `aria-labelledby` across the `inert` boundary
// that Chromium rejects, and it reports an `inert` element as visible. Only the
// browser tree shows what a screen reader receives. Chromium only, so use these
// from a `test-chrome` file.
async function createTreeReader(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Accessibility.enable");
  return async () => {
    const { nodes } = await cdp.send("Accessibility.getFullAXTree");
    return nodes;
  };
}

/**
 * Returns a function that reads the menu node from Chromium's own
 * accessibility tree, with its accessible name and the roles it owns.
 */
export async function createMenuAccessibilityReader(page: Page) {
  const readNodes = await createTreeReader(page);
  return async () => {
    const nodes = await readNodes();
    const menu = nodes.find(
      (node) => node.role?.value === "menu" && !node.ignored,
    );
    // Returning null instead of throwing keeps `expect.poll` retrying, since
    // it evaluates the value function outside of its own try/catch.
    if (!menu) return null;
    const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
    const children =
      menu.childIds?.flatMap((id) => nodeById.get(id) ?? []) ?? [];
    return {
      name: menu.name?.value,
      childRoles: children
        .filter((child) => !child.ignored)
        .map((child) => child.role?.value),
    };
  };
}

/**
 * Returns a function that tells whether the fallback dismiss button is exposed
 * to assistive technology. It renders next to the dialog rather than inside it,
 * so the modal context has to keep it out of the `inert` subtree. An `inert`
 * element stays in the DOM and stays visible to Playwright, but drops out of
 * the browser tree, so only this read tells the two apart.
 *
 * It matches on the accessible name, which a default `DialogDismiss` also
 * carries, so use it in fixtures that render at most one of the two.
 */
export async function createDismissAccessibilityReader(page: Page) {
  const readNodes = await createTreeReader(page);
  return async () => {
    const nodes = await readNodes();
    return nodes.some(
      (node) =>
        !node.ignored &&
        node.role?.value === "button" &&
        node.name?.value === "Dismiss popup",
    );
  };
}
