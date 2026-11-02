import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("clips the chosen steps on one row and keeps the others whole", async ({
    q,
  }) => {
    const trail = query(q.navigation("Breadcrumb"));
    const regional = trail.link("Regional operations and logistics");
    const label = regional.locator(".breadcrumb-truncate");
    await test.expect
      .poll(() =>
        label.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      )
      .toBe(true);
    const boxes = await Promise.all([
      trail.link("Northwind").boundingBox(),
      regional.boundingBox(),
      trail.text("Audit").boundingBox(),
    ]);
    const tops = boxes.map((box) => box?.y);
    test.expect(new Set(tops).size).toBe(1);
    const first = trail.link("Northwind");
    test
      .expect(
        await first.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);
  });

  test("keeps the current step in view at the narrowest preview width", async ({
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

  test("keeps room for a wide letter and the ellipsis at the minimum width", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 240, height: 600 });
    const label = q
      .link("Regional operations and logistics")
      .locator(".breadcrumb-truncate");
    const room = await label.evaluate((element) => {
      const context = element.ownerDocument
        .createElement("canvas")
        .getContext("2d");
      if (!context) return 0;
      context.font = getComputedStyle(element).font;
      const needed = context.measureText("W…").width;
      return element.getBoundingClientRect().width - needed;
    });
    test.expect(room).toBeGreaterThanOrEqual(0);
  });
});
