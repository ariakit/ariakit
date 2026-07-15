import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/5238
  test("keeps the frontmost initially open sibling dialog interactive", async ({
    q,
  }) => {
    await test.expect(q.dialog("Apples")).toBeVisible();
    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");

    await q.button("Close apples").click();
    await test.expect(q.dialog("Apples")).not.toBeVisible();
    await test.expect(q.dialog("Oranges")).toBeVisible();
    await q.button("Eat orange").click();
    await test.expect(q.status("Orange count")).toHaveText("Oranges eaten: 1");
  });
});
