import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Returns a function that reads the menu node from Chromium's own
 * accessibility tree. Playwright computes accessible names in the page instead
 * of reading the browser tree, so it resolves `aria-labelledby` across the
 * `inert` boundary that Chromium rejects. Only the browser tree shows what a
 * screen reader receives.
 */
async function createMenuAccessibilityReader(page: Page) {
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

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/4270
  test("modal menu exposes only its items to assistive technology", async ({
    page,
    q,
  }) => {
    const readMenu = await createMenuAccessibilityReader(page);

    await q.button("Preview").click();
    const menu = q.menu();
    await test.expect(menu).toBeVisible();
    await test.expect(query(menu).menuitem()).toHaveCount(3);
    await test.expect(query(menu).button()).toHaveCount(0);

    await test.expect
      .poll(async () => (await readMenu())?.childRoles)
      .toEqual(["menuitem", "menuitem", "menuitem"]);
  });

  // https://github.com/ariakit/ariakit/issues/4270
  test("modal menu keeps the accessible name from its menu button", async ({
    page,
    q,
  }) => {
    const readMenu = await createMenuAccessibilityReader(page);

    await q.button("Preview").click();
    await test.expect(q.menu()).toBeVisible();

    await test.expect
      .poll(async () => (await readMenu())?.name)
      .toBe("Preview");

    // Only the menu button joins the modal context. Everything else outside
    // the menu keeps being disabled one element at a time.
    await test.expect(q.button("Publish")).toHaveAttribute("inert", "");

    // The browser refuses focus on inert content, so focus stays in the menu
    // even when something tries to move it outside.
    await q.button("Publish").focus();
    await test.expect(q.menu()).toBeFocused();
  });
});
