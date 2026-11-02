import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the trail in view while the page scrolls", async ({
    page,
    q,
  }) => {
    const trail = query(q.navigation("Breadcrumb"));
    const link = trail.link("Tools");
    await test.expect(link).toBeInViewport();
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 900);
    await test.expect(q.heading("Pruning shears")).not.toBeInViewport();
    await test.expect(link).toBeInViewport();
  });
});
