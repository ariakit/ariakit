import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { PNG } from "pngjs";
import { withFramework } from "#app/test-utils/preview.ts";

interface Point {
  x: number;
  y: number;
}

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Missing box");
  }
  return box;
}

// Reads the rendered pixels on a line from one point of the page to another,
// one per CSS pixel, in 8-bit sRGB. The Chrome project renders at one device
// pixel per CSS pixel.
async function getPixels(page: Page, from: Point, to: Point) {
  const x = Math.floor(Math.min(from.x, to.x));
  const y = Math.floor(Math.min(from.y, to.y));
  const width = Math.floor(Math.max(from.x, to.x)) - x + 1;
  const height = Math.floor(Math.max(from.y, to.y)) - y + 1;
  const buffer = await page.screenshot({ clip: { x, y, width, height } });
  const { data } = PNG.sync.read(buffer);
  const pixels: number[][] = [];
  for (let index = 0; index < width * height; index++) {
    pixels.push([...data.subarray(index * 4, index * 4 + 3)]);
  }
  return pixels;
}

function getDistance(color: number[], otherColor: number[]) {
  let distance = 0;
  for (const [index, value] of color.entries()) {
    distance += Math.abs(value - (otherColor[index] ?? 0));
  }
  return distance;
}

// Returns the pixel on a line across an edge that differs most from the
// surface. Frames can sit at half-pixel positions, and the browser snaps their
// edges to whole pixels on either side.
async function getEdgePixel(
  page: Page,
  from: Point,
  to: Point,
  surface: number[],
) {
  let edge = surface;
  for (const pixel of await getPixels(page, from, to)) {
    if (getDistance(pixel, surface) <= getDistance(edge, surface)) continue;
    edge = pixel;
  }
  return edge;
}

// Paints CSS colors over each other on a canvas, the way the page composites
// them, and returns the result in 8-bit sRGB. A style property resolves var()
// and color functions first, since a canvas accepts only plain colors.
function paintColors(element: Locator, colors: string[]) {
  return element.evaluate((node, colors) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!(node instanceof HTMLElement) || !context) {
      throw new Error("Missing element or 2D context");
    }
    for (const color of colors) {
      node.style.outlineColor = color;
      context.fillStyle = getComputedStyle(node).outlineColor;
      node.style.outlineColor = "";
      context.fillRect(0, 0, 1, 1);
    }
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, colors);
}

function expectSameColor(actual: number[], expected: number[]) {
  for (const [index, value] of expected.entries()) {
    // Allow one level for color conversion rounding.
    expect(Math.abs((actual[index] ?? -1) - value)).toBeLessThanOrEqual(1);
  }
}

// Samples the surface just outside the cover, the parent edge above the cover,
// and the cover's left edge, across each edge.
async function getEdgePixels(
  page: Page,
  parentFrame: Locator,
  coverFrame: Locator,
  width: number,
) {
  const parent = await getBox(parentFrame);
  const cover = await getBox(coverFrame);
  const middle = cover.y + cover.height / 2;
  const center = parent.x + parent.width / 2;
  const [outside = []] = await getPixels(
    page,
    { x: cover.x - 3, y: middle },
    { x: cover.x - 3, y: middle },
  );
  return {
    parent,
    cover,
    outside,
    parentEdge: await getEdgePixel(
      page,
      { x: center, y: parent.y - width - 2 },
      { x: center, y: parent.y + 1 },
      outside,
    ),
    coverEdge: await getEdgePixel(
      page,
      { x: cover.x - 1, y: middle },
      { x: cover.x + width + 1, y: middle },
      outside,
    ),
  };
}

const RING_CASES = [
  ["Ring", 1],
  ["Ring with a lighter cover", 1],
  ["Ring with a darker cover", 1],
  ["Ring on a lighter parent", 1],
  ["Wide ring", 4],
  ["Bold ring", 1],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  test.describe("light", () => {
    test.use({ colorScheme: "light" });

    test("draws a parent ring as a border that looks like the ring", async ({
      page,
      q,
    }) => {
      for (const [label, width] of RING_CASES) {
        await expect(q.region(label)).toHaveCSS(
          "--ak-frame-ring",
          `${width}px`,
        );
        const cover = q.region(`${label} cover`);
        await expect(cover).toHaveCSS("border-left-width", `${width}px`);
        await expect(cover).toHaveCSS("--ak-frame-ring", "0px");
        const pixels = await getEdgePixels(page, q.region(label), cover, width);
        // The border lies on the parent ring and covers it.
        expect(pixels.cover.x).toBe(pixels.parent.x - width);
        // Lighter and darker covers paint the parent surface under the border,
        // so the border composites like the parent ring.
        expectSameColor(pixels.coverEdge, pixels.parentEdge);
      }
    });

    test("leaves no rim under a hidden ring", async ({ page, q }) => {
      const pixels = await getEdgePixels(
        page,
        q.region("Hidden ring"),
        q.region("Hidden ring cover"),
        1,
      );
      expectSameColor(pixels.coverEdge, pixels.outside);
    });

    test("counts the contrast boost once", async ({ page, q }) => {
      for (const contrast of ["no-preference", "more"] as const) {
        await page.emulateMedia({ contrast });
        const edge = await q
          .region("Ring")
          .evaluate((element) =>
            getComputedStyle(element).getPropertyValue("--ak-edge"),
          );
        await expect(q.region("Ring cover")).toHaveCSS(
          "border-left-color",
          edge,
        );
        const pixels = await getEdgePixels(
          page,
          q.region("Ring"),
          q.region("Ring cover"),
          1,
        );
        expectSameColor(pixels.coverEdge, pixels.parentEdge);
      }
    });

    test("keeps explicit edge weights", async ({ q }) => {
      await expect(q.region("Explicit weight cover")).toHaveCSS(
        "border-left-color",
        /\/ 0\.2\)$/,
      );
      await expect(q.region("Raw edge cover")).not.toHaveCSS(
        "border-left-color",
        /\//,
      );
    });

    test("paints a chosen backdrop under the border", async ({ page, q }) => {
      const cover = q.region("Chosen backdrop cover");
      const expected = await cover.evaluate((element) => {
        const style = getComputedStyle(element);
        return [
          style.getPropertyValue("--color-red-200"),
          style.borderLeftColor,
        ];
      });
      const pixels = await getEdgePixels(
        page,
        q.region("Chosen backdrop"),
        cover,
        1,
      );
      expectSameColor(pixels.coverEdge, await paintColors(cover, expected));
    });

    test("publishes the surface under each frame edge", async ({ q }) => {
      const parentLayer = await paintColors(q.region("Ring"), [
        "var(--ak-layer)",
      ]);
      for (const label of ["Ring", "Ring with a lighter cover"]) {
        // A ring paints over the parent layer.
        expectSameColor(
          await paintColors(q.region(label), ["var(--ak-frame-backdrop)"]),
          await paintColors(q.region(label), ["var(--ak-layer-parent)"]),
        );
        // A border on a parent ring paints over the backdrop.
        expectSameColor(
          await paintColors(q.region(`${label} cover`), [
            "var(--ak-frame-backdrop)",
          ]),
          parentLayer,
        );
      }
      // A plain border paints over the element's own layer.
      const cover = q.region("Border cover");
      expectSameColor(
        await paintColors(cover, ["var(--ak-frame-backdrop)"]),
        await paintColors(cover, ["var(--ak-layer)"]),
      );
      expectSameColor(
        await paintColors(q.region("Chosen backdrop cover"), [
          "var(--ak-frame-backdrop)",
        ]),
        await paintColors(q.region("Chosen backdrop cover"), [
          "var(--color-red-200)",
        ]),
      );
    });

    test("draws a cover with a margin like a ring over the parent layer", async ({
      page,
      q,
    }) => {
      const cover = q.region("Cover with a margin cover");
      await expect(cover).toHaveCSS("border-left-width", "1px");
      await expect(cover).toHaveCSS("--ak-frame-ring", "0px");
      // The margin keeps the cover inside the parent, over the parent layer,
      // which is also the backdrop, so the border looks like the parent ring.
      const pixels = await getEdgePixels(
        page,
        q.region("Cover with a margin"),
        cover,
        1,
      );
      expect(pixels.cover.x).toBeGreaterThan(pixels.parent.x);
      expectSameColor(pixels.coverEdge, pixels.parentEdge);
    });

    test("keeps an inherited ring without the backdrop", async ({ q }) => {
      const cover = q.region("Without backdrop cover");
      await expect(cover).toHaveCSS("border-left-width", "0px");
      await expect(cover).toHaveCSS("--ak-frame-ring", "1px");
      await expect(cover).toHaveCSS("background-image", "none");
    });

    test("paints nothing with the backdrop alone", async ({ q }) => {
      const cover = q.region("Backdrop only cover");
      await expect(cover).toHaveCSS("border-left-width", "0px");
      await expect(cover).toHaveCSS("--ak-frame-ring", "0px");
      // Any background layers stay transparent without an inherited edge.
      const colors = await cover.evaluate(
        (element) =>
          getComputedStyle(element).backgroundImage.match(/oklch\([^)]*\)/g) ??
          [],
      );
      for (const color of colors) {
        expect(color).toMatch(/\/ 0\)$/);
      }
    });

    test("draws no border under a parent without an edge", async ({ q }) => {
      await expect(q.region("No edge cover")).toHaveCSS(
        "border-left-width",
        "0px",
      );
    });
  });

  test.describe("dark", () => {
    test.use({ colorScheme: "dark" });

    test("keeps a plain border on a parent border", async ({ page, q }) => {
      for (const [label, width] of RING_CASES) {
        await expect(q.region(label)).toHaveCSS("--ak-frame-ring", "0px");
        const cover = q.region(`${label} cover`);
        await expect(cover).toHaveCSS("border-left-width", `${width}px`);
        const expected = await cover.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.borderLeftColor];
        });
        const pixels = await getEdgePixels(page, q.region(label), cover, width);
        expectSameColor(pixels.coverEdge, await paintColors(cover, expected));
      }
    });
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(colorScheme, () => {
      test.use({ colorScheme });

      test("keeps the parent edge width in forced colors", async ({
        page,
        q,
      }) => {
        await page.emulateMedia({ forcedColors: "active" });
        for (const [label, width] of RING_CASES) {
          const cover = q.region(`${label} cover`);
          await expect(cover).toHaveCSS("border-left-width", `${width}px`);
          // Forced colors remove the gradients under the border.
          await expect(cover).toHaveCSS("background-image", /^none(, none)*$/);
        }
      });
    });
  }
});
