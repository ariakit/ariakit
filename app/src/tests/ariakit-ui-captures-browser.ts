import { resolve } from "node:path";
import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// Cover both the compact grid and the tall grid that used row-group captures.
for (const sandbox of ["ariakit-ui-code", "ariakit-ui-button"]) {
  withCaptures(
    resolve(import.meta.dirname, "../sandbox", sandbox),
    async ({ test }) => {
      test(`${sandbox} captures each card separately`, async ({ page, q }) => {
        const boxes = q.main().locator(":scope > article");
        const count = await boxes.count();
        test.expect(count).toBeGreaterThan(1);
        await forEachColorScheme(page, async (colorScheme) => {
          const items: string[] = [];
          await capturePage({
            page,
            colorScheme,
            item: `${sandbox}/page`,
            // Inspect the capture boundary without taking local baselines.
            visual: async ({ element, item, fullPage, clipMargin, styles }) => {
              if (!element || typeof element === "string") {
                throw new Error("Expected a card locator");
              }
              await test.expect(element).toHaveCount(1);
              await test.expect(element).toHaveRole("article");
              test.expect(item).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/);
              if (item === `${sandbox}/page/default`) {
                await test.expect(element).toHaveAccessibleName("Default");
              }
              if (item === `${sandbox}/page/on-a-brand-layer`) {
                await test
                  .expect(element)
                  .toHaveAccessibleName("On a brand layer");
              }
              test.expect(fullPage).toBe(true);
              test.expect(clipMargin).toBe(8);
              test.expect(styles).toEqual({ [colorScheme]: {} });
              items.push(item);
            },
          });
          test.expect(items).toHaveLength(count);
          test.expect(new Set(items).size).toBe(count);
          test.expect(items).toContain(`${sandbox}/page/default`);
          test.expect(items).toContain(`${sandbox}/page/on-a-brand-layer`);
        });
      });
    },
  );
}
