import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("toggle layer and text classes", async ({ page, perf }) => {
    await perf.measure(async () => {
      await page.evaluate(() => {
        const sections = document.querySelectorAll<HTMLElement>(
          "section[aria-labelledby]",
        );
        for (const section of sections) {
          section.classList.toggle("ak-layer-20");
          section.classList.toggle("ak-layer-80");
          section.classList.toggle("*:ak-text");
          section.classList.toggle("*:ak-text-red-600");
          section.classList.toggle("*:ak-text-blue-600");
          section.classList.toggle("ak-frame-p-0");
          section.classList.toggle("ak-frame-p-4");
        }
      });
    });
  });
});
