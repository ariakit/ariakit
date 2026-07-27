import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders detached content and removes it when unmounted", async ({
    q,
  }) => {
    const content = q.text("Detached portal content");
    await test.expect(content).toBeVisible();

    await q.button("Toggle portal").click();
    await test.expect(content).not.toBeVisible();

    await q.button("Toggle portal").click();
    await test.expect(content).toBeVisible();
  });

  test("renders a lazy component through a portal", async ({ q }) => {
    await test.expect(q.button("Lazy portal button")).toBeVisible();
  });
});
