import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("page load", async ({ perf }) => {
    await perf.measurePageLoad();
  });

  test("toggle layer and text classes", async ({ page, perf }) => {
    await perf.measure(async () => {
      await page.evaluate(() => {
        const sections = document.querySelectorAll<HTMLElement>(
          "section[aria-labelledby]",
        );
        for (const section of sections) {
          section.classList.toggle("ak-layer-20");
          section.classList.toggle("ak-state-20");
          section.classList.toggle("ak-layer-push-10");
          section.classList.toggle("ak-layer-lighten-10");
          section.classList.toggle("ak-layer-darken-10");
          section.classList.toggle("ak-layer-mix-10");
          section.classList.toggle("ak-layer-saturate-10");
          section.classList.toggle("ak-layer-desaturate-10");
          section.classList.toggle("*:ak-text");
          section.classList.toggle("*:ak-text-red-600");
          section.classList.toggle("ak-frame-p-4");
        }
      });
    });
  });
});
