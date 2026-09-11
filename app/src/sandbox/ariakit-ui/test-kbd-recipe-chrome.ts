import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getStyle(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      background: style.backgroundColor,
      borderTop: style.borderTopColor,
      borderBottom: style.borderBottomColor,
      edge: style.getPropertyValue("--ak-edge").trim(),
    };
  });
}

/** Reads the lightness channel of an `oklch()` color. */
function getLightness(color: string) {
  const [lightness = ""] = color.slice("oklch(".length).split(" ");
  return Number.parseFloat(lightness);
}

/** Reads the chroma channel of an `oklch()` color. */
function getChroma(color: string) {
  const [, chroma = ""] = color.slice("oklch(".length).split(" ");
  return Number.parseFloat(chroma);
}

// The cap colors come from relative colors that every engine resolves the same
// way, so Chrome is enough.
withFramework(
  import.meta.dirname,
  { route: "kbd" },
  async ({ query, test }) => {
    test("draws an inverted cap for its dark face on a light page", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ colorScheme: "light" });
      const style = await getStyle(
        query(q.article("Inverted cap")).text("Esc"),
      );
      // The drawing followed the light page: a white hairline over the dark
      // face and a lip cut 0.17 below it, down to oklch(0.06).
      test.expect(style.borderTop).toBe("oklch(1 0 0 / 0)");
      test.expect(getLightness(style.background)).toBeCloseTo(0.23, 2);
      test.expect(getLightness(style.borderBottom)).toBeCloseTo(0.15, 2);
    });

    test("draws an inverted cap for its light face on a dark page", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      const style = await getStyle(
        query(q.article("Inverted cap")).text("Esc"),
      );
      // The drawing followed the dark page: a lip cut only 0.08 below the light
      // face, to oklch(0.88), which barely separates from it.
      test.expect(getLightness(style.background)).toBeCloseTo(0.96, 2);
      test.expect(getLightness(style.borderBottom)).toBeCloseTo(0.79, 2);
    });

    test("draws a brand cap for its dark face on a light page", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ colorScheme: "light" });
      const style = await getStyle(query(q.article("Brand cap")).text("K"));
      // The white hairline of a light cap sat on the dark brand face.
      test.expect(style.borderTop).toBe("oklch(1 0 0 / 0)");
      test
        .expect(getLightness(style.borderBottom))
        .toBeCloseTo(getLightness(style.background) - 0.08, 2);
    });

    test("keeps the lip deeper than the hairline in small text", async ({
      q,
    }) => {
      const cap = query(q.article("Small text")).text("Esc");
      await test.expect(cap).toHaveCSS("border-top-width", "1px");
      // The lip rounded down to 1px, as thin as the hairline.
      await test.expect(cap).toHaveCSS("border-bottom-width", "2px");
    });

    test("paints no face on a transparent cap", async ({ q }) => {
      const cap = query(q.article("Transparent cap")).text("Tab");
      // The default offset marked the transparent layer as modified, so it
      // painted the same face as a default cap.
      await test.expect(cap).toHaveCSS("background-color", /\/ 0\)$/);
    });

    test("keeps a named edge color at the lightness of the default ring", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ colorScheme: "light" });
      const style = await getStyle(query(q.article("Brand edge")).text("Tab"));
      const defaultStyle = await getStyle(
        query(q.article("Default")).text("K"),
      );
      // Without the push, the cap's lightening took the brand ring to white.
      test
        .expect(getLightness(style.edge))
        .toBeCloseTo(getLightness(defaultStyle.edge), 2);
      test.expect(getChroma(style.edge)).toBeGreaterThan(0.1);
    });

    test("draws a raw edge in the exact color", async ({ q }) => {
      const style = await getStyle(
        query(q.article("Raw brand edge")).text("Tab"),
      );
      // The cap's default lightening took the raw brand ring to white.
      test.expect(style.edge).toMatch(/^oklch\(0\.567 0\.1546 248\.51\d*\)$/);
    });
  },
);
