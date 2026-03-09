import type { Value, VarProperty } from "./lib.ts";
import {
  at,
  createContext,
  createNamespace,
  createVar,
  createVariant,
  fn,
  rule,
  set,
} from "./lib.ts";

// These identifiers mirror OKLCH channel names used by `fn.oklch(from ...)`.
const l = "l";
const c = "c";
const h = "h";

const CHROMA_MAX_SRGB = 0.32;
const CHROMA_MAX_P3 = 0.368;
const CHROMA_MAX_REC2020 = 0.467;
const CHROMA_MAX = CHROMA_MAX_P3;

const DARK_THRESHOLD_L = 0.645;
const CONTRAST_HIGH = 100;

const LA_BASE = 0.55;
const LB_BASE = 0.725;
const L_SPREAD_RATIO = 0.15;
const FORBIDDEN_RANGE_LA_MIN = 0.2;
const FORBIDDEN_RANGE_LB_MAX = 0.9;

const DARK_HIGH_MAX_L = roundToDecimals(LA_BASE / 2, 4);
const LIGHT_LOW_MAX_L = roundToDecimals((LB_BASE + 0.99) / 2, 4);
const BAND_LEVEL_DARK_HIGH = 0;
const BAND_LEVEL_DARK_LOW = 0.25;
const BAND_LEVEL_MID = 0.5;
const BAND_LEVEL_LIGHT_LOW = 0.75;
const BAND_LEVEL_LIGHT_HIGH = 1;

const TEXT_MIN_CONTRAST = 0.5;
const OUTLINE_MIN_CONTRAST = 0.5;

const CONTRAST_SCALE = 0.3334;
const TEXT_CONTRAST_L = fn.inflate(fn.sub(DARK_THRESHOLD_L, l));
const DARK_L = fn.clamp01(TEXT_CONTRAST_L);
const LIGHT_L = fn.clamp01(fn.invert(TEXT_CONTRAST_L));

const LA_SPREAD = L_SPREAD_RATIO * LA_BASE;
const LB_SPREAD = L_SPREAD_RATIO * (1 - LB_BASE);
// Calibrate contrast so `contrastT=1` reaches the configured hard bounds.
const LA_SPREAD_CONTRAST_SCALE = roundToDecimals(
  (LA_BASE - FORBIDDEN_RANGE_LA_MIN) / LA_SPREAD,
  4,
);
const LB_SPREAD_CONTRAST_SCALE = roundToDecimals(
  (FORBIDDEN_RANGE_LB_MAX - LB_BASE) / LB_SPREAD,
  4,
);

const CHROMA_TOKEN_OPTIONS = { max: 40 };
const HUE_TOKEN_OPTIONS = { max: 360, step: 15 };
const QUANTIZED_LIGHTNESS_STEPS = 8;
const QUANTIZED_LIGHTNESS_INTERVAL = 1 / QUANTIZED_LIGHTNESS_STEPS;
const FRAME_PADDING_CAP = "1rem";

const utilities = new Set<ReturnType<typeof ak.utility>>();

/**
 * Registers an `ak` utility and stores it for the exported input list.
 */
function utility(...args: Parameters<typeof ak.utility>) {
  const registeredUtility = ak.utility(...args);
  utilities.add(registeredUtility);
  return registeredUtility;
}

interface NumbersOptions {
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Builds quoted numeric tokens for `--value()` utility ranges.
 */
function getNumberTokens({
  min = 0,
  max = 100,
  step = 5,
}: NumbersOptions = {}) {
  return Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, index) => `"${min + index * step}"`,
  ).join(", ");
}

/**
 * Returns quoted numeric tokens for the most common spacing values, with finer
 * steps for smaller values and coarser steps for larger values.
 */
function getSpacingNumberTokens() {
  return [
    getNumberTokens({ max: 4, step: 0.5 }),
    getNumberTokens({ min: 5, max: 12, step: 1 }),
    getNumberTokens({ min: 14, max: 64, step: 4 }),
    getNumberTokens({ min: 72, max: 96, step: 8 }),
  ];
}

/**
 * Parses a numeric utility token such as `10` or `45`.
 */
function getNumericTokenValue(pattern: string, options?: NumbersOptions) {
  return fn.value("number", pattern, getNumberTokens(options));
}

/**
 * Parses a numeric utility token and converts it to a 0..1 percentage.
 */
function getPercentTokenValue(pattern: string, options?: NumbersOptions) {
  return fn.div(getNumericTokenValue(pattern, options), 100);
}

/**
 * Returns declaration children with their values negated. Used to derive
 * inverse utilities from the positive definitions.
 */
function getNegatedDeclarations(utilityRule: ReturnType<typeof utility>) {
  return utilityRule.children
    .filter((child) => child.type === "declaration")
    .map((child) => {
      if (child.value == null) return;
      return set(child.property, fn.neg(child.value));
    })
    .filter((child) => child != null);
}

/**
 * Rounds a number to a specified number of decimal places.
 */
function roundToDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Returns whether `value` is within `[min, max]`
 */
function getRangeMask(value: Value, min: number, max: number) {
  return fn.mul(
    fn.binary(fn.sub(value, min - 1e-6)),
    fn.binary(fn.sub(max, value)),
  );
}

/**
 * Returns whether `l` is inside the forbidden lightness interval. The value is
 * 0 outside `[la, lb]` and approaches 1 inside it.
 */
function getForbiddenRangeMask(
  currentLightness: Value,
  lowerBoundary: Value,
  upperBoundary: Value,
) {
  return fn.binary(
    fn.mul(
      fn.sub(currentLightness, lowerBoundary),
      fn.sub(upperBoundary, currentLightness),
    ),
  );
}

/**
 * Returns which forbidden boundary should be used for `l`. The result is 0 on
 * the lower side and 1 on the upper side.
 */
function getForbiddenBoundaryDirection(
  currentLightness: Value,
  lowerBoundary: Value,
  upperBoundary: Value,
) {
  return fn.binary(
    fn.sub(currentLightness, fn.half(fn.add(lowerBoundary, upperBoundary))),
  );
}

/**
 * Keeps lightness outside the forbidden interval. When `l` enters it, the value
 * is blended toward `la` or `lb`.
 */
function getSafeLightness(
  currentLightness: Value,
  lowerBoundary: Value,
  upperBoundary: Value,
) {
  const forbiddenBoundaryDirection = getForbiddenBoundaryDirection(
    currentLightness,
    lowerBoundary,
    upperBoundary,
  );
  const forbiddenRangeMask = getForbiddenRangeMask(
    currentLightness,
    lowerBoundary,
    upperBoundary,
  );
  return fn.add(
    fn.mul(currentLightness, fn.invert(forbiddenRangeMask)),
    fn.mul(
      fn.add(
        fn.mul(lowerBoundary, fn.invert(forbiddenBoundaryDirection)),
        fn.mul(upperBoundary, forbiddenBoundaryDirection),
      ),
      forbiddenRangeMask,
    ),
  );
}

/**
 * Computes an automatic lightness delta that avoids forbidden lightness. If the
 * next lightness enters the forbidden interval, we either flip direction or
 * clamp to the entry boundary, whichever yields more lightness distance from
 * the original layer color.
 */
function getAutoLightness(
  delta: Value,
  direction: Value,
  lowerBoundary: Value,
  upperBoundary: Value,
  toLight: Value,
) {
  const normalDelta = fn.mul(delta, direction);
  const nextLightness = fn.add(l, normalDelta);
  const inForbidden = getForbiddenRangeMask(
    nextLightness,
    lowerBoundary,
    upperBoundary,
  );
  // Flipped result clamped to valid lightness range.
  const flippedDelta = fn.neg(normalDelta);
  const flippedL = fn.clamp01(fn.add(l, flippedDelta));
  // Directional distance: sign is only meaningful when inForbidden=1
  // where travel direction is well-defined, so we can avoid abs() which
  // would duplicate the sub-expression in max(x, -x).
  const flippedDist = fn.mul(fn.sub(l, flippedL), direction);
  // Entry boundary: the near side of the forbidden range from the current
  // travel direction. Going lighter hits lowerBoundary first; going darker
  // hits upperBoundary first.
  const entryBoundary = fn.add(
    fn.mul(lowerBoundary, toLight),
    fn.mul(upperBoundary, fn.invert(toLight)),
  );
  const boundaryDelta = fn.sub(entryBoundary, l);
  const boundaryDist = fn.mul(boundaryDelta, direction);
  // Only flip if it produces more distance from the original lightness.
  const shouldFlip = fn.binary(fn.sub(flippedDist, boundaryDist));
  // When forbidden: blend between boundary and flipped deltas.
  // Using a + x*(b-a) instead of a*(1-x) + b*x so shouldFlip appears once.
  const forbiddenDelta = fn.add(
    boundaryDelta,
    fn.mul(shouldFlip, fn.sub(flippedDelta, boundaryDelta)),
  );
  // Blend between normal and forbidden deltas.
  // Same rearrangement so inForbidden appears once instead of three times.
  return fn.add(
    normalDelta,
    fn.mul(inForbidden, fn.sub(forbiddenDelta, normalDelta)),
  );
}

/**
 * Blends separate light and dark values by the active appearance weights.
 */
function lightDark(light: Value, dark: Value) {
  return fn.add(fn.mul(vars.lightL, light), fn.mul(vars.darkL, dark));
}

/**
 * Returns all CSS color interpolation methods for `color-mix()`.
 */
function getColorMixMethods() {
  const rectangular = [
    "srgb",
    "srgb-linear",
    "display-p3",
    "a98-rgb",
    "prophoto-rgb",
    "rec2020",
    "lab",
    "oklab",
    "xyz",
    "xyz-d50",
    "xyz-d65",
  ];
  const polar = ["hsl", "hwb", "lch", "oklch"];
  const hueStrategies = ["shorter", "longer", "increasing", "decreasing"];
  return [
    ...rectangular,
    ...polar.flatMap((space) => [
      space,
      ...hueStrategies.map((strategy) => `${space} ${strategy} hue`),
    ]),
  ];
}

const ak = createNamespace("ak");
const _ak = createNamespace("_ak");
const hue = createNamespace("hue");
const chroma = createNamespace("chroma");
const mix = createNamespace("mix");
const color = createNamespace("color");
const spacing = createNamespace("spacing");
const radius = createNamespace("radius");

const contrast = createVar("--contrast", 0);
const globalContrastT = fn.div(fn.relu(contrast), CONTRAST_HIGH);
const normalizedChroma = fn.div(fn.min(c, CHROMA_MAX), CHROMA_MAX);

// Band membership expressions — depend only on `l` and fixed constants.
const bandDarkHigh = getRangeMask(l, 0, DARK_HIGH_MAX_L);
const bandDarkLow = getRangeMask(l, DARK_HIGH_MAX_L, LA_BASE);
const bandLightLow = getRangeMask(l, LB_BASE, LIGHT_LOW_MAX_L);
const bandLightHigh = fn.binary(fn.sub(l, LIGHT_LOW_MAX_L));

// Constants registered once as @property initial values. They only depend on
// color channels or fixed numeric constants.
const constantMathVars = {
  textContrastL: _ak.prop("tcl", { initial: TEXT_CONTRAST_L }),
  forbiddenLaBase: _ak.prop("flab", {
    initial: fn.sub(LA_BASE, fn.mul(normalizedChroma, LA_SPREAD)),
  }),
  forbiddenLbBase: _ak.prop("flbb", {
    initial: fn.add(LB_BASE, fn.mul(normalizedChroma, LB_SPREAD)),
  }),
  autoLDirection: _ak.prop("ald", { initial: fn.sub(DARK_L, LIGHT_L) }),
  darkL: _ak.prop("dal", { initial: DARK_L }),
  lightL: _ak.prop("lil", { initial: LIGHT_L }),
  bandDarkHigh: _ak.prop("bdh", { initial: bandDarkHigh }),
  bandDarkLow: _ak.prop("bdl", { initial: bandDarkLow }),
  bandLightLow: _ak.prop("bll", { initial: bandLightLow }),
  bandLightHigh: _ak.prop("blh", { initial: bandLightHigh }),
};

// Utility-assigned math values. These depend on other vars and are resolved in
// @utility ak-layer.
const layerMathVars = {
  contrastT: _ak.prop("ct"),
  negativeContrastT: _ak.prop("nct"),
  layerContrastBias: _ak.prop("lcb"),
  forbiddenLa: _ak.prop("fla"),
  forbiddenLb: _ak.prop("flb"),
  safeL: _ak.prop("sl"),
  autoDirectionToLight: _ak.prop("adtl"),
  autoDirectionToDark: _ak.prop("adtd"),
  directionalBoundaryL: _ak.prop("dbl"),
  layerIdleAutoDelta: _ak.prop("liad"),
  layerAutoDelta: _ak.prop("lad"),
  layerIdleContrastValue: _ak.prop("licv"),
  layerContrastValue: _ak.prop("lcv"),
  edgeContrastDirection: _ak.prop("ecd", { initial: -1 }),
};

// Theme-level tokens consumed by --value(--chroma-*) and --value(--hue-*).
const themeTokenVars = {
  chromaSrgbMax: chroma.var("srgb-max", CHROMA_MAX_SRGB),
  chromaP3Max: chroma.var("p3-max", CHROMA_MAX_P3),
  chromaRec2020Max: chroma.var("rec2020-max", CHROMA_MAX_REC2020),
  hueWarm: hue.var("warm", 90),
  hueCool: hue.var("cool", 220),
};

// Color pipeline stages and exported visual tokens.
const layerColorVars = {
  layerIdleBase: _ak.prop.canvas("lib"),
  layerIdleMixed: _ak.prop.canvas("lim"),
  layerIdleAuto: _ak.prop.canvas("lia"),
  layerIdle: _ak.prop.canvas("li"),
  layerL: _ak.prop.canvas("ll", { inherits: true }),
  layerScheme: _ak.prop.black("ls", { inherits: true }),
  layerBand: _ak.prop.black("lbd", { inherits: true }),
  layerBase: _ak.prop.canvas("lb"),
  layerAuto: _ak.prop.canvas("la"),
  layerContrast: _ak.prop.canvas("lc"),
  layer: ak.prop.canvas("layer", { inherits: true }),
  layerParentContext: _ak.var("lpc"),
  layerParent: ak.var("layer-parent", "canvas"),
  edge: ak.prop.black("edge"),
  text: ak.prop.black("text", { inherits: true }),
  outline: ak.var("outline", "canvastext"),
};

const textMathVars = {
  textContrastDirection: _ak.prop("tcd", { initial: 1 }),
  textParentL: _ak.prop("tpl", { initial: 0 }),
  textChromaCap: _ak.prop("tcc", { initial: 0.4 }),
};

const outlineMathVars = {
  outlineContrastDirection: _ak.prop("ocd", { initial: 1 }),
  outlineParentL: _ak.prop("opl", { initial: 0 }),
};

const frameVars = {
  frameRadius: ak.prop.len("frame-radius", {
    inherits: true,
    initial: "0px",
  }),
  framePadding: ak.prop.len("frame-padding", {
    inherits: true,
    initial: "0px",
  }),
  frameMargin: ak.prop.len("frame-margin", { initial: "0px" }),
  frameBorder: ak.prop.len("frame-border", { initial: "0px" }),
  frameRing: ak.prop.len("frame-ring", { initial: "0px" }),
  frameParentRadiusContext: _ak.var("fprc"),
  frameParentPaddingContext: _ak.var("fppc"),
  frameParentBorderContext: _ak.var("fpbc"),
  frameParentRingContext: _ak.var("fpgc"),
};

const vars = {
  contrast,
  ...constantMathVars,
  ...layerMathVars,
  ...themeTokenVars,
  ...layerColorVars,
  ...textMathVars,
  ...outlineMathVars,
  ...frameVars,
};

const inputs = {
  layerColor: _ak.prop("layer-color"),
  layerIdleAutoL: _ak.prop("layer-idle-auto-lightness", { initial: 0 }),
  layerIdleRelativeL: _ak.prop("layer-idle-relative-lightness", { initial: 0 }),
  layerIdleRelativeC: _ak.prop("layer-idle-relative-chroma", { initial: 0 }),
  layerIdleRelativeH: _ak.prop("layer-idle-relative-hue", { initial: 0 }),
  layerIdleContrastL: _ak.prop("layer-idle-contrast-lightness", { initial: 0 }),
  layerL: _ak.prop("layer-lightness"),
  layerC: _ak.prop("layer-chroma"),
  layerH: _ak.prop("layer-hue"),
  layerLMin: _ak.prop("layer-lightness-min", { initial: 0 }),
  layerLMax: _ak.prop("layer-lightness-max", { initial: 1 }),
  layerCMin: _ak.prop("layer-chroma-min", { initial: 0 }),
  layerCMax: _ak.prop("layer-chroma-max", vars.chromaP3Max),
  layerAutoL: _ak.prop("layer-auto-lightness", { initial: 0 }),
  layerRelativeL: _ak.prop("layer-relative-lightness", { initial: 0 }),
  layerRelativeC: _ak.prop("layer-relative-chroma", { initial: 0 }),
  layerRelativeH: _ak.prop("layer-relative-hue", { initial: 0 }),
  layerContrastL: _ak.prop("layer-contrast-lightness", { initial: 0 }),
  layerMix: _ak.prop("layer-mix"),
  layerMixMethod: _ak.prop("layer-mix-method", "oklab"),
  layerMixAmount: _ak.prop("layer-mix-amount", "50%"),
  layerMixColor: _ak.prop("layer-mix-color", vars.layerParent),
  edgeColor: _ak.prop("edge-color"),
  edgeRelativeL: _ak.prop("edge-relative-lightness", { initial: 0 }),
  edgeRelativeC: _ak.prop("edge-relative-chroma", { initial: 0 }),
  edgeRelativeH: _ak.prop("edge-relative-hue", { initial: 0 }),
  edgeContrastL: _ak.prop("edge-contrast-lightness", { initial: 1 }),
  edgeL: _ak.prop("edge-lightness"),
  edgeC: _ak.prop("edge-chroma"),
  edgeH: _ak.prop("edge-h"),
  edgeA: _ak.prop("edge-alpha", { initial: 0.1 }),
  textContrastL: _ak.prop("text-contrast-lightness", { initial: 0 }),
  textA: _ak.prop("text-alpha", { initial: 1 }),
  textColor: _ak.prop("text-color"),
  textRelativeL: _ak.prop("text-relative-lightness", { initial: 0 }),
  textRelativeC: _ak.prop("text-relative-chroma", { initial: 0 }),
  textRelativeH: _ak.prop("text-relative-hue", { initial: 0 }),
  textL: _ak.prop("text-lightness"),
  textLMin: _ak.prop("text-lightness-min", { initial: 0 }),
  textLMax: _ak.prop("text-lightness-max", { initial: 1 }),
  textC: _ak.prop("text-chroma"),
  textCMin: _ak.prop("text-chroma-min", { initial: 0 }),
  textCMax: _ak.prop("text-chroma-max", vars.chromaP3Max),
  textH: _ak.prop("text-hue"),
  outlineContrastL: _ak.prop("outline-contrast-lightness", { initial: 0 }),
  outlineColor: _ak.prop("outline-color"),
  outlineRelativeL: _ak.prop("outline-relative-lightness", { initial: 0 }),
  outlineRelativeC: _ak.prop("outline-relative-chroma", { initial: 0 }),
  outlineRelativeH: _ak.prop("outline-relative-hue", { initial: 0 }),
  outlineL: _ak.prop("outline-lightness"),
  outlineLMin: _ak.prop("outline-lightness-min", { initial: 0 }),
  outlineLMax: _ak.prop("outline-lightness-max", { initial: 1 }),
  outlineC: _ak.prop("outline-chroma"),
  outlineCMin: _ak.prop("outline-chroma-min", { initial: 0 }),
  outlineCMax: _ak.prop("outline-chroma-max", vars.chromaP3Max),
  outlineH: _ak.prop("outline-hue"),
  frameRadius: _ak.prop.len("frame-radius", { initial: "0px" }),
  framePadding: _ak.prop.len("frame-padding", { initial: "0px" }),
  frameMargin: _ak.prop.len("frame-margin", { initial: "0px" }),
  frameBorder: _ak.prop.len("frame-border", { initial: "0px" }),
  frameRing: _ak.prop.len("frame-ring", { initial: "0px" }),
  frameBordering: _ak.prop.len("frame-bordering", { initial: "0px" }),
  frameRow: _ak.prop.number("frame-col", { initial: 0, inherits: true }),
  frameStart: _ak.prop.number("frame-start", { initial: 0 }),
  frameEnd: _ak.prop.number("frame-end", { initial: 0 }),
  frameForce: _ak.prop.number("frame-force", { initial: 0 }),
};

const theme = at.theme(
  set(vars.contrast),
  set(vars.chromaSrgbMax),
  set(vars.chromaP3Max),
  set(vars.chromaRec2020Max),
  set(chroma.var("grayscale", 0)),
  set(chroma.var("muted", 0.05)),
  set(chroma.var("balanced", 0.15)),
  set(chroma.var("vivid", 0.22)),
  set(chroma.var("neon", 0.32)),
  set(vars.hueWarm),
  set(vars.hueCool),
  set(hue.var("red", 29.23)),
  set(hue.var("orange", 70.67)),
  set(hue.var("yellow", 109.77)),
  set(hue.var("green", 142.5)),
  set(hue.var("cyan", 194.77)),
  set(hue.var("blue", 264.05)),
  set(hue.var("magenta", 328.36)),
  set(hue.var("complementary", fn.add(h, 180))),
  set(hue.var("split1", fn.add(h, 150))),
  set(hue.var("split2", fn.sub(h, 150))),
  set(hue.var("analogous1", fn.add(h, 30))),
  set(hue.var("analogous2", fn.sub(h, 30))),
  set(hue.var("triadic1", fn.add(h, 120))),
  set(hue.var("triadic2", fn.sub(h, 120))),
  set(hue.var("tetradic1", fn.add(h, 120))),
  set(hue.var("tetradic2", fn.add(h, 180))),
  set(hue.var("tetradic3", fn.add(h, 300))),
  set(hue.var("square1", fn.add(h, 90))),
  set(hue.var("square2", fn.add(h, 180))),
  set(hue.var("square3", fn.add(h, 270))),
  ...getColorMixMethods().map((method) =>
    set(mix.var(method.replaceAll(" ", "-"), method)),
  ),
);

const dark = createVariant(
  "ak-dark",
  at.container(fn.style(vars.layerScheme, "oklch(1 0 0)"), set("@slot")),
);

const light = createVariant(
  "ak-light",
  at.container(fn.style(vars.layerScheme, "oklch(0 0 0)"), set("@slot")),
);

const darkHigh = createVariant(
  "ak-dark-high",
  at.container(
    fn.style(vars.layerBand, fn.oklch({ l: BAND_LEVEL_DARK_HIGH })),
    set("@slot"),
  ),
);

const darkLow = createVariant(
  "ak-dark-low",
  at.container(
    fn.style(vars.layerBand, fn.oklch({ l: BAND_LEVEL_DARK_LOW })),
    set("@slot"),
  ),
);

const lightLow = createVariant(
  "ak-light-low",
  at.container(
    fn.style(vars.layerBand, fn.oklch({ l: BAND_LEVEL_LIGHT_LOW })),
    set("@slot"),
  ),
);

const lightHigh = createVariant(
  "ak-light-high",
  at.container(
    fn.style(vars.layerBand, fn.oklch({ l: BAND_LEVEL_LIGHT_HIGH })),
    set("@slot"),
  ),
);

const root = rule(
  ":root",
  set.colorScheme("light dark"),
  at.variant("contrast-more", set(vars.contrast, CONTRAST_HIGH)),
);

/**
 * Scales local contrast controls by the global contrast preference.
 */
function getContrastValue(value: Value) {
  return fn.add(value, fn.mul(value, vars.contrastT, 3.334));
}

/**
 * Computes auto lightness using the current forbidden range variables.
 */
function getAutoL(value: Value) {
  return getAutoLightness(
    value,
    vars.autoLDirection,
    vars.forbiddenLa,
    vars.forbiddenLb,
    vars.autoDirectionToLight,
  );
}

/**
 * Applies contrast lightness while stopping at forbidden boundaries.
 * This keeps contrast adjustments from crossing the unsafe lightness band.
 */
function getContrastL(contrastValue: Value) {
  const direction = vars.autoLDirection;
  const lowerBoundary = vars.forbiddenLa;
  const upperBoundary = vars.forbiddenLb;
  const nextLightness = fn.add(l, fn.mul(contrastValue, direction));
  const reachedFromDarkSide = fn.binary(fn.sub(nextLightness, lowerBoundary));
  const reachedFromLightSide = fn.binary(fn.sub(upperBoundary, nextLightness));
  const valueEnabled = fn.binary(contrastValue);
  // Only evaluate the boundary that matches current travel direction.
  const reachedForbiddenRange = fn.mul(
    valueEnabled,
    fn.add(
      fn.mul(vars.autoDirectionToLight, reachedFromDarkSide),
      fn.mul(vars.autoDirectionToDark, reachedFromLightSide),
    ),
  );
  // Once boundary is reached, snap to the directional side of the band.
  const targetLightness = fn.add(
    fn.mul(nextLightness, fn.invert(reachedForbiddenRange)),
    fn.mul(vars.directionalBoundaryL, reachedForbiddenRange),
  );
  return targetLightness;
}

/**
 * Resolves layer lightness from relative offset and optional absolute input.
 */
function getLayerL(relativeLightness: Value, absoluteLightness?: VarProperty) {
  // Preserve the parent lightness as a floor so nested layers do not collapse
  // into black when multiple negative offsets stack.
  const baseLightnessFloor = fn.max(l, fn.min(0.13, relativeLightness));
  const fallbackLightness = fn.add(baseLightnessFloor, relativeLightness);
  return absoluteLightness
    ? fn.var(absoluteLightness, fallbackLightness)
    : fallbackLightness;
}

/**
 * Resolves layer chroma from relative offset and optional absolute input.
 */
function getLayerC(relativeChroma: Value, absoluteChroma?: VarProperty) {
  const fallbackChroma = fn.add(c, relativeChroma);
  return absoluteChroma
    ? fn.var(absoluteChroma, fallbackChroma)
    : fallbackChroma;
}

/**
 * Resolves layer hue from relative offset and optional absolute input.
 */
function getLayerH(relativeHue: Value, absoluteHue?: VarProperty) {
  const fallbackHue = fn.add(h, relativeHue);
  return absoluteHue ? fn.var(absoluteHue, fallbackHue) : fallbackHue;
}

/**
 * Container queries compare exact values, so layer lightness is quantized into
 * fixed buckets before descendants derive text direction from it.
 */
function mapLayerLightnessSteps(
  callback: (
    parentL: number,
    isDark: boolean,
  ) => (ReturnType<typeof set> | undefined)[],
) {
  return Array.from({ length: QUANTIZED_LIGHTNESS_STEPS + 1 }, (_, index) =>
    roundToDecimals(index / QUANTIZED_LIGHTNESS_STEPS, 4),
  ).flatMap((parentL) => {
    const isDark = parentL < DARK_THRESHOLD_L;
    const children = callback(parentL, isDark).filter((child) => child != null);
    if (children.length === 0) {
      return [];
    }
    return at.container(
      fn.style(vars.layerL, fn.oklch({ l: parentL })),
      ...children,
    );
  });
}

const idleLayerChannels = {
  l: getLayerL(inputs.layerIdleRelativeL, inputs.layerL),
  c: getLayerC(inputs.layerIdleRelativeC, inputs.layerC),
  h: getLayerH(inputs.layerIdleRelativeH, inputs.layerH),
};

const stateLayerChannels = {
  l: getLayerL(inputs.layerRelativeL),
  c: getLayerC(inputs.layerRelativeC),
  h: getLayerH(inputs.layerRelativeH),
};

const forbiddenLa = fn.max(
  FORBIDDEN_RANGE_LA_MIN,
  fn.sub(
    vars.forbiddenLaBase,
    fn.mul(vars.contrastT, LA_SPREAD, LA_SPREAD_CONTRAST_SCALE),
  ),
);
const forbiddenLb = fn.min(
  FORBIDDEN_RANGE_LB_MAX,
  fn.add(
    vars.forbiddenLbBase,
    fn.mul(vars.contrastT, LB_SPREAD, LB_SPREAD_CONTRAST_SCALE),
  ),
);

const layerBaseColor = fn.var(inputs.layerColor, vars.layerParent);
const layerIdleBase = fn.oklch(layerBaseColor, idleLayerChannels);
const layerIdleMixed = fn.var(inputs.layerMix, vars.layerIdleBase);
const layerIdleAuto = fn.oklch(vars.layerIdleMixed, {
  l: fn.add(
    fn.clamp(
      inputs.layerLMin,
      getLayerL(vars.layerIdleAutoDelta),
      inputs.layerLMax,
    ),
    vars.layerContrastBias,
  ),
});
const layerIdle = fn.oklch(vars.layerIdleAuto, {
  l: getContrastL(vars.layerIdleContrastValue),
});

const layerBase = fn.oklch(fn.oklch(vars.layerIdle, stateLayerChannels), {
  l: vars.safeL,
});

const layerAuto = fn.oklch(vars.layerBase, {
  l: getLayerL(vars.layerAutoDelta),
});

const layerContrast = fn.oklch(vars.layerAuto, {
  l: getContrastL(vars.layerContrastValue),
});

const layer = fn.oklch(vars.layerContrast, {
  l: vars.safeL,
  c: fn.clamp(inputs.layerCMin, c, inputs.layerCMax),
});

/**
 * Shared declarations needed by both ak-layer and ak-text. Sets contrastT
 * and layerL so that container queries and contrast math work.
 */
function getBaseDeclarations(sourceColor: string | VarProperty) {
  return [
    set(vars.contrastT, globalContrastT),
    set(
      vars.layerL,
      fn.oklch(sourceColor, {
        l: fn.round(l, QUANTIZED_LIGHTNESS_INTERVAL),
        c: 0,
        h: 0,
      }),
    ),
  ];
}

// Assign derived math first so later color stages can reference short vars.
const layerMathDeclarations = [
  set(vars.negativeContrastT, fn.neg(vars.contrastT)),
  set(
    vars.layerContrastBias,
    fn.mul(vars.negativeContrastT, lightDark(-CONTRAST_SCALE, CONTRAST_SCALE)),
  ),
  set(vars.forbiddenLa, forbiddenLa),
  set(vars.forbiddenLb, forbiddenLb),
  set(vars.autoDirectionToLight, fn.clamp01(vars.autoLDirection)),
  set(vars.autoDirectionToDark, fn.clamp01(fn.neg(vars.autoLDirection))),
  set(
    vars.directionalBoundaryL,
    fn.add(
      fn.mul(vars.forbiddenLa, fn.invert(vars.autoDirectionToLight)),
      fn.mul(vars.forbiddenLb, vars.autoDirectionToLight),
    ),
  ),
  set(vars.safeL, getSafeLightness(l, vars.forbiddenLa, vars.forbiddenLb)),
  set(vars.layerIdleAutoDelta, getAutoL(inputs.layerIdleAutoL)),
  set(vars.layerAutoDelta, getAutoL(inputs.layerAutoL)),
  set(vars.layerIdleContrastValue, getContrastValue(inputs.layerIdleContrastL)),
  set(vars.layerContrastValue, getContrastValue(inputs.layerContrastL)),
];

// Build the layered color stages from idle -> base -> auto -> final.
const layerColorDeclarations = [
  set(vars.layerIdleBase, layerIdleBase),
  set(vars.layerIdleMixed, layerIdleMixed),
  set(vars.layerIdleAuto, layerIdleAuto),
  set(vars.layerIdle, layerIdle),
  set(vars.layerBase, layerBase),
  set(vars.layerAuto, layerAuto),
  set(vars.layerContrast, layerContrast),
];

const edgeBaseColor = fn.var(inputs.edgeColor, vars.layer);
const edgeContrastT = fn.var(vars.contrastT, globalContrastT);
// Borders get a small extra push from the global contrast preference so they
// stay perceptible even when the user does not specify an edge contrast value.
const edgeDirectionalDelta = fn.add(
  inputs.edgeContrastL,
  fn.mul(edgeContrastT, 0.12),
);
const edgeDirectionalShift = fn.mul(
  edgeDirectionalDelta,
  vars.edgeContrastDirection,
);
const edgeDirectional = fn.oklch(edgeBaseColor, {
  l: fn.clamp01(fn.add(l, edgeDirectionalShift)),
});
const edgeRelative = fn.oklch(edgeDirectional, {
  l: getLayerL(inputs.edgeRelativeL, inputs.edgeL),
  c: getLayerC(inputs.edgeRelativeC, inputs.edgeC),
  h: getLayerH(inputs.edgeRelativeH, inputs.edgeH),
});
const edge = fn.oklch(edgeRelative, {
  a: fn.clamp01(fn.add(inputs.edgeA, fn.mul(edgeContrastT, 0.5))),
});

// Collapse the continuous layer scale into five semantic buckets so variants
// can target broad tonal ranges instead of exact lightness values.
const layerBandLightness = fn.add(
  BAND_LEVEL_MID,
  fn.mul(vars.bandDarkHigh, BAND_LEVEL_DARK_HIGH - BAND_LEVEL_MID),
  fn.mul(vars.bandDarkLow, BAND_LEVEL_DARK_LOW - BAND_LEVEL_MID),
  fn.mul(vars.bandLightLow, BAND_LEVEL_LIGHT_LOW - BAND_LEVEL_MID),
  fn.mul(vars.bandLightHigh, BAND_LEVEL_LIGHT_HIGH - BAND_LEVEL_MID),
);
const layerBand = fn.oklch(vars.layer, {
  l: layerBandLightness,
  c: 0,
  h: 0,
});
const layerScheme = fn.oklch(vars.layer, {
  l: vars.textContrastL,
  c: 0,
  h: 0,
});

// Min alpha adapts to layer lightness — higher for mid-lightness backgrounds
const textMinAlphaOnLightLayer = fn.div(
  fn.add(53.6, fn.mul(fn.sub(1, l), 85)),
  100,
);
const textMinAlphaOnDarkLayer = fn.div(fn.add(45.7, fn.mul(l, 108)), 100);
const textMinimumAlpha = fn.add(
  lightDark(textMinAlphaOnLightLayer, textMinAlphaOnDarkLayer),
  fn.mul(c, 0.135),
  fn.mul(vars.contrastT, CONTRAST_SCALE),
);
const textAlpha = fn.max(textMinimumAlpha, inputs.textA);
const text = fn.oklch(vars.layer, {
  l: vars.textContrastL,
  c: 0,
  h: 0,
  a: textAlpha,
});

const layerContext = createContext();

utility(
  "layer",
  set.color(vars.text),
  set.borderColor(vars.edge),
  set.backgroundColor(vars.layer),
  at.apply`ring-[color:${vars.edge}]`,
  set(vars.layer, layer),
  set(vars.text, text),
  set(vars.edge, edge),
  set(vars.layerBand, layerBand),
  set(vars.layerScheme, layerScheme),
  getBaseDeclarations(vars.layer),
  layerMathDeclarations,
  layerColorDeclarations,
  at.variant(light, set(vars.edgeContrastDirection, -1)),
  at.variant(dark, set(vars.edgeContrastDirection, 1)),
  layerContext(({ provide, inherit }) => [
    set(provide(vars.layerParentContext), vars.layer),
    set(vars.layerParent, inherit(vars.layerParentContext)),
  ]),
);

utility(
  "layer-*",
  set(inputs.layerC, fn.value(chroma)),
  set(inputs.layerH, fn.value(hue)),
  set(inputs.layerColor, fn.value(color, "[color]")),
  set(inputs.layerIdleAutoL, getPercentTokenValue("[number]")),
);

utility(
  "layer-mix",
  set(
    inputs.layerMix,
    fn.colorMix(
      inputs.layerMixMethod,
      inputs.layerMixColor,
      vars.layerIdleBase,
      inputs.layerMixAmount,
    ),
  ),
);

utility(
  "layer-mix-*",
  set(inputs.layerMixAmount, fn.toPercent(getNumericTokenValue("[number]"))),
  set(inputs.layerMixColor, fn.value(color, "[color]")),
  set(inputs.layerMixMethod, fn.value(mix)),
  set(
    inputs.layerMix,
    fn.colorMix(
      inputs.layerMixMethod,
      inputs.layerMixColor,
      vars.layerIdleBase,
      inputs.layerMixAmount,
    ),
  ),
);

utility("state-*", set(inputs.layerAutoL, getPercentTokenValue("[*]")));

const layerLighten = utility(
  "layer-lighten-*",
  set(inputs.layerIdleRelativeL, getPercentTokenValue("[*]")),
);

utility("layer-darken-*", ...getNegatedDeclarations(layerLighten));

const stateLighten = utility(
  "state-lighten-*",
  set(inputs.layerRelativeL, getPercentTokenValue("[*]")),
);

utility("state-darken-*", ...getNegatedDeclarations(stateLighten));

/**
 * Moves a hue toward a target by percentage on the shortest circular path.
 */
function getHueToward(current: Value, target: Value, amount: Value) {
  // Normalize to [-180, 180] so interpolation follows the shortest arc.
  const delta = fn.sub(fn.mod(fn.add(fn.sub(target, current), 540), 360), 180);
  const percent = fn.clamp01(fn.div(amount, 100));
  return fn.add(current, fn.mul(delta, percent));
}

utility(
  "layer-cool-*",
  set(
    inputs.layerH,
    getHueToward(h, vars.hueCool, getNumericTokenValue("[*]")),
  ),
);

utility(
  "layer-warm-*",
  set(
    inputs.layerH,
    getHueToward(h, vars.hueWarm, getNumericTokenValue("[*]")),
  ),
);

utility(
  "layer-contrast-*",
  set(inputs.layerIdleContrastL, getPercentTokenValue("[*]")),
);

utility(
  "state-contrast-*",
  set(inputs.layerContrastL, getPercentTokenValue("[*]")),
);

utility(
  "layer-max-*",
  set(inputs.layerCMax, fn.value(chroma)),
  set(inputs.layerLMax, fn.value("[*]")),
  set(inputs.layerLMax, getPercentTokenValue("[number]")),
);

utility(
  "layer-min-*",
  set(inputs.layerCMin, fn.value(chroma)),
  set(inputs.layerLMin, fn.value("[*]")),
  set(inputs.layerLMin, getPercentTokenValue("[number]")),
);

utility(
  "layer-max-c-*",
  set(inputs.layerCMax, fn.value("[*]")),
  set(inputs.layerCMax, fn.value(chroma)),
  set(inputs.layerCMax, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "layer-min-c-*",
  set(inputs.layerCMin, fn.value("[*]")),
  set(inputs.layerCMin, fn.value(chroma)),
  set(inputs.layerCMin, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "layer-max-c-auto",
  // Keep chroma near zero at lightness extremes and peak at threshold.
  set(
    inputs.layerCMax,
    fn.mul(
      CHROMA_MAX,
      fn.div(l, DARK_THRESHOLD_L),
      fn.div(fn.invert(l), fn.invert(DARK_THRESHOLD_L)),
    ),
  ),
);

const layerSaturate = utility(
  "layer-saturate-*",
  set(
    inputs.layerIdleRelativeC,
    getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS),
  ),
);
utility("layer-desaturate-*", ...getNegatedDeclarations(layerSaturate));

const stateSaturate = utility(
  "state-saturate-*",
  set(inputs.layerRelativeC, getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS)),
);
utility("state-desaturate-*", ...getNegatedDeclarations(stateSaturate));

utility(
  "layer-h-rotate-*",
  set(
    inputs.layerIdleRelativeH,
    getNumericTokenValue("[*]", HUE_TOKEN_OPTIONS),
  ),
);

utility(
  "state-h-rotate-*",
  set(inputs.layerRelativeH, getNumericTokenValue("[*]", HUE_TOKEN_OPTIONS)),
);

utility(
  "layer-l-*",
  set(inputs.layerL, fn.value("[*]")),
  set(inputs.layerL, getPercentTokenValue("[number]")),
);

utility(
  "layer-c-*",
  set(inputs.layerC, fn.value("[*]")),
  set(inputs.layerC, fn.value(chroma)),
  set(inputs.layerC, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "layer-h-*",
  set(inputs.layerH, fn.value(hue, "[*]")),
  set(inputs.layerH, getNumericTokenValue("[number]", HUE_TOKEN_OPTIONS)),
);

utility(
  "layer-invert",
  set(inputs.layerLMin, 0.25),
  set(inputs.layerL, fn.invert(l)),
);

utility(
  "edge-*",
  set(inputs.edgeC, fn.value(chroma)),
  set(inputs.edgeH, fn.value(hue)),
  set(inputs.edgeColor, fn.value(color, "[color]")),
  set(inputs.edgeA, getPercentTokenValue("[number]")),
);

const edgeLighten = utility(
  "edge-lighten-*",
  set(inputs.edgeRelativeL, getPercentTokenValue("[*]")),
);
utility("edge-darken-*", ...getNegatedDeclarations(edgeLighten));

utility(
  "edge-cool-*",
  set(inputs.edgeH, getHueToward(h, vars.hueCool, getNumericTokenValue("[*]"))),
);

utility(
  "edge-warm-*",
  set(inputs.edgeH, getHueToward(h, vars.hueWarm, getNumericTokenValue("[*]"))),
);

utility(
  "edge-contrast-*",
  set(inputs.edgeContrastL, getPercentTokenValue("[*]")),
);

const edgeSaturate = utility(
  "edge-saturate-*",
  set(inputs.edgeRelativeC, getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS)),
);
utility("edge-desaturate-*", ...getNegatedDeclarations(edgeSaturate));

utility(
  "edge-h-rotate-*",
  set(inputs.edgeRelativeH, getNumericTokenValue("[*]", HUE_TOKEN_OPTIONS)),
);

utility(
  "edge-l-*",
  set(inputs.edgeL, fn.value("[*]")),
  set(inputs.edgeL, getPercentTokenValue("[number]")),
);

utility(
  "edge-c-*",
  set(inputs.edgeC, fn.value("[*]")),
  set(inputs.edgeC, fn.value(chroma)),
  set(inputs.edgeC, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "edge-h-*",
  set(inputs.edgeH, fn.value(hue, "[*]")),
  set(inputs.edgeH, getNumericTokenValue("[number]", HUE_TOKEN_OPTIONS)),
);

const textBaseColor = fn.var(inputs.textColor, vars.layer);

// Absolute text channel utilities override the relative offsets; otherwise the
// offsets are applied on top of the current layer channels.
const textAdjustedLightness = fn.var(
  inputs.textL,
  fn.add(l, inputs.textRelativeL),
);
const textAdjustedChroma = fn.var(
  inputs.textC,
  fn.add(c, inputs.textRelativeC),
);
const textAdjustedHue = fn.var(inputs.textH, fn.add(h, inputs.textRelativeH));

const textColorAdjusted = fn.oklch(textBaseColor, {
  l: textAdjustedLightness,
  c: textAdjustedChroma,
  h: textAdjustedHue,
  a: textAlpha,
});

// Text contrast utilities always keep at least a half-step delta so plain
// `ak-text` still separates from the parent layer in both schemes.
const textContrastShift = fn.mul(
  fn.add(
    fn.max(TEXT_MIN_CONTRAST, inputs.textContrastL),
    fn.mul(vars.contrastT, CONTRAST_SCALE),
  ),
  vars.textContrastDirection,
);
const textComputedL = fn.add(vars.textParentL, textContrastShift);

// `textContrastDirection` is `1` on dark parents and `-1` on light parents.
// Clamp it to a mask so CSS math can switch between max() and min().
const textDarkDirectionMask = fn.clamp01(vars.textContrastDirection);
const textDirectedLightness = fn.add(
  fn.mul(fn.max(l, textComputedL), textDarkDirectionMask),
  fn.mul(fn.min(l, textComputedL), fn.invert(textDarkDirectionMask)),
);

// Text keeps some chroma, but it is capped more aggressively on dark layers so
// saturated colors do not overpower the foreground.
const textDirectional = fn.oklch(textColorAdjusted, {
  l: fn.clamp(inputs.textLMin, textDirectedLightness, inputs.textLMax),
  c: fn.min(fn.clamp(inputs.textCMin, c, inputs.textCMax), vars.textChromaCap),
});

utility(
  "text",
  getBaseDeclarations(vars.layer),
  set.backgroundColor(fn.important("transparent")),
  set.color(vars.text),
  at.container(fn.style(vars.layerL), set(vars.text, textDirectional)),
  mapLayerLightnessSteps((parentL, isDark) => [
    set(vars.textContrastDirection, isDark ? 1 : -1),
    set(vars.textParentL, parentL),
    set(vars.textChromaCap, isDark ? 0.25 : 0.4),
  ]),
);

utility(
  "text-*",
  set(inputs.textC, fn.value(chroma)),
  set(inputs.textH, fn.value(hue)),
  set(inputs.textColor, fn.value(color, "[color]")),
  set(inputs.textContrastL, getPercentTokenValue("[number]")),
  set(inputs.textA, getPercentTokenValue("[number]")),
);

utility("text-layer", set(inputs.textColor, vars.layer));

const textLighten = utility(
  "text-lighten-*",
  set(inputs.textRelativeL, getPercentTokenValue("[*]")),
);
utility("text-darken-*", ...getNegatedDeclarations(textLighten));

utility(
  "text-cool-*",
  set(inputs.textH, getHueToward(h, vars.hueCool, getNumericTokenValue("[*]"))),
);

utility(
  "text-warm-*",
  set(inputs.textH, getHueToward(h, vars.hueWarm, getNumericTokenValue("[*]"))),
);

const textSaturate = utility(
  "text-saturate-*",
  set(inputs.textRelativeC, getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS)),
);
utility("text-desaturate-*", ...getNegatedDeclarations(textSaturate));

utility(
  "text-l-*",
  set(inputs.textL, fn.value("[*]")),
  set(inputs.textL, getPercentTokenValue("[number]")),
);

utility(
  "text-c-*",
  set(inputs.textC, fn.value("[*]")),
  set(inputs.textC, fn.value(chroma)),
  set(inputs.textC, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "text-h-*",
  set(inputs.textH, fn.value(hue, "[*]")),
  set(inputs.textH, getNumericTokenValue("[number]", HUE_TOKEN_OPTIONS)),
);

utility(
  "text-max-*",
  set(inputs.textCMax, fn.value(chroma)),
  set(inputs.textLMax, fn.value("[*]")),
  set(inputs.textLMax, getPercentTokenValue("[number]")),
);

utility(
  "text-min-*",
  set(inputs.textCMin, fn.value(chroma)),
  set(inputs.textLMin, fn.value("[*]")),
  set(inputs.textLMin, getPercentTokenValue("[number]")),
);

utility(
  "text-max-c-*",
  set(inputs.textCMax, fn.value("[*]")),
  set(inputs.textCMax, fn.value(chroma)),
  set(inputs.textCMax, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "text-min-c-*",
  set(inputs.textCMin, fn.value("[*]")),
  set(inputs.textCMin, fn.value(chroma)),
  set(inputs.textCMin, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

const outlineBaseColor = fn.var(inputs.outlineColor, vars.layer);

const outlineAdjustedLightness = fn.var(
  inputs.outlineL,
  fn.add(l, inputs.outlineRelativeL),
);
const outlineAdjustedChroma = fn.var(
  inputs.outlineC,
  fn.add(c, inputs.outlineRelativeC),
);
const outlineAdjustedHue = fn.var(
  inputs.outlineH,
  fn.add(h, inputs.outlineRelativeH),
);

const outlineColorAdjusted = fn.oklch(outlineBaseColor, {
  l: outlineAdjustedLightness,
  c: outlineAdjustedChroma,
  h: outlineAdjustedHue,
});

const outlineContrastShift = fn.mul(
  fn.add(
    fn.max(OUTLINE_MIN_CONTRAST, inputs.outlineContrastL),
    fn.mul(vars.contrastT, CONTRAST_SCALE),
  ),
  vars.outlineContrastDirection,
);
const outlineComputedL = fn.add(vars.outlineParentL, outlineContrastShift);

const outlineDarkDirectionMask = fn.clamp01(vars.outlineContrastDirection);
const outlineDirectedLightness = fn.add(
  fn.mul(fn.max(l, outlineComputedL), outlineDarkDirectionMask),
  fn.mul(fn.min(l, outlineComputedL), fn.invert(outlineDarkDirectionMask)),
);

const outlineDirectional = fn.oklch(outlineColorAdjusted, {
  l: fn.clamp(inputs.outlineLMin, outlineDirectedLightness, inputs.outlineLMax),
  c: fn.clamp(inputs.outlineCMin, c, inputs.outlineCMax),
});

utility(
  "outline",
  getBaseDeclarations(vars.layer),
  set.outlineColor(vars.outline),
  at.container(fn.style(vars.layerL), set(vars.outline, outlineDirectional)),
  mapLayerLightnessSteps((parentL, isDark) => [
    set(vars.outlineContrastDirection, isDark ? 1 : -1),
    set(vars.outlineParentL, parentL),
  ]),
);

utility(
  "outline-*",
  set(inputs.outlineC, fn.value(chroma)),
  set(inputs.outlineH, fn.value(hue)),
  set(inputs.outlineColor, fn.value(color, "[color]")),
  set(inputs.outlineContrastL, getPercentTokenValue("[number]")),
);

const outlineLighten = utility(
  "outline-lighten-*",
  set(inputs.outlineRelativeL, getPercentTokenValue("[*]")),
);
utility("outline-darken-*", ...getNegatedDeclarations(outlineLighten));

utility(
  "outline-cool-*",
  set(
    inputs.outlineH,
    getHueToward(h, vars.hueCool, getNumericTokenValue("[*]")),
  ),
);

utility(
  "outline-warm-*",
  set(
    inputs.outlineH,
    getHueToward(h, vars.hueWarm, getNumericTokenValue("[*]")),
  ),
);

const outlineSaturate = utility(
  "outline-saturate-*",
  set(
    inputs.outlineRelativeC,
    getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS),
  ),
);
utility("outline-desaturate-*", ...getNegatedDeclarations(outlineSaturate));

utility(
  "outline-h-rotate-*",
  set(inputs.outlineRelativeH, getNumericTokenValue("[*]", HUE_TOKEN_OPTIONS)),
);

utility(
  "outline-l-*",
  set(inputs.outlineL, fn.value("[*]")),
  set(inputs.outlineL, getPercentTokenValue("[number]")),
);

utility(
  "outline-c-*",
  set(inputs.outlineC, fn.value("[*]")),
  set(inputs.outlineC, fn.value(chroma)),
  set(inputs.outlineC, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "outline-h-*",
  set(inputs.outlineH, fn.value(hue, "[*]")),
  set(inputs.outlineH, getNumericTokenValue("[number]", HUE_TOKEN_OPTIONS)),
);

utility(
  "outline-max-*",
  set(inputs.outlineCMax, fn.value(chroma)),
  set(inputs.outlineLMax, fn.value("[*]")),
  set(inputs.outlineLMax, getPercentTokenValue("[number]")),
);

utility(
  "outline-min-*",
  set(inputs.outlineCMin, fn.value(chroma)),
  set(inputs.outlineLMin, fn.value("[*]")),
  set(inputs.outlineLMin, getPercentTokenValue("[number]")),
);

utility(
  "outline-max-c-*",
  set(inputs.outlineCMax, fn.value("[*]")),
  set(inputs.outlineCMax, fn.value(chroma)),
  set(
    inputs.outlineCMax,
    getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS),
  ),
);

utility(
  "outline-min-c-*",
  set(inputs.outlineCMin, fn.value("[*]")),
  set(inputs.outlineCMin, fn.value(chroma)),
  set(
    inputs.outlineCMin,
    getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS),
  ),
);

function getFrameBorderWidthDeclarations(target: VarProperty) {
  return [
    set(target, fn.value("[*]")),
    set(
      target,
      fn.toPx(fn.value("number", "[number]", '"0", "1", "2", "4", "8"')),
    ),
  ];
}

const frameContext = createContext();

const LAST_VISIBLE_SELECTOR = "&:not(:has(~ *:not([hidden],template)))";

/**
 * Returns cover/overflow declarations that use calc-based conditionals for
 * axis and edge handling, avoiding container style queries on self properties.
 */
function getFrameStretchDeclarations({
  inset,
  parentRadius,
}: {
  inset: string;
  parentRadius: string;
}) {
  const isCol = fn.sub(1, inputs.frameRow);
  const isRow = inputs.frameRow;
  const negInset = fn.neg(inset);
  return [
    rule("&:first-child", set(inputs.frameStart, 1)),
    rule(LAST_VISIBLE_SELECTOR, set(inputs.frameEnd, 1)),
    // Cross-axis margins always applied; main-axis margins only at edges
    // Col: inline = cross, block = main
    // Row: block = cross, inline = main
    set.marginInlineStart(
      fn.mul(fn.max(isCol, fn.mul(isRow, inputs.frameStart)), negInset),
    ),
    set.marginInlineEnd(
      fn.mul(fn.max(isCol, fn.mul(isRow, inputs.frameEnd)), negInset),
    ),
    set.marginBlockStart(
      fn.mul(fn.max(isRow, fn.mul(isCol, inputs.frameStart)), negInset),
    ),
    set.marginBlockEnd(
      fn.mul(fn.max(isRow, fn.mul(isCol, inputs.frameEnd)), negInset),
    ),
    // Corner radii: each corner is rounded when its edge conditions are met
    // start-start: start in either axis
    set.borderStartStartRadius(fn.mul(inputs.frameStart, parentRadius)),
    // start-end: (col AND start) OR (row AND end)
    set.borderStartEndRadius(
      fn.mul(
        fn.max(
          fn.mul(isCol, inputs.frameStart),
          fn.mul(isRow, inputs.frameEnd),
        ),
        parentRadius,
      ),
    ),
    // end-start: (col AND end) OR (row AND start)
    set.borderEndStartRadius(
      fn.mul(
        fn.max(
          fn.mul(isCol, inputs.frameEnd),
          fn.mul(isRow, inputs.frameStart),
        ),
        parentRadius,
      ),
    ),
    // end-end: end in either axis
    set.borderEndEndRadius(fn.mul(inputs.frameEnd, parentRadius)),
  ];
}

utility(
  "frame",
  set(vars.framePadding, inputs.framePadding),
  set(vars.frameMargin, inputs.frameMargin),
  set(vars.frameBorder, inputs.frameBorder),
  set(vars.frameRing, inputs.frameRing),
  set.padding(vars.framePadding),
  set.scrollPadding(vars.framePadding),
  set.borderWidth(vars.frameBorder),
  set.borderRadius(vars.frameRadius),
  at.apply`ring-[length:${vars.frameRing}]`,
  frameContext(({ provide, inherit }) => {
    const parentRadius = inherit(
      vars.frameParentRadiusContext,
      inputs.frameRadius,
    );
    const parentPadding = inherit(vars.frameParentPaddingContext, "0px");
    const parentBorder = inherit(vars.frameParentBorderContext, "0px");
    const parentPaddingAndMargin = fn.add(parentPadding, vars.frameMargin);
    const nestedRadius = fn.sub(
      parentRadius,
      fn.add(parentPadding, parentBorder, vars.frameMargin),
    );
    const minimumRadius = fn.min("0.125rem", inputs.frameRadius);
    const autoRadius = fn.max(minimumRadius, fn.max(nestedRadius, "0px"));
    // Cap flag: 1 when parentPadding + margin > 1rem (use CSS sign() for
    // length comparison). When capped, the child is far enough from the parent
    // edge that concentric radius is not meaningful.
    const capFlag = fn.max(
      `sign(${fn.sub(parentPaddingAndMargin, FRAME_PADDING_CAP)})`,
      0,
    );
    // When forced or capped, use the hint radius directly.
    const forceOrCap = fn.clamp01(fn.add(inputs.frameForce, capFlag));
    const frameRadius = fn.add(
      fn.mul(forceOrCap, inputs.frameRadius),
      fn.mul(fn.sub(1, forceOrCap), autoRadius),
    );
    return [
      set(vars.frameRadius, frameRadius),
      set(provide(vars.frameParentRadiusContext), vars.frameRadius),
      set(provide(vars.frameParentPaddingContext), vars.framePadding),
      set(provide(vars.frameParentBorderContext), vars.frameBorder),
      set(provide(vars.frameParentRingContext), vars.frameRing),
    ];
  }),
);

utility("frame-force", set(inputs.frameForce, 1));

utility(
  "frame-*",
  set(inputs.frameRadius, fn.value(radius, "[*]")),
  set(inputs.framePadding, fn.modifier(spacing, "[*]")),
  set(
    inputs.framePadding,
    fn.spacing(fn.modifier("number", "[number]", ...getSpacingNumberTokens())),
  ),
);

utility("frame-rounded-*", set(inputs.frameRadius, fn.value(radius, "[*]")));

utility(
  "frame-p-*",
  set(inputs.framePadding, fn.value(spacing, "[*]")),
  set(
    inputs.framePadding,
    fn.spacing(fn.value("number", "[number]", ...getSpacingNumberTokens())),
  ),
);

const frameMargin = utility(
  "frame-m-*",
  set(inputs.frameMargin, fn.value(spacing, "[*]")),
  set(
    inputs.frameMargin,
    fn.spacing(fn.value("number", "[number]", ...getSpacingNumberTokens())),
  ),
);
utility("-frame-m-*", getNegatedDeclarations(frameMargin));

utility(
  "frame-cover",
  frameContext(({ inherit }) => {
    const parentPadding = inherit(vars.frameParentPaddingContext, "0px");
    const parentRadius = inherit(vars.frameParentRadiusContext, "0px");
    return getFrameStretchDeclarations({
      inset: parentPadding,
      parentRadius,
    });
  }),
);

utility(
  "frame-overflow",
  frameContext(({ inherit }) => {
    const parentPadding = inherit(vars.frameParentPaddingContext, "0px");
    const parentBorder = inherit(vars.frameParentBorderContext, "0px");
    const parentRing = inherit(vars.frameParentRingContext, "0px");
    const parentRadius = inherit(vars.frameParentRadiusContext, "0px");
    const inset = fn.add(parentPadding, parentBorder, parentRing);
    return getFrameStretchDeclarations({ inset, parentRadius });
  }),
);

utility("frame-row", set(inputs.frameRow, 1));
utility("frame-col", set(inputs.frameRow, 0));

utility("frame-start", set(inputs.frameStart, 1));
utility("frame-end", set(inputs.frameEnd, 1));

utility("frame-border", set(inputs.frameBorder, "1px"));
utility("frame-border-*", getFrameBorderWidthDeclarations(inputs.frameBorder));

utility("frame-ring", set(inputs.frameRing, "1px"));
utility("frame-ring-*", getFrameBorderWidthDeclarations(inputs.frameRing));

function getFrameBorderingDarkLight() {
  return [
    at.variant(
      dark,
      set(inputs.frameBorder, inputs.frameBordering),
      set(inputs.frameRing, "0px"),
    ),
    at.variant(
      light,
      set(inputs.frameBorder, "0px"),
      set(inputs.frameRing, inputs.frameBordering),
    ),
  ];
}

utility(
  "frame-bordering",
  set(inputs.frameBordering, "1px"),
  getFrameBorderingDarkLight(),
);

utility(
  "frame-bordering-*",
  getFrameBorderWidthDeclarations(inputs.frameBordering),
  getFrameBorderingDarkLight(),
);

export const input = [
  theme,
  root,
  dark,
  light,
  darkHigh,
  darkLow,
  lightLow,
  lightHigh,
  ...utilities,
  ...Object.values(vars),
  ...Object.values(inputs),
];
