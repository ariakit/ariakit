import {
  createDismissAccessibilityReader,
  createMenuAccessibilityReader,
} from "#app/test-utils/accessibility.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // The dialog names the focused control as a fallback disclosure, but that
  // control isn't a menu button and can't be assumed to close the menu, so the
  // menu keeps the fallback dismiss button. It renders next to the menu, where
  // the ARIA menu pattern doesn't forbid it, so the menu still owns only its
  // own items. Safari reaches the capture through a different branch, since it
  // leaves `BODY` as the active element for a native button without an
  // explicit tab index, and giving the button one here would move this test
  // off the branch it covers.
  // https://github.com/ariakit/ariakit/issues/4270
  // https://github.com/ariakit/ariakit/issues/7310
  test("context menu keeps a dismiss button outside the menu", async ({
    page,
    q,
  }) => {
    const readMenu = await createMenuAccessibilityReader(page);
    const readDismissExposed = await createDismissAccessibilityReader(page);

    await q.button("Open menu").click();
    const menu = q.menu();
    await test.expect(menu).toBeVisible();
    await test.expect(q.button("Dismiss popup")).toBeVisible();
    await test.expect(query(menu).button()).toHaveCount(0);

    await test.expect
      .poll(async () => (await readMenu())?.childRoles)
      .toEqual([
        "menuitem",
        "menuitem",
        "menuitem",
        "separator",
        "menuitem",
        "menuitem",
      ]);

    // Moving the button out of the menu only helps if the modal context still
    // exposes it. Everything else outside the menu is `inert` by now.
    await test.expect.poll(readDismissExposed).toBe(true);
  });
});
