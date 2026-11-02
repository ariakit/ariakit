import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-breadcrumb/page",
      }),
    );
  });

  test("keeps a short scrolling trail with clipped labels in view", async ({
    q,
  }) => {
    const trail = q.navigation("Scrolling clipped labels");
    const geometry = await trail.evaluate((element) => {
      const step = element.querySelector("a")?.getBoundingClientRect();
      return {
        step: step?.left ?? 0,
        trail: element.getBoundingClientRect().left,
        overflow: element.scrollWidth - element.clientWidth,
      };
    });
    test.expect(geometry.step).toBeGreaterThanOrEqual(geometry.trail);
    test.expect(geometry.overflow).toBe(0);
  });
});
