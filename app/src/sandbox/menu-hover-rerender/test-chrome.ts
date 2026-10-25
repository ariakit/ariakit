import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8086
  test("hide the menu after hovering outside while the page re-renders", async ({
    q,
  }) => {
    await q.button("Actions").hover();
    await test.expect(q.menu("Actions")).toBeVisible();
    await q.text(/^Pointer:/).hover();
    await test.expect(q.menu("Actions")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/8086
  test("hide a shared menu after hovering outside while the page re-renders", async ({
    q,
  }) => {
    await q.button("Arrange").hover();
    await test.expect(q.menuitem("Align")).toBeVisible();
    await q.text(/^Pointer:/).hover();
    await test.expect(q.menuitem("Align")).not.toBeVisible();
  });
});
