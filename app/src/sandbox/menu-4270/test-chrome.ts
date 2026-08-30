import { createMenuAccessibilityReader } from "#app/test-utils/accessibility.ts";
import { withFramework } from "#app/test-utils/preview.ts";

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
    // The fallback dismiss button is still rendered, next to the menu rather
    // than inside it, so the menu owns only its own items.
    // https://github.com/ariakit/ariakit/issues/7310
    await test.expect(q.button("Dismiss popup")).toBeVisible();

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
