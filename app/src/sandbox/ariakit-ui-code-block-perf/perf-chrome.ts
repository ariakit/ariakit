import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

// The lightness of a computed lch() or oklch() color, from 0 to 100.
function getLightness(locator: Locator) {
  return locator.evaluate((element) => {
    const color = getComputedStyle(element).color;
    const value = Number.parseFloat(color.replace(/^[a-z]+\(/, ""));
    return color.startsWith("oklch(") && value <= 1 ? value * 100 : value;
  });
}

function getKeyword(q: Query, title: string) {
  return query(q.region(title)).text("export").first();
}

withFramework(import.meta.dirname, async ({ test }) => {
  // Every token adapts its theme color to the layer of its line, so a layer
  // switch restyles every token of the block.
  test("switch the layer of a code block", async ({ perf }) => {
    await perf.measure(
      async ({ q }) => {
        await q.button("Light layer").click();
        await expect(q.button("Light layer")).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        // Tokens on a light layer get dark colors.
        await expect
          .poll(() => getLightness(getKeyword(q, "format-price.ts")))
          .toBeLessThan(50);
      },
      {
        setup: async ({ page, q }) => {
          await page.setViewportSize({ width: 1280, height: 800 });
          await expect
            .poll(() => getLightness(getKeyword(q, "format-price.ts")))
            .toBeGreaterThan(50);
        },
      },
    );
  });

  // A file that loads on demand, or a tab panel that renders when selected,
  // styles all its tokens at once.
  test("insert a code block with 1,000 tokens", async ({ perf }) => {
    await perf.measure(
      async ({ q }) => {
        await q.button("Insert a file").click();
        await expect(q.region("inserted.ts")).toBeVisible();
        await expect
          .poll(() => getLightness(getKeyword(q, "inserted.ts")))
          .toBeGreaterThan(50);
      },
      {
        setup: async ({ page, q }) => {
          await page.setViewportSize({ width: 1280, height: 800 });
          await expect(q.region("format-price.ts")).toBeVisible();
        },
        verify: ({ q }) =>
          expect(
            query(q.region("inserted.ts")).text("formatPrice29"),
          ).toBeAttached(),
      },
    );
  });
});
