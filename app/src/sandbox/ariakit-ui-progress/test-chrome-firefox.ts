import {
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7476
  test("preserves inset progress geometry with one outer edge in forced colors", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async () => {
      for (const title of ["Default", "Ring with label", "Borderless track"]) {
        const track = query(q.article(title)).progressbar();
        await test.expect(track).toHaveCSS("border-top-width", "0px");
        await test.expect(track).toHaveCSS("outline-width", "1px");
        await test.expect(track).toHaveCSS("outline-style", "solid");
        const geometry = await track.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            width: box.width,
            height: box.height,
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
          };
        });
        test
          .expect(Math.abs(geometry.width - geometry.clientWidth))
          .toBeLessThan(1);
        test
          .expect(Math.abs(geometry.height - geometry.clientHeight))
          .toBeLessThan(1);
        if (title !== "Ring with label") continue;
        const disc = await track.evaluate((element) => {
          const after = getComputedStyle(element, "::after");
          return {
            inset: Number.parseFloat(after.top),
            width: Number.parseFloat(after.width),
            outline: after.outlineWidth,
          };
        });
        test.expect(disc.inset).toBeGreaterThan(0);
        test.expect(disc.width).toBeCloseTo(geometry.width - disc.inset * 2);
        test.expect(disc.outline).toBe("1px");
      }
    });
  });
});
