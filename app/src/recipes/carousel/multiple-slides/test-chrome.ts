import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("shows more slides as the width grows", async ({ page, q }) => {
    const carousel = q.region("Templates");
    // The slides that fit whole in the viewport, which the basis classes set.
    const getWholeSlides = () =>
      query(carousel)
        .group()
        .evaluateAll((nodes) => {
          const viewport = nodes[0]?.parentElement;
          if (!viewport) return 0;
          const box = viewport.getBoundingClientRect();
          return nodes.filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.left >= box.left - 1 && rect.right <= box.right + 1;
          }).length;
        });
    await page.setViewportSize({ width: 1100, height: 800 });
    await test.expect.poll(getWholeSlides).toBe(3);
    await page.setViewportSize({ width: 640, height: 800 });
    await test.expect.poll(getWholeSlides).toBe(2);
    await page.setViewportSize({ width: 400, height: 800 });
    await test.expect.poll(getWholeSlides).toBe(1);
    // Every slide keeps its own tab.
    await test.expect(query(carousel).tab()).toHaveCount(7);
  });
});
