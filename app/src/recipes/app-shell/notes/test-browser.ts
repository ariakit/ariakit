import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps the current step of the trail in a narrow header", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    const trail = q.navigation("Breadcrumb");
    const overflow = await trail.evaluate((element) => {
      const current = element.querySelector("[aria-current]");
      const end =
        current?.getBoundingClientRect().right ?? Number.POSITIVE_INFINITY;
      return end - element.getBoundingClientRect().right;
    });
    test.expect(overflow).toBeLessThanOrEqual(0);
  });
});
