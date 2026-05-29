import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("composite items merged with menu buttons are reachable via arrow keys", async ({
    page,
    q,
  }) => {
    // The menu button in the first row must be reachable with ArrowRight from
    // its preceding sibling. It's a `CompositeItem` wrapped in a `MenuProvider`,
    // so before the fix it was registered in the menu's own composite store
    // instead of the outer composite store, and arrow navigation skipped it.
    await q.button("Button A1").focus();
    await test.expect(q.button("Button A1")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Menu A2")).toBeFocused();

    // Two-dimensional navigation: moving down a row and then right must also
    // reach the menu button in the second row.
    await q.button("Button A1").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.button("Button B1")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Menu B2")).toBeFocused();
  });
});
