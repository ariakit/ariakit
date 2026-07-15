import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/5238
  test("keeps an initially open inline nested dialog in front", async ({
    page,
    q,
  }) => {
    await test.expect(page.locator("[data-dialog]")).toHaveCount(2);
    await test.expect(q.dialog("Parent")).not.toBeVisible();
    await test.expect(q.dialog("Child")).toBeVisible();
    await q.button("Interact with child").click();
    await test
      .expect(q.status("Child count"))
      .toHaveText("Child interactions: 1");

    await q.button("Close child").click();
    await test.expect(q.dialog("Child")).not.toBeVisible();
    await test.expect(q.dialog("Parent")).toBeVisible();
    await q.button("Interact with parent").click();
    await test
      .expect(q.status("Parent count"))
      .toHaveText("Parent interactions: 1");
  });
});
