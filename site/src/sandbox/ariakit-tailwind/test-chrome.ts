import { AxeBuilder } from "@axe-core/playwright";
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface OklchChannels {
  a: number;
  c: number;
  h: number;
  l: number;
}

interface LogicalSideMetrics {
  blockEnd: number;
  blockStart: number;
  inlineEnd: number;
  inlineStart: number;
}

type RawLogicalSideMetrics = {
  [key in keyof LogicalSideMetrics]: string | number;
};

interface CornerRadiusMetrics {
  bottomLeft: number;
  bottomRight: number;
  topLeft: number;
  topRight: number;
}

type RawCornerRadiusMetrics = {
  [key in keyof CornerRadiusMetrics]: string | number;
};

interface FrameBoxMetrics {
  border: number;
  corners: CornerRadiusMetrics;
  margin: LogicalSideMetrics;
  padding: LogicalSideMetrics;
  ring: number;
}

interface RawFrameBoxMetrics {
  border: string | number;
  corners: RawCornerRadiusMetrics;
  margin: RawLogicalSideMetrics;
  padding: RawLogicalSideMetrics;
  ring: string | number;
}

interface FrameMetrics {
  frame: FrameBoxMetrics;
  parent: FrameBoxMetrics;
}

type StyleProperty =
  | "backgroundColor"
  | "borderColor"
  | "color"
  | "outlineColor";

function getHueDistance(a: number, b: number) {
  const distance = Math.abs(a - b);
  return Math.min(distance, 360 - distance);
}

function parseOklch(color: string): OklchChannels {
  const match = color.match(
    /oklch\(\s*(?<l>\d+(?:\.\d+)?)\s+(?<c>\d+(?:\.\d+)?)\s+(?<h>\d+(?:\.\d+)?)(?:\s*\/\s*(?<a>\d+(?:\.\d+)?))?\s*\)/,
  );
  if (!match?.groups) {
    throw new Error(`Invalid oklch color: ${color}`);
  }
  const { groups } = match;
  if (!groups.l || !groups.c || !groups.h) {
    throw new Error(`Missing oklch channels: ${color}`);
  }
  return {
    l: parseFloat(groups.l),
    c: parseFloat(groups.c),
    h: parseFloat(groups.h),
    a: groups.a ? parseFloat(groups.a) : 1,
  };
}

async function getColorChannels(
  locator: Locator,
  property: StyleProperty = "color",
) {
  const value = await locator.evaluate(
    (el, styleProperty) => String(getComputedStyle(el)[styleProperty] ?? ""),
    property,
  );
  return parseOklch(value);
}

async function getLightness(
  locator: Locator,
  property: StyleProperty = "backgroundColor",
) {
  const channels = await getColorChannels(locator, property);
  return channels.l;
}

async function getParentLightness(
  locator: Locator,
  property: StyleProperty = "backgroundColor",
) {
  const parentColor = await locator.evaluate((el, styleProperty) => {
    const parent = el.parentElement?.closest<HTMLElement>(".ak-layer");
    if (!parent) {
      throw new Error("Parent layer not found");
    }
    return String(getComputedStyle(parent)[styleProperty] ?? "");
  }, property);
  return parseOklch(parentColor).l;
}

async function getLightnessDiff(
  locator: Locator,
  property: StyleProperty = "backgroundColor",
) {
  const lightness = await getLightness(locator, property);
  const parentLightness = await getParentLightness(locator, property);
  return Math.abs(lightness - parentLightness);
}

function parseLength(value: number | string, name: string) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function parseLogicalSideMetrics(
  metrics: RawLogicalSideMetrics,
  name: string,
): LogicalSideMetrics {
  return {
    blockEnd: parseLength(metrics.blockEnd, `${name} block end`),
    blockStart: parseLength(metrics.blockStart, `${name} block start`),
    inlineEnd: parseLength(metrics.inlineEnd, `${name} inline end`),
    inlineStart: parseLength(metrics.inlineStart, `${name} inline start`),
  };
}

function parseCornerRadiusMetrics(
  metrics: RawCornerRadiusMetrics,
  name: string,
): CornerRadiusMetrics {
  return {
    bottomLeft: parseLength(metrics.bottomLeft, `${name} bottom left radius`),
    bottomRight: parseLength(
      metrics.bottomRight,
      `${name} bottom right radius`,
    ),
    topLeft: parseLength(metrics.topLeft, `${name} top left radius`),
    topRight: parseLength(metrics.topRight, `${name} top right radius`),
  };
}

function parseFrameBoxMetrics(
  metrics: RawFrameBoxMetrics,
  name: string,
): FrameBoxMetrics {
  return {
    border: parseLength(metrics.border, `${name} border`),
    corners: parseCornerRadiusMetrics(metrics.corners, name),
    margin: parseLogicalSideMetrics(metrics.margin, `${name} margin`),
    padding: parseLogicalSideMetrics(metrics.padding, `${name} padding`),
    ring: parseLength(metrics.ring, `${name} ring`),
  };
}

function getChildFrame(root: Locator) {
  return root.locator(":scope > .ak-frame").first();
}

async function getFrameMetrics(locator: Locator): Promise<FrameMetrics> {
  const metrics = await locator.evaluate((element) => {
    const frame = element.closest<HTMLElement>(".ak-frame");
    if (!frame) {
      throw new Error("Frame not found");
    }
    const parent = frame.parentElement?.closest<HTMLElement>(".ak-frame");
    if (!parent) {
      throw new Error("Parent frame not found");
    }
    const readFrameBoxMetrics = (node: HTMLElement) => {
      const style = getComputedStyle(node);
      return {
        border: style.borderWidth,
        ring: style.getPropertyValue("--ak-frame-ring").trim() || "0px",
        corners: {
          bottomLeft: style.borderBottomLeftRadius,
          bottomRight: style.borderBottomRightRadius,
          topLeft: style.borderTopLeftRadius,
          topRight: style.borderTopRightRadius,
        },
        margin: {
          blockEnd: style.marginBlockEnd,
          blockStart: style.marginBlockStart,
          inlineEnd: style.marginInlineEnd,
          inlineStart: style.marginInlineStart,
        },
        padding: {
          blockEnd: style.paddingBlockEnd,
          blockStart: style.paddingBlockStart,
          inlineEnd: style.paddingInlineEnd,
          inlineStart: style.paddingInlineStart,
        },
      };
    };
    return {
      frame: readFrameBoxMetrics(frame),
      parent: readFrameBoxMetrics(parent),
    };
  });
  return {
    frame: parseFrameBoxMetrics(metrics.frame, "frame"),
    parent: parseFrameBoxMetrics(metrics.parent, "parent"),
  };
}

function expectLogicalSides(
  actual: LogicalSideMetrics,
  expected: Partial<LogicalSideMetrics>,
) {
  for (const [key, value] of Object.entries(expected)) {
    expect(actual[key as keyof LogicalSideMetrics]).toBe(value);
  }
}

function expectUniformLogicalSides(actual: LogicalSideMetrics, value: number) {
  expectLogicalSides(actual, {
    blockEnd: value,
    blockStart: value,
    inlineEnd: value,
    inlineStart: value,
  });
}

function expectCornerRadii(
  actual: CornerRadiusMetrics,
  expected: Partial<CornerRadiusMetrics>,
) {
  for (const [key, value] of Object.entries(expected)) {
    expect(actual[key as keyof CornerRadiusMetrics]).toBe(value);
  }
}

function expectUniformCornerRadii(actual: CornerRadiusMetrics, value: number) {
  expectCornerRadii(actual, {
    bottomLeft: value,
    bottomRight: value,
    topLeft: value,
    topRight: value,
  });
}

function getUniformCornerRadius(corners: CornerRadiusMetrics) {
  const radius = corners.topLeft;
  expectCornerRadii(corners, {
    bottomLeft: radius,
    bottomRight: radius,
    topRight: radius,
  });
  return radius;
}

function getMaxCornerRadius(corners: CornerRadiusMetrics) {
  return Math.max(
    corners.topLeft,
    corners.topRight,
    corners.bottomLeft,
    corners.bottomRight,
  );
}

function getExpectedNestedRadius(frame: FrameBoxMetrics) {
  return Math.max(
    getMaxCornerRadius(frame.corners) -
      frame.padding.inlineStart -
      frame.border,
    0,
  );
}

function getOverflowInset(parent: FrameBoxMetrics, frame: FrameBoxMetrics) {
  return parent.padding.inlineStart + parent.border + parent.ring - frame.ring;
}

function expectBetween(value: number, min: number, max: number) {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme} scheme`, () => {
      test.use({ colorScheme: scheme });
      const isDark = scheme === "dark";

      test("no color contrast violations (WCAG AA)", async ({ page }) => {
        test.setTimeout(60_000);
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test.only("text alpha stays on the layer text only", async ({ q }) => {
        const region = q.region("0 frame-cover");
        const qq = query(region);
        const [title, plain, text10] = await Promise.all([
          getColorChannels(qq.text("0 frame-cover")),
          getColorChannels(qq.text("text plain")),
          getColorChannels(qq.text("text 10")),
        ]);
        expect(JSON.stringify(title, null, 2)).toMatchSnapshot(
          `${scheme}-title.json`,
        );
        // When not using ak-text, ak-text-<number> impacts alpha.
        expect(title.l).toBe(isDark ? 1 : 0);
        expectBetween(title.a, 0.6, 0.65);
        // When using ak-text, ak-text-<number> impacts lightness.
        expect(plain.a).toBe(1);
        expectBetween(plain.l, isDark ? 0.72 : 0.48, isDark ? 0.73 : 0.49);
        expect(text10.a).toBe(1);
        expectBetween(text10.l, isDark ? 0.72 : 0.48, isDark ? 0.73 : 0.49);
      });

      test("brand text samples render actual colored text", async ({ q }) => {
        const region = q.region("brand 0 text color").first();
        const plainText = region.getByText("text plain", { exact: true });
        const redText = region.getByText("text red", { exact: true });
        const layerText = region.getByText("text layer", { exact: true });
        const [layerChannels, plainChannels, redChannels, layerTextChannels] =
          await Promise.all([
            getColorChannels(region, "backgroundColor"),
            getColorChannels(plainText),
            getColorChannels(redText),
            getColorChannels(layerText),
          ]);
        expect(plainChannels.c).toBeGreaterThan(0.01);
        expect(redChannels.c).toBeGreaterThan(0.02);
        expect(layerTextChannels.c).toBeGreaterThan(0.01);
        expect(
          getHueDistance(layerTextChannels.h, layerChannels.h),
        ).toBeLessThan(10);
        expect(getHueDistance(redChannels.h, layerChannels.h)).toBeGreaterThan(
          15,
        );
        expect(Math.abs(layerTextChannels.l - layerChannels.l)).toBeGreaterThan(
          0.25,
        );
      });

      test("text min/max utilities still keep text separated from the layer", async ({
        q,
      }) => {
        const region = q.region("brand 50 text limits").first();
        const limitedText = region.getByText("text limits", { exact: true });
        const [textChannels, layerChannels] = await Promise.all([
          getColorChannels(limitedText),
          getColorChannels(region, "backgroundColor"),
        ]);
        expect(textChannels.c).toBeGreaterThan(0.01);
        expect(Math.abs(textChannels.l - layerChannels.l)).toBeGreaterThan(
          0.25,
        );
      });

      test("brand warm and cool text utilities render different hues", async ({
        q,
      }) => {
        const coolRegion = q
          .region("brand 20 text cool border tone cool")
          .first();
        const warmRegion = q.region("brand 30 text warm outline warm").first();
        const coolText = coolRegion.getByText("text cool", { exact: true });
        const warmText = warmRegion.getByText("text warm", { exact: true });
        const [coolChannels, warmChannels] = await Promise.all([
          getColorChannels(coolText),
          getColorChannels(warmText),
        ]);
        expect(coolChannels.c).toBeGreaterThan(0.02);
        expect(warmChannels.c).toBeGreaterThan(0.02);
        expect(getHueDistance(coolChannels.h, warmChannels.h)).toBeGreaterThan(
          20,
        );
      });

      test("brand saturate and desaturate render different chroma", async ({
        q,
      }) => {
        const region = q.region("brand 40 text chroma").first();
        const saturatedText = region.getByText("text saturate", {
          exact: true,
        });
        const desaturatedText = region.getByText("text desaturate", {
          exact: true,
        });
        const [saturatedChannels, desaturatedChannels] = await Promise.all([
          getColorChannels(saturatedText),
          getColorChannels(desaturatedText),
        ]);
        expect(saturatedChannels.c).toBeGreaterThan(0.02);
        expect(saturatedChannels.c).toBeGreaterThan(desaturatedChannels.c);
      });

      test("state-20 has 0.2 lightness distance from state-0", async ({
        q,
      }) => {
        const stateScale = q.region("ak-state-<number>").first();
        const state0 = query(stateScale).region("0").first();
        const state20 = query(state0).region("20");
        const diff = await getLightnessDiff(state20);
        expect(diff).toBeGreaterThanOrEqual(0.15);
        expect(diff).toBeLessThanOrEqual(0.21);
      });

      test("plain ak-layer-brand stays on the nearest safe side", async ({
        q,
      }) => {
        const brandSection = q.region("ak-layer-brand").first();
        const brandLayer = query(brandSection).region("0").first();
        const brandLightness = await getLightness(brandLayer);
        expect(brandLightness).toBeLessThan(0.567);
      });

      test("frame-cover keeps the child frame aligned with its parent geometry", async ({
        q,
      }) => {
        const region = q.region("0 frame-cover").first();
        const childFrame = getChildFrame(region);
        const nestedFrame = query(region).region("20").first();
        const [childMetrics, nestedMetrics] = await Promise.all([
          getFrameMetrics(childFrame),
          getFrameMetrics(nestedFrame),
        ]);
        const parentRadius = getUniformCornerRadius(
          childMetrics.parent.corners,
        );
        const childRadius = Math.max(
          parentRadius - childMetrics.parent.border,
          0,
        );
        const inset = childMetrics.parent.padding.inlineStart;
        expectUniformLogicalSides(childMetrics.parent.padding, 2);
        expect(childMetrics.parent.border).toBeCloseTo(0, 4);
        expect(childMetrics.parent.ring).toBeCloseTo(0, 4);
        expectUniformLogicalSides(childMetrics.frame.padding, 2);
        expectLogicalSides(childMetrics.frame.margin, {
          blockEnd: -inset,
          blockStart: 0,
          inlineEnd: -inset,
          inlineStart: -inset,
        });
        expect(childMetrics.frame.border).toBeCloseTo(0, 4);
        expect(childMetrics.frame.ring).toBeCloseTo(0, 4);
        expectCornerRadii(childMetrics.frame.corners, {
          bottomLeft: childRadius,
          bottomRight: childRadius,
          topLeft: 0,
          topRight: 0,
        });
        expectUniformCornerRadii(
          nestedMetrics.frame.corners,
          getExpectedNestedRadius(childMetrics.frame),
        );
      });

      test("frame-overflow includes the parent border in the child frame geometry", async ({
        q,
      }) => {
        const region = q.region("10 frame-overflow border").first();
        const childFrame = getChildFrame(region);
        const nestedFrame = query(region).region("20").first();
        const [childMetrics, nestedMetrics] = await Promise.all([
          getFrameMetrics(childFrame),
          getFrameMetrics(nestedFrame),
        ]);
        const parentRadius = getUniformCornerRadius(
          childMetrics.parent.corners,
        );
        const inset = getOverflowInset(childMetrics.parent, childMetrics.frame);
        const childRadius = Math.max(
          parentRadius - childMetrics.parent.border,
          0,
        );
        expectUniformLogicalSides(childMetrics.parent.padding, 2);
        expect(childMetrics.parent.border).toBeCloseTo(1, 4);
        expect(childMetrics.parent.ring).toBeCloseTo(0, 4);
        expectUniformLogicalSides(childMetrics.frame.padding, 2);
        expectLogicalSides(childMetrics.frame.margin, {
          blockEnd: -inset,
          blockStart: 0,
          inlineEnd: -inset,
          inlineStart: -inset,
        });
        expect(childMetrics.frame.border).toBeCloseTo(0, 4);
        expect(childMetrics.frame.ring).toBeCloseTo(0, 4);
        expectCornerRadii(childMetrics.frame.corners, {
          bottomLeft: childRadius,
          bottomRight: childRadius,
          topLeft: 0,
          topRight: 0,
        });
        expectUniformCornerRadii(
          nestedMetrics.frame.corners,
          getExpectedNestedRadius(childMetrics.frame),
        );
      });

      test("frame-overflow bordering compensates for the child ring in light mode", async ({
        q,
      }) => {
        const region = q.region("20 frame-overflow bordering").first();
        const childFrame = getChildFrame(region);
        const nestedFrame = query(region).region("20").first();
        const [childMetrics, nestedMetrics] = await Promise.all([
          getFrameMetrics(childFrame),
          getFrameMetrics(nestedFrame),
        ]);
        const parentRadius = getUniformCornerRadius(
          childMetrics.parent.corners,
        );
        const inset = getOverflowInset(childMetrics.parent, childMetrics.frame);
        const childRadius = Math.max(
          parentRadius - childMetrics.parent.border,
          0,
        );
        expectUniformLogicalSides(childMetrics.parent.padding, 2);
        expectUniformLogicalSides(childMetrics.frame.padding, 2);
        if (scheme === "light") {
          expect(childMetrics.parent.border).toBeCloseTo(0, 4);
          expect(childMetrics.parent.ring).toBeCloseTo(1, 4);
          expectLogicalSides(childMetrics.frame.margin, {
            blockEnd: -inset,
            blockStart: 0,
            inlineEnd: -inset,
            inlineStart: -inset,
          });
          expect(childMetrics.frame.border).toBeCloseTo(0, 4);
          expect(childMetrics.frame.ring).toBeCloseTo(1, 4);
          expectCornerRadii(childMetrics.frame.corners, {
            bottomLeft: childRadius,
            bottomRight: childRadius,
            topLeft: 0,
            topRight: 0,
          });
          expectUniformCornerRadii(
            nestedMetrics.frame.corners,
            getExpectedNestedRadius(childMetrics.frame),
          );
          return;
        }
        expect(childMetrics.parent.border).toBeCloseTo(1, 4);
        expect(childMetrics.parent.ring).toBeCloseTo(0, 4);
        expectLogicalSides(childMetrics.frame.margin, {
          blockEnd: -inset,
          blockStart: 0,
          inlineEnd: -inset,
          inlineStart: -inset,
        });
        expect(childMetrics.frame.border).toBeCloseTo(1, 4);
        expect(childMetrics.frame.ring).toBeCloseTo(0, 4);
        expectCornerRadii(childMetrics.frame.corners, {
          bottomLeft: childRadius,
          bottomRight: childRadius,
          topLeft: 0,
          topRight: 0,
        });
        expectUniformCornerRadii(
          nestedMetrics.frame.corners,
          getExpectedNestedRadius(childMetrics.frame),
        );
      });

      test("negative frame-m keeps descendant geometry aligned without CSS margins", async ({
        q,
      }) => {
        const region = q.region("30 frame-m").first();
        const childFrame = getChildFrame(region);
        const nestedFrame = query(region).region("20").first();
        const [childMetrics, nestedMetrics] = await Promise.all([
          getFrameMetrics(childFrame),
          getFrameMetrics(nestedFrame),
        ]);
        const parentRadius = getUniformCornerRadius(
          childMetrics.parent.corners,
        );
        expectUniformLogicalSides(childMetrics.parent.padding, 2);
        expect(childMetrics.parent.border).toBeCloseTo(0, 4);
        expectUniformLogicalSides(childMetrics.frame.margin, 0);
        expectUniformLogicalSides(childMetrics.frame.padding, 2);
        expect(childMetrics.frame.border).toBeCloseTo(0, 4);
        expectUniformCornerRadii(childMetrics.frame.corners, parentRadius);
        expectUniformCornerRadii(
          nestedMetrics.frame.corners,
          getExpectedNestedRadius(childMetrics.frame),
        );
      });

      test("frame-cover row start applies only the start-side corners", async ({
        q,
      }) => {
        const frame = q.region("cover row start target").first();
        const metrics = await getFrameMetrics(frame);
        const parentRadius = getUniformCornerRadius(metrics.parent.corners);
        const inset = metrics.parent.padding.inlineStart;
        const childRadius = Math.max(parentRadius - metrics.parent.border, 0);
        expectUniformLogicalSides(metrics.parent.padding, 2);
        expect(metrics.parent.border).toBeCloseTo(0, 4);
        expectUniformLogicalSides(metrics.frame.padding, 2);
        expectLogicalSides(metrics.frame.margin, {
          blockEnd: -inset,
          blockStart: -inset,
          inlineEnd: 0,
          inlineStart: -inset,
        });
        expectCornerRadii(metrics.frame.corners, {
          bottomLeft: childRadius,
          bottomRight: 0,
          topLeft: childRadius,
          topRight: 0,
        });
      });

      test("frame-overflow col end applies only the end-side corners", async ({
        q,
      }) => {
        const frame = q.region("overflow col end target").first();
        const metrics = await getFrameMetrics(frame);
        const parentRadius = getUniformCornerRadius(metrics.parent.corners);
        const inset = getOverflowInset(metrics.parent, metrics.frame);
        const childRadius = Math.max(parentRadius - metrics.parent.border, 0);
        expectUniformLogicalSides(metrics.parent.padding, 2);
        expect(metrics.parent.border).toBeCloseTo(1, 4);
        expect(metrics.parent.ring).toBeCloseTo(0, 4);
        expectUniformLogicalSides(metrics.frame.padding, 2);
        expectLogicalSides(metrics.frame.margin, {
          blockEnd: -inset,
          blockStart: 0,
          inlineEnd: -inset,
          inlineStart: -inset,
        });
        expectCornerRadii(metrics.frame.corners, {
          bottomLeft: childRadius,
          bottomRight: childRadius,
          topLeft: 0,
          topRight: 0,
        });
      });

      test("border tone and outline variants resolve to visible colors", async ({
        q,
      }) => {
        const neutralOutline = q.region("40 frame-ring outline-20").first();
        const brandOutline = q
          .region("brand 10 border tone outline red")
          .first();
        const neutralOutlineChannels = await getColorChannels(
          neutralOutline,
          "outlineColor",
        );
        const brandBorderChannels = await getColorChannels(
          brandOutline,
          "borderColor",
        );
        const brandOutlineChannels = await getColorChannels(
          brandOutline,
          "outlineColor",
        );
        const outlineWidth = await neutralOutline.evaluate(
          (el) => getComputedStyle(el).outlineWidth,
        );
        expect(outlineWidth).toBe("2px");
        expect(neutralOutlineChannels.a).toBeGreaterThan(0.5);
        expect(brandBorderChannels.c).toBeGreaterThan(0.02);
        expect(brandOutlineChannels.c).toBeGreaterThan(0.02);
      });
    });
  }
});
