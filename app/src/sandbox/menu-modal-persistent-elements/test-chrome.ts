import { createMenuAccessibilityReader } from "#app/test-utils/accessibility.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The happy-dom duplicate can only assert the `inert` boundary. Chromium's
  // own accessibility tree is where the naming failure shows up, so this is
  // what proves the swapped disclosure can still name the menu.
  // https://github.com/ariakit/ariakit/pull/7303#discussion_r3884581660
  test("swapping the disclosure keeps the menu named", async ({ page, q }) => {
    const readMenu = await createMenuAccessibilityReader(page);

    await q.button("Actions").click();
    await test.expect(q.menu()).toBeVisible();
    await test.expect
      .poll(async () => (await readMenu())?.name)
      .toBe("Actions");

    await q.menuitem("Use other trigger").click();

    await test.expect(q.menu()).toBeVisible();
    await test.expect.poll(async () => (await readMenu())?.name).toBe("Other");
  });
});
