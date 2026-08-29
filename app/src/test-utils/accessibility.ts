import type { Page } from "@playwright/test";

/**
 * Returns a function that reads the menu node from Chromium's own
 * accessibility tree. Playwright computes accessible names in the page instead
 * of reading the browser tree, so it resolves `aria-labelledby` across the
 * `inert` boundary that Chromium rejects. Only the browser tree shows what a
 * screen reader receives. Chromium only, so use it from a `test-chrome` file.
 */
export async function createMenuAccessibilityReader(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Accessibility.enable");
  return async () => {
    const { nodes } = await cdp.send("Accessibility.getFullAXTree");
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
