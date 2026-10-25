import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const SURFACES = [
  "light canvas",
  "light tinted surface",
  "dark canvas",
  "dark tinted surface",
];

const FLOORED_FIELDS = [
  "Default edge",
  "Transparent edge",
  "Recessed field",
  "Raised ring field",
  "Recessed ring field",
  "Warning edge",
  "Danger edge",
  "Translucent edge",
];

function getRelativeLuminance([red, green, blue]: number[]) {
  const linearize = (value = 0) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)
  );
}

/**
 * Returns the WCAG contrast between the painted edge of the field and the
 * background of the surface around the field. A border paints over the field
 * background, and a ring paints over the surface.
 */
async function getEdgeContrast(field: Locator) {
  // A canvas paints the computed colors the way the page does, including the
  // translucent edge over its backdrop, and reads them back in 8-bit sRGB. No
  // DOM state exposes the contrast that people see.
  const [edge, surface] = await field.evaluate((element) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Missing 2D context");
    const paint = (...colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      return [...context.getImageData(0, 0, 1, 1).data]
        .slice(0, 3)
        .map((value) => value / 255);
    };
    const style = getComputedStyle(element);
    const surfaceElement = element.parentElement?.closest("section");
    if (!surfaceElement) throw new Error("Missing surface");
    const surfaceColor = getComputedStyle(surfaceElement).backgroundColor;
    // The ring has the border color, and a ring field has no border width.
    const backdrop =
      style.borderTopWidth === "0px" ? surfaceColor : style.backgroundColor;
    return [paint(backdrop, style.borderTopColor), paint(surfaceColor)];
  });
  const edgeLuminance = getRelativeLuminance(edge);
  const surfaceLuminance = getRelativeLuminance(surface);
  return (
    (Math.max(edgeLuminance, surfaceLuminance) + 0.05) /
    (Math.min(edgeLuminance, surfaceLuminance) + 0.05)
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  // The floor is 3:1, raised by half in contrast-more, and scaled toward 1:1 by
  // the default disabled contrast scale of 0.25.
  for (const [contrast, target, disabledTarget] of [
    ["no-preference", 3, 1.5],
    ["more", 4.5, 1 + (3 * (1 + 0.5 * 0.25) - 1) * 0.25],
  ] as const) {
    // https://github.com/ariakit/ariakit/issues/8050
    test(`edges reach the floor against the surface (${contrast})`, async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ contrast });
      for (const surface of SURFACES) {
        for (const name of FLOORED_FIELDS) {
          const label = `${name} on ${surface}`;
          await expect
            .poll(() => getEdgeContrast(q.textbox(label)), { message: label })
            .toBeGreaterThanOrEqual(target);
        }
        const label = `Disabled field on ${surface}`;
        await expect
          .poll(() => getEdgeContrast(q.textbox(label)), { message: label })
          .toBeGreaterThanOrEqual(disabledTarget);
      }
    });
  }

  // https://github.com/ariakit/ariakit/issues/8050
  test("keeps an edge that passes", async ({ q }) => {
    const floored = q.textbox("Danger edge on light canvas");
    const regular = q.textbox("Danger edge without floor on light canvas");
    expect(await getEdgeContrast(regular)).toBeGreaterThanOrEqual(3);
    expect(await getEdgeContrast(floored)).toBeCloseTo(
      await getEdgeContrast(regular),
      2,
    );
  });

  // A raw edge without a color has the layer color at full alpha, as on a
  // checked checkbox. The floor can only raise alpha, so the edge keeps its
  // color.
  // https://github.com/ariakit/ariakit/issues/8050
  test("keeps the color of a raw edge without a color", async ({ q }) => {
    for (const surface of SURFACES) {
      const floored = q.textbox(`Raw layer edge on ${surface}`);
      const regular = q.textbox(`Raw layer edge without floor on ${surface}`);
      expect(await getEdgeContrast(floored)).toBeCloseTo(
        await getEdgeContrast(regular),
        2,
      );
    }
  });

  // https://github.com/ariakit/ariakit/issues/8050
  test("raises only the alpha of a neutral edge", async ({ q }) => {
    // Black or white with no chroma and an alpha under 1. Engines can serialize
    // float noise, such as 4.8e-7 for 0.
    for (const [surface, lightness] of [
      ["light canvas", 0],
      ["dark canvas", 1],
    ] as const) {
      const field = q.textbox(`Default edge on ${surface}`);
      const edge = await field.evaluate(
        (element) => getComputedStyle(element).borderTopColor,
      );
      const channels = /^oklch\((\S+) (\S+) \S+ \/ (\S+)\)$/.exec(edge);
      expect(channels, edge).not.toBeNull();
      const [, l = "", c = "", alpha = ""] = channels ?? [];
      expect(Number(l)).toBeCloseTo(lightness, 3);
      expect(Number(c)).toBeCloseTo(0, 3);
      expect(Number(alpha)).toBeLessThan(1);
    }
  });

  // https://github.com/ariakit/ariakit/issues/8050
  test("makes a colored edge solid", async ({ q }) => {
    for (const surface of SURFACES) {
      const field = q.textbox(`Translucent edge on ${surface}`);
      const edge = await field.evaluate(
        (element) => getComputedStyle(element).borderTopColor,
      );
      expect(edge).not.toContain("/");
    }
  });
});
