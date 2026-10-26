import type { Locator } from "@playwright/test";

/**
 * Returns the WCAG relative luminance of a gamma-encoded sRGB color with
 * channels from 0 to 1.
 */
export function getRelativeLuminance([red, green, blue]: number[]) {
  const linearize = (value = 0) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)
  );
}

/**
 * Returns the WCAG contrast ratio between two gamma-encoded sRGB colors.
 */
export function getContrastRatio(color: number[], otherColor: number[]) {
  const luminance = getRelativeLuminance(color);
  const otherLuminance = getRelativeLuminance(otherColor);
  return (
    (Math.max(luminance, otherLuminance) + 0.05) /
    (Math.min(luminance, otherLuminance) + 0.05)
  );
}

/**
 * Returns the background of an element painted over the background of a surface
 * behind it, and the surface background, in 8-bit sRGB. Without a surface, it
 * uses the closest ancestor that paints a background.
 */
export async function getPaintedBackgrounds(
  element: Locator,
  surface?: Locator,
) {
  const surfaceColor = await (surface ?? element).evaluate(
    (node, hasSurface) => {
      const isPainted = (color: string) =>
        color !== "transparent" &&
        color !== "rgba(0, 0, 0, 0)" &&
        !/\/ 0\)$/.test(color);
      if (hasSurface) {
        return getComputedStyle(node).backgroundColor;
      }
      let ancestor = node.parentElement;
      while (ancestor) {
        const color = getComputedStyle(ancestor).backgroundColor;
        if (isPainted(color)) {
          return color;
        }
        ancestor = ancestor.parentElement;
      }
      throw new Error("Missing surface");
    },
    !!surface,
  );
  // A canvas paints the computed colors the way the page does, including a
  // translucent background over the surface, and reads them back in 8-bit sRGB.
  // No DOM state exposes the colors that people see.
  return element.evaluate((node, surfaceColor) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Missing 2D context");
    }
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
    const color = getComputedStyle(node).backgroundColor;
    return {
      background: paint(surfaceColor, color),
      surface: paint(surfaceColor),
    };
  }, surfaceColor);
}

/**
 * Returns the WCAG contrast between the painted background of an element and
 * the background of a surface behind it. Without a surface, it uses the closest
 * ancestor that paints a background.
 */
export async function getBackgroundContrast(
  element: Locator,
  surface?: Locator,
) {
  const painted = await getPaintedBackgrounds(element, surface);
  return getContrastRatio(painted.background, painted.surface);
}
