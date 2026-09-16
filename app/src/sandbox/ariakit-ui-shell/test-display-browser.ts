import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 800, height: 900 } });

  for (const control of ["button", "breakpoint"]) {
    // https://github.com/ariakit/ariakit/pull/7533#discussion_r4020205511
    test(`removes the closed sidebar layout box and reopens through ${control} folds`, async ({
      page,
      q,
      browserName,
    }) => {
      await selectScenario(q, "geometry");
      const body = q.navigation("Layout navigation", { includeHidden: true });
      const column = getSidebar(q, "Layout navigation");
      const toggle = q.button("Toggle layout navigation");
      await expect(body).toHaveCSS("display", "none");
      expect(await body.boundingBox()).toBeNull();
      await toggle.click();
      await expect(column).toHaveCSS("width", "192px");

      for (const open of [false, true]) {
        // Sample before the interaction so runner latency cannot skip the fold.
        await using recording = await body.evaluateHandle((node, open) => {
          const column = node.parentElement;
          if (!column) {
            throw new Error("Missing sidebar column");
          }
          const samples: { width: number; display: string }[] = [];
          const finished = new Promise<typeof samples>((resolve) => {
            const sample = () => {
              const width = column.getBoundingClientRect().width;
              samples.push({ width, display: getComputedStyle(node).display });
              if (width === (open ? 192 : 0)) {
                resolve(samples);
              } else {
                requestAnimationFrame(sample);
              }
            };
            sample();
          });
          return { finished };
        }, open);
        if (control === "button") {
          await toggle.click();
        } else {
          await page.setViewportSize({ width: open ? 800 : 740, height: 900 });
        }
        const samples = await recording.evaluate(({ finished }) => finished);
        const folding = samples.filter(({ width }) => width > 0 && width < 192);
        expect(folding.length).toBeGreaterThan(0);
        // Firefox cannot transition display yet. WebKit cancels the exit
        // transition when the surrounding query container changes size. Both
        // may hide immediately, but reopening must never grow empty.
        if (open || browserName === "chromium") {
          for (const sample of folding) {
            expect(sample.display).not.toBe("none");
          }
        }
        if (open) {
          await expect(body).toBeVisible();
        } else {
          await expect(body).toHaveCSS("display", "none");
          expect(await body.boundingBox()).toBeNull();
          await expect(q.navigation("Layout navigation")).toHaveCount(0);
        }
      }
    });
  }
});
