import type { Value, VarProperty, WithContextParams } from "./lib.ts";
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
const AUTO_CHROMA_COEFFICIENT = roundToDecimals(
  CHROMA_MAX / (DARK_THRESHOLD_L * (1 - DARK_THRESHOLD_L)),
  9,
);

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
// Child text uses asymmetric floors: light layers need a stronger dark-text
// push than dark layers need for light text. On dark layers, keep neutrals
// close to `ak-ink` while only pushing authored light colors further when
// their own lightness still leaves too little contrast.
const CHILD_TEXT_MIN_CONTRAST_DARK = 0.47;
const CHILD_TEXT_MIN_CONTRAST_LIGHT = 0.5;
const CHILD_TEXT_MIN_CONTRAST_CHROMA_START = 0.03;
const CHILD_TEXT_MIN_CONTRAST_DARK_CHROMA_START = 0.07;
const CHILD_TEXT_MIN_CONTRAST_DARK_CHROMA_SCALE = 22.0;
const CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_MAX_CHROMA = 0.04;
const CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_BOOST_START_L = 0.25;
const CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_BOOST = 0.03;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_START_L = 0.68;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_FULL_L = 0.74;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_PARENT_MAX_L = 0.3;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_CHROMA_FULL = 0.14;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_VIVID_START_L = 0.54;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_SPAN_L = 0.03;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_NEUTRAL = 0.13;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_VIVID = 0.24;
const CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_NEUTRAL_START_OFFSET =
  roundToDecimals(
    CHILD_TEXT_MIN_CONTRAST_DARK -
      CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_NEUTRAL -
      CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_SPAN_L,
    4,
  );
// Very dark parents (parentL close to 0) fall outside the perceptual range
// where the base 0.47 floor reaches 4.5:1 WCAG AA luminance contrast. Ramp in
// an extra lightness push when parentL is below the first quantization step so
// `ak-text-<number>` and `ak-text-push-<number>` stay safe on layers like
// `ak-layer-100` (light) / `ak-layer-0` (dark) and near-black custom layers.
const CHILD_TEXT_MIN_CONTRAST_DARK_PARENT_BOOST = 0.1;
const CHILD_TEXT_MIN_CONTRAST_DARK_PARENT_BOOST_END_L = 0.125;
const CHILD_TEXT_MIN_CONTRAST_LIGHT_CHROMA_SCALE = 1.0;
const CHILD_TEXT_MIN_CONTRAST_LIGHT_CHROMA_DAMPING = 1.5;
// Child colored text can be more vivid on extreme backgrounds than on
// mid-tone backgrounds, where the WCAG margin is tighter.
const CHILD_TEXT_CHROMA_CAP_DARK_MIN = 0.0399;
const CHILD_TEXT_CHROMA_CAP_DARK_MAX = CHROMA_MAX_P3;
const CHILD_TEXT_CHROMA_CAP_LIGHT = 0.2;
const CHILD_TEXT_CHROMA_CAP_DARK_RAMP_START_L = 0.5;
const OUTLINE_MIN_CONTRAST = 0.5;
const INK_DARK_MID_ALPHA_BOOST_START_L = 0.25;
const INK_DARK_MID_ALPHA_BOOST = 0.08;
const TEXT_CONTRAST_CYAN_CHROMA_START = 0.29;
const TEXT_CONTRAST_CYAN_BIAS = 0.2;
const TEXT_CONTRAST_CHROMA_HUE_MIN = 150;
const TEXT_CONTRAST_CHROMA_HUE_MAX = 220;
const TEXT_CONTRAST_CYAN_LIGHTNESS_START = 0.45;

const CONTRAST_SCALE = 0.3334;
// Text gets a doubled contrast lift because the ancestor layer also shifts
// with `--contrast`; the extra push compensates for the parent's movement so
// the text actually changes lightness/alpha visibly rather than tracking the
// background.
const TEXT_CONTRAST_SCALE = CONTRAST_SCALE * 2;
const TEXT_CONTRAST_L = fn.inflate(fn.sub(DARK_THRESHOLD_L, l));
const TEXT_FOREGROUND_CONTRAST_L = fn.inflate(
  fn.sub(
    DARK_THRESHOLD_L,
    fn.add(
      l,
      fn.mul(
        TEXT_CONTRAST_CYAN_BIAS,
        fn.binary(fn.sub(c, TEXT_CONTRAST_CYAN_CHROMA_START)),
        getRangeMask(
          h,
          TEXT_CONTRAST_CHROMA_HUE_MIN,
          TEXT_CONTRAST_CHROMA_HUE_MAX,
        ),
        fn.binary(fn.sub(l, TEXT_CONTRAST_CYAN_LIGHTNESS_START)),
      ),
    ),
  ),
);
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
const LA_CONTRAST_SPREAD = roundToDecimals(
  LA_SPREAD * LA_SPREAD_CONTRAST_SCALE,
  4,
);
const LB_CONTRAST_SPREAD = roundToDecimals(
  LB_SPREAD * LB_SPREAD_CONTRAST_SCALE,
  4,
);
// Build-time CSS transforms round these coefficients, so keep them explicit in
// source to avoid dev/prod drift around forbidden-range branch points.
const LA_CHROMA_SPREAD = roundToDecimals(LA_SPREAD / CHROMA_MAX, 6);
const LB_CHROMA_SPREAD = roundToDecimals(LB_SPREAD / CHROMA_MAX, 6);

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
    fn.min(
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
  const forbiddenBoundary = fn.add(
    lowerBoundary,
    fn.mul(forbiddenBoundaryDirection, fn.sub(upperBoundary, lowerBoundary)),
  );
  return fn.add(
    currentLightness,
    fn.mul(forbiddenRangeMask, fn.sub(forbiddenBoundary, currentLightness)),
  );
}

/**
 * Computes an automatic lightness delta that avoids forbidden lightness. If the
 * next lightness enters the forbidden interval, we either flip direction or
 * clamp to the entry boundary, whichever yields more lightness distance from
 * the original layer color.
 */
function getAutoLightnessDelta(
  normalDelta: Value,
  direction: Value,
  lowerBoundary: Value,
  upperBoundary: Value,
  toLight: Value,
) {
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
    upperBoundary,
    fn.mul(toLight, fn.sub(lowerBoundary, upperBoundary)),
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
 * Linearly blends two values using a 0..1 weight.
 */
function mixValues(from: Value, to: Value, weight: Value) {
  return fn.add(from, fn.mul(weight, fn.sub(to, from)));
}

/**
 * Pushes `current` toward `target` only when it follows `direction`.
 */
function getDirectionalLightness(
  current: Value,
  target: Value,
  direction: Value,
) {
  return fn.add(
    current,
    fn.mul(direction, fn.relu(fn.mul(fn.sub(target, current), direction))),
  );
}

/**
 * Returns the normalized 0..1 progress of `value` between `start` and `end`.
 */
function getRampProgress(value: Value, start: Value, end: Value) {
  return getRampProgressBySpan(value, start, fn.sub(end, start));
}

/**
 * Returns the normalized 0..1 progress of `value` from `start` over `span`.
 */
function getRampProgressBySpan(value: Value, start: Value, span: Value) {
  return fn.clamp01(fn.div(fn.sub(value, start), span));
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

// Band membership expressions — depend only on `l` and fixed constants.
const bandDarkHigh = getRangeMask(l, 0, DARK_HIGH_MAX_L);
const bandDarkLow = getRangeMask(l, DARK_HIGH_MAX_L, LA_BASE);
const bandLightLow = getRangeMask(l, LB_BASE, LIGHT_LOW_MAX_L);
const bandLightHigh = fn.binary(fn.sub(l, LIGHT_LOW_MAX_L));

// Constants registered once as @property initial values. They only depend on
// color channels or fixed numeric constants.
const constantMathVars = {
  textContrastL: _ak.prop("tcl", { initial: TEXT_CONTRAST_L }),
  textForegroundContrastL: _ak.prop("tfcl", {
    initial: TEXT_FOREGROUND_CONTRAST_L,
  }),
  textMinAlphaOnLightLayer: _ak.prop("tmal", {
    initial: fn.sub(1.386, fn.mul(l, 0.85)),
  }),
  textMinAlphaOnDarkLayer: _ak.prop("tmad", {
    initial: fn.add(0.457, fn.mul(l, l, 1.45)),
  }),
  textMinAlphaOnDarkLayerMidBoost: _ak.prop("tmab", {
    initial: fn.mul(
      fn.clamp01(
        fn.div(
          fn.relu(fn.sub(l, INK_DARK_MID_ALPHA_BOOST_START_L)),
          fn.sub(DARK_THRESHOLD_L, INK_DARK_MID_ALPHA_BOOST_START_L),
        ),
      ),
      INK_DARK_MID_ALPHA_BOOST,
    ),
  }),
  forbiddenLaBase: _ak.prop("flab", {
    initial: fn.sub(LA_BASE, fn.mul(fn.min(c, CHROMA_MAX), LA_CHROMA_SPREAD)),
  }),
  forbiddenLbBase: _ak.prop("flbb", {
    initial: fn.add(LB_BASE, fn.mul(fn.min(c, CHROMA_MAX), LB_CHROMA_SPREAD)),
  }),
  autoLDirection: _ak.prop("ald", { initial: fn.sub(fn.double(DARK_L), 1) }),
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
  contrastT: _ak.var("ct", globalContrastT),
  contrastPushScale: _ak.var("cps"),
  layerContrastBias: _ak.var("lcb"),
  forbiddenLa: _ak.var("fla"),
  forbiddenLb: _ak.var("flb"),
  safeL: _ak.var("sl"),
  autoDirectionToLight: _ak.var("adtl"),
  layerIdlePushValue: _ak.prop("lipv", { initial: 0 }),
  layerIdlePushBaseL: _ak.prop("lipbl", { initial: l }),
  layerIdlePushL: _ak.prop("lipl", { initial: l }),
  layerPushValue: _ak.prop("lpv", { initial: 0 }),
  layerPushBaseL: _ak.prop("lpbl", { initial: l }),
  layerPushL: _ak.prop("lpl", { initial: l }),
  layerIdleContrastValue: _ak.var("licv"),
  edgeContrastValue: _ak.var("ecv"),
  edgePushDirection: _ak.var("epd", -1),
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
  layerPush: _ak.prop.canvas("lp"),
  layer: ak.prop.canvas("layer", { inherits: true }),
  layerParentContext: _ak.var("lpc"),
  layerParent: ak.var("layer-parent", "canvas"),
  edge: ak.prop.black("edge"),
  text: ak.prop.black("text", { inherits: true }),
  outline: ak.var("outline", "canvastext"),
};

const layerContrastMathVars = {
  layerContrastDirection: _ak.prop.number("lcd", { initial: 0 }),
  layerContrastParentL: _ak.prop.number("lcpl", { initial: 0 }),
};

const outlineMathVars = {
  outlineContrastDirection: _ak.prop("ocd", { initial: 1 }),
  outlineParentL: _ak.prop("opl", { initial: 0 }),
};

const textMathVars = {
  textContrastDirection: _ak.prop.number("tcd", { initial: 1 }),
  textParentL: _ak.prop.number("tpl", { initial: 0 }),
  textChromaCap: _ak.prop.number("tcc", {
    initial: CHILD_TEXT_CHROMA_CAP_DARK_MIN,
  }),
  textChromaUncapped: _ak.var("tcu"),
  textUserLightness: _ak.var("tul"),
  textContrastChroma: _ak.var("tcrc"),
  textDarkContrastChroma: _ak.var("tdcc"),
  textDarkReliefChroma: _ak.var("tdrc"),
  textDarkDirectionMask: _ak.var("tddm"),
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
  frameParentRowContext: _ak.var("fpwc"),
  frameParentCornerTLContext: _ak.var("fpctl"),
  frameParentCornerTRContext: _ak.var("fpctr"),
  frameParentCornerBLContext: _ak.var("fpcbl"),
  frameParentCornerBRContext: _ak.var("fpcbr"),
};

const vars = {
  contrast,
  ...constantMathVars,
  ...layerMathVars,
  ...themeTokenVars,
  ...layerColorVars,
  ...layerContrastMathVars,
  ...outlineMathVars,
  ...textMathVars,
  ...frameVars,
};

const inputs = {
  layerColor: _ak.prop("layer-color"),
  layerIdleRelativeL: _ak.prop("layer-idle-relative-lightness", { initial: 0 }),
  layerIdleRelativeC: _ak.prop("layer-idle-relative-chroma", { initial: 0 }),
  layerIdleRelativeH: _ak.prop("layer-idle-relative-hue", { initial: 0 }),
  layerIdleAutoLDelta: _ak.prop("layer-idle-auto-lightness-delta", {
    initial: 0,
  }),
  layerIdleAutoL: _ak.prop("layer-idle-auto-lightness", { initial: 0 }),
  layerIdlePushL: _ak.prop("layer-idle-push-lightness", { initial: 0 }),
  layerIdleContrastL: _ak.prop("layer-idle-contrast-lightness", { initial: 0 }),
  layerL: _ak.prop("layer-lightness"),
  layerC: _ak.prop("layer-chroma"),
  layerH: _ak.prop("layer-hue"),
  layerLMin: _ak.prop("layer-lightness-min", { initial: 0 }),
  layerLMax: _ak.prop("layer-lightness-max", { initial: 1 }),
  layerCMin: _ak.prop("layer-chroma-min", { initial: 0 }),
  layerCMax: _ak.prop("layer-chroma-max", vars.chromaP3Max),
  layerRelativeL: _ak.prop("layer-relative-lightness", { initial: 0 }),
  layerRelativeC: _ak.prop("layer-relative-chroma", { initial: 0 }),
  layerRelativeH: _ak.prop("layer-relative-hue", { initial: 0 }),
  layerAutoLDelta: _ak.prop("layer-auto-lightness-delta", { initial: 0 }),
  layerAutoL: _ak.prop("layer-auto-lightness", { initial: 0 }),
  layerPushL: _ak.prop("layer-push-lightness", { initial: 0 }),
  layerMix: _ak.prop("layer-mix"),
  layerMixMethod: _ak.prop("layer-mix-method", "oklab"),
  layerMixAmount: _ak.prop("layer-mix-amount", "50%"),
  layerMixColor: _ak.prop("layer-mix-color", vars.layerParent),
  edgeColor: _ak.prop("edge-color"),
  edgeRelativeL: _ak.prop("edge-relative-lightness", { initial: 0 }),
  edgeRelativeC: _ak.prop("edge-relative-chroma", { initial: 0 }),
  edgeRelativeH: _ak.prop("edge-relative-hue", { initial: 0 }),
  edgePushL: _ak.prop("edge-push-lightness", { initial: 1 }),
  edgeLMin: _ak.prop("edge-lightness-min", { initial: 0 }),
  edgeLMax: _ak.prop("edge-lightness-max", { initial: 1 }),
  edgeCMin: _ak.prop("edge-chroma-min", { initial: 0 }),
  edgeCMax: _ak.prop("edge-chroma-max", vars.chromaP3Max),
  edgeL: _ak.prop("edge-lightness"),
  edgeC: _ak.prop("edge-chroma"),
  edgeH: _ak.prop("edge-h"),
  edgeA: _ak.prop("edge-alpha", { initial: 0.1 }),
  textPushL: _ak.prop("text-push-lightness", { initial: 0 }),
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
function getPushValue(value: Value) {
  return fn.mul(value, vars.contrastPushScale);
}

/**
 * Computes auto lightness from an already direction-adjusted delta.
 */
function getAutoLDelta(value: Value) {
  return getAutoLightnessDelta(
    value,
    vars.autoLDirection,
    vars.forbiddenLa,
    vars.forbiddenLb,
    vars.autoDirectionToLight,
  );
}

/**
 * Keeps a declaration tied to numeric utility tokens while using a factored
 * scratch variable for the expensive expression.
 */
function withNumericTokenGate(value: Value, pattern: string) {
  return fn.calc`${value} + (0 * ${getPercentTokenValue(pattern)})`;
}

/**
 * Applies contrast lightness with the same baseline progression as
 * `ak-layer-*`, except values that would land inside the forbidden band jump
 * to the opposite boundary and preserve their remaining progress there.
 */
function getPushL(pushValue: Value, baseLightness: Value) {
  const direction = vars.autoLDirection;
  const lowerBoundary = vars.forbiddenLa;
  const upperBoundary = vars.forbiddenLb;
  const bandWidth = fn.sub(upperBoundary, lowerBoundary);
  const valueEnabled = fn.binary(pushValue);
  const startLightness = l;
  // Crossed from dark side: l was below fla AND baseLightness moved above fla.
  const crossedFromDarkSide = fn.mul(
    fn.binary(fn.sub(lowerBoundary, startLightness)),
    fn.binary(fn.sub(baseLightness, lowerBoundary)),
  );
  // Crossed from light side: l was above flb AND baseLightness moved below flb.
  const crossedFromLightSide = fn.mul(
    fn.binary(fn.sub(startLightness, upperBoundary)),
    fn.binary(fn.sub(upperBoundary, baseLightness)),
  );
  // These are mutually exclusive (l cannot be both below fla and above flb),
  // and each can only fire when the auto-direction aligns with the crossing
  // direction, so the direction weights that were here before are redundant
  // and have been removed.
  const crossed = fn.add(crossedFromDarkSide, crossedFromLightSide);
  // When l starts inside the forbidden range (crossed is always 0 there),
  // baseLightness may still sit inside the range, so a second mask is needed.
  // It is gated by valueEnabled so that a zero contrast value does not trigger
  // the jump.
  const baseLightnessInForbidden = getForbiddenRangeMask(
    baseLightness,
    lowerBoundary,
    upperBoundary,
  );
  // A crossing always lands outside the forbidden range (the skip adds the
  // full band width), so crossed and baseLightnessInForbidden are never both
  // 1. Using max selects whichever condition applies without inflating the
  // expression the way the previous skippedLightness intermediate did.
  const needsJump = fn.max(
    crossed,
    fn.mul(baseLightnessInForbidden, valueEnabled),
  );
  return fn.clamp01(
    fn.add(baseLightness, fn.mul(direction, bandWidth, needsJump)),
  );
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
interface LayerLightnessStepsCallback {
  (
    parentLightness: number,
    isDark: boolean,
  ): (ReturnType<typeof set> | undefined)[];
}

function getQuantizedLayerLightnessSteps() {
  return Array.from({ length: QUANTIZED_LIGHTNESS_STEPS + 1 }, (_, index) =>
    roundToDecimals(index / QUANTIZED_LIGHTNESS_STEPS, 4),
  );
}

function mapLightnessSteps(
  getContainerQuery: (parentLightness: number) => string,
  callback: LayerLightnessStepsCallback,
) {
  return getQuantizedLayerLightnessSteps().flatMap((parentLightness) => {
    const isDark = parentLightness < DARK_THRESHOLD_L;
    const children = callback(parentLightness, isDark).filter(
      (child) => child != null,
    );
    if (children.length === 0) {
      return [];
    }
    return at.container(getContainerQuery(parentLightness), ...children);
  });
}

function mapLayerLightnessSteps(callback: LayerLightnessStepsCallback) {
  return mapLightnessSteps(
    (parentLightness) =>
      fn.style(vars.layerL, fn.oklch({ l: parentLightness })),
    callback,
  );
}

function mapAncestorLayerLightnessSteps(callback: LayerLightnessStepsCallback) {
  return mapLightnessSteps(
    (parentLightness) =>
      fn.style(vars.layerL, fn.oklch({ l: parentLightness })),
    callback,
  );
}

function interpolateRoundedValue(min: number, max: number, weight: number) {
  return roundToDecimals(min + weight * (max - min), 4);
}

function getChildTextChromaCap(parentLightness: number, isDark: boolean) {
  if (!isDark) {
    return CHILD_TEXT_CHROMA_CAP_LIGHT;
  }
  // Dark parents stay at the conservative minimum near the midpoint, then
  // ramp toward the black-background cap as the parent approaches black.
  // Use ease-out so darker backgrounds open up chroma quickly — vivid hues like
  // bright greens (chroma > 0.2) on near-black layers don't need to be muted to
  // pass WCAG, since the lightness floor already provides ample headroom.
  if (parentLightness >= CHILD_TEXT_CHROMA_CAP_DARK_RAMP_START_L) {
    return CHILD_TEXT_CHROMA_CAP_DARK_MIN;
  }
  const darknessRatio =
    (CHILD_TEXT_CHROMA_CAP_DARK_RAMP_START_L - parentLightness) /
    CHILD_TEXT_CHROMA_CAP_DARK_RAMP_START_L;
  const easeOutWeight = 1 - (1 - darknessRatio) * (1 - darknessRatio);
  return interpolateRoundedValue(
    CHILD_TEXT_CHROMA_CAP_DARK_MIN,
    CHILD_TEXT_CHROMA_CAP_DARK_MAX,
    easeOutWeight,
  );
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
  fn.sub(vars.forbiddenLaBase, fn.mul(vars.contrastT, LA_CONTRAST_SPREAD)),
);

const forbiddenLb = fn.min(
  FORBIDDEN_RANGE_LB_MAX,
  fn.add(vars.forbiddenLbBase, fn.mul(vars.contrastT, LB_CONTRAST_SPREAD)),
);

const layerBaseColor = fn.var(inputs.layerColor, vars.layerParent);
const layerIdleBase = fn.oklch(layerBaseColor, idleLayerChannels);
const layerIdleMixed = fn.var(inputs.layerMix, vars.layerIdleBase);
const layerIdleAuto = fn.oklch(vars.layerIdleMixed, {
  l: fn.add(
    fn.clamp(
      inputs.layerLMin,
      getLayerL(inputs.layerIdleAutoL),
      inputs.layerLMax,
    ),
    vars.layerContrastBias,
  ),
});

/**
 * Computes parent-relative contrast lightness. When `ak-layer-contrast` is
 * active (layerContrastDirection !== 0), derives the target lightness from the
 * parent layer's lightness rather than the current color's lightness. Falls
 * back to the self-relative `getContrastL` when inactive.
 */
function getContrastL(selfRelativeL: Value, contrastValue: Value) {
  const direction = vars.layerContrastDirection;
  // Use the contrast value as the shift magnitude, pushed in the parent-
  // relative direction (positive = lighter, negative = darker).
  const parentShift = fn.mul(contrastValue, direction);
  const parentTargetL = fn.clamp01(
    fn.add(vars.layerContrastParentL, parentShift),
  );
  const parentDirectedL = getDirectionalLightness(l, parentTargetL, direction);
  // When ak-layer-contrast is active, direction is ±1 so |direction|=1.
  // When inactive, direction=0. Use this as a blend mask.
  const isActive = fn.mul(direction, direction);
  return fn.add(
    fn.mul(parentDirectedL, isActive),
    fn.mul(selfRelativeL, fn.sub(1, isActive)),
  );
}

const layerIdle = fn.oklch(vars.layerIdleAuto, {
  l: getContrastL(vars.layerIdlePushL, vars.layerIdleContrastValue),
});

const layerState = fn.oklch(fn.oklch(vars.layerIdle, stateLayerChannels), {
  l: vars.safeL,
});

const layerAuto = fn.oklch(vars.layerBase, {
  l: getLayerL(inputs.layerAutoL),
});

const layerPush = fn.oklch(vars.layerAuto, {
  l: vars.layerPushL,
});

const layer = fn.oklch(vars.layerPush, {
  l: vars.safeL,
  c: fn.clamp(inputs.layerCMin, c, inputs.layerCMax),
});

/**
 * Shared declarations needed by both ak-layer and ak-text. Sets layerL so that
 * container queries and contrast math work.
 */
function getBaseDeclarations(sourceColor: string | VarProperty) {
  return [
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
  set(vars.contrastPushScale, fn.add(1, fn.mul(vars.contrastT, 3.334))),
  set(
    vars.layerContrastBias,
    fn.mul(fn.neg(vars.contrastT), CONTRAST_SCALE, vars.autoLDirection),
  ),
  set(vars.forbiddenLa, forbiddenLa),
  set(vars.forbiddenLb, forbiddenLb),
  set(vars.autoDirectionToLight, fn.clamp01(vars.autoLDirection)),
  set(vars.safeL, getSafeLightness(l, vars.forbiddenLa, vars.forbiddenLb)),
  set(vars.layerIdleContrastValue, getPushValue(inputs.layerIdleContrastL)),
  set(vars.edgeContrastValue, fn.mul(vars.contrastT, CONTRAST_SCALE)),
];

// Build the layered color stages from idle -> base -> auto -> final.
const layerColorDeclarations = [
  set(vars.layerIdleBase, layerIdleBase),
  set(vars.layerIdleMixed, layerIdleMixed),
  set(vars.layerIdleAuto, layerIdleAuto),
  set(vars.layerIdle, layerIdle),
  set(vars.layerBase, layerState),
  set(vars.layerAuto, layerAuto),
  set(vars.layerPush, layerPush),
];

const edgeBaseColor = fn.var(inputs.edgeColor, vars.layer);
// Borders get a small extra push from the current contrast preference so they
// stay perceptible even when the user does not specify an edge push value.
const edgeDirectionalDelta = fn.add(inputs.edgePushL, vars.edgeContrastValue);
const edgeDirectionalShift = fn.mul(
  edgeDirectionalDelta,
  vars.edgePushDirection,
);
const edgeDirectional = fn.oklch(edgeBaseColor, {
  l: fn.clamp01(fn.add(l, edgeDirectionalShift)),
});
const edgeAlpha = fn.clamp01(fn.add(inputs.edgeA, vars.edgeContrastValue));
const edgeRelative = fn.oklch(edgeDirectional, {
  l: fn.clamp(
    inputs.edgeLMin,
    getLayerL(inputs.edgeRelativeL, inputs.edgeL),
    inputs.edgeLMax,
  ),
  c: fn.clamp(
    inputs.edgeCMin,
    getLayerC(inputs.edgeRelativeC, inputs.edgeC),
    inputs.edgeCMax,
  ),
  h: getLayerH(inputs.edgeRelativeH, inputs.edgeH),
  a: edgeAlpha,
});
const edge = edgeRelative;

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
  l: vars.textForegroundContrastL,
  c: 0,
  h: 0,
});

// Min alpha adapts to layer lightness — higher for mid-lightness backgrounds.
const textMinimumAlpha = fn.add(
  lightDark(
    vars.textMinAlphaOnLightLayer,
    fn.add(vars.textMinAlphaOnDarkLayer, vars.textMinAlphaOnDarkLayerMidBoost),
  ),
  fn.mul(c, 0.135),
  fn.mul(vars.contrastT, TEXT_CONTRAST_SCALE),
);
const textAlpha = fn.max(textMinimumAlpha, inputs.textA);
const text = fn.oklch(vars.layer, {
  l: vars.textForegroundContrastL,
  c: 0,
  h: 0,
});
const inkText = fn.oklch(vars.layer, {
  l: vars.textForegroundContrastL,
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
  at.variant(light, set(vars.edgePushDirection, -1)),
  at.variant(dark, set(vars.edgePushDirection, 1)),
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
  set(
    inputs.layerIdleAutoLDelta,
    fn.mul(getPercentTokenValue("[number]"), vars.autoLDirection),
  ),
  set(
    inputs.layerIdleAutoL,
    withNumericTokenGate(getAutoLDelta(inputs.layerIdleAutoLDelta), "[number]"),
  ),
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

utility(
  "state-*",
  set(
    inputs.layerAutoLDelta,
    fn.mul(getPercentTokenValue("[*]"), vars.autoLDirection),
  ),
  set(
    inputs.layerAutoL,
    withNumericTokenGate(getAutoLDelta(inputs.layerAutoLDelta), "[*]"),
  ),
);

const layerLighten = utility(
  "layer-lighten-*",
  set(inputs.layerIdleRelativeL, getPercentTokenValue("[*]")),
);

utility("layer-darken-*", getNegatedDeclarations(layerLighten));

utility(
  "state-lighten-*",
  set(inputs.layerRelativeL, getPercentTokenValue("[*]")),
);

utility(
  "state-darken-*",
  set(inputs.layerRelativeL, fn.neg(getPercentTokenValue("[*]"))),
);

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
  "layer-push-*",
  set(inputs.layerIdlePushL, getPercentTokenValue("[*]")),
  set(vars.layerIdlePushValue, getPushValue(inputs.layerIdlePushL)),
  set(
    vars.layerIdlePushBaseL,
    getLayerL(fn.mul(vars.layerIdlePushValue, vars.autoLDirection)),
  ),
  set(
    vars.layerIdlePushL,
    getPushL(vars.layerIdlePushValue, vars.layerIdlePushBaseL),
  ),
);

utility(
  "state-push-*",
  set(inputs.layerPushL, getPercentTokenValue("[*]")),
  set(vars.layerPushValue, getPushValue(inputs.layerPushL)),
  set(
    vars.layerPushBaseL,
    getLayerL(fn.mul(vars.layerPushValue, vars.autoLDirection)),
  ),
  set(vars.layerPushL, getPushL(vars.layerPushValue, vars.layerPushBaseL)),
);

utility(
  "layer-contrast",
  set(inputs.layerIdleContrastL, 0.25),
  mapLayerLightnessSteps((parentL, isDark) => [
    set(vars.layerContrastDirection, isDark ? 1 : -1),
    set(vars.layerContrastParentL, parentL),
  ]),
);

utility(
  "layer-contrast-*",
  set(inputs.layerIdleContrastL, getPercentTokenValue("[*]")),
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
  set(inputs.layerCMax, fn.mul(AUTO_CHROMA_COEFFICIENT, l, fn.invert(l))),
);

const layerSaturate = utility(
  "layer-saturate-*",
  set(
    inputs.layerIdleRelativeC,
    getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS),
  ),
);
utility("layer-desaturate-*", getNegatedDeclarations(layerSaturate));

utility(
  "state-saturate-*",
  set(inputs.layerRelativeC, getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "state-desaturate-*",
  set(
    inputs.layerRelativeC,
    fn.neg(getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS)),
  ),
);

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

utility("edge-raw", set(inputs.edgeA, 1), set(inputs.edgePushL, 0));

const edgeLighten = utility(
  "edge-lighten-*",
  set(inputs.edgeRelativeL, getPercentTokenValue("[*]")),
);
utility("edge-darken-*", getNegatedDeclarations(edgeLighten));

utility(
  "edge-cool-*",
  set(inputs.edgeH, getHueToward(h, vars.hueCool, getNumericTokenValue("[*]"))),
);

utility(
  "edge-warm-*",
  set(inputs.edgeH, getHueToward(h, vars.hueWarm, getNumericTokenValue("[*]"))),
);

utility("edge-push-*", set(inputs.edgePushL, getPercentTokenValue("[*]")));

const edgeSaturate = utility(
  "edge-saturate-*",
  set(inputs.edgeRelativeC, getPercentTokenValue("[*]", CHROMA_TOKEN_OPTIONS)),
);
utility("edge-desaturate-*", getNegatedDeclarations(edgeSaturate));

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

utility(
  "edge-max-*",
  set(inputs.edgeCMax, fn.value(chroma)),
  set(inputs.edgeLMax, fn.value("[*]")),
  set(inputs.edgeLMax, getPercentTokenValue("[number]")),
);

utility(
  "edge-min-*",
  set(inputs.edgeCMin, fn.value(chroma)),
  set(inputs.edgeLMin, fn.value("[*]")),
  set(inputs.edgeLMin, getPercentTokenValue("[number]")),
);

utility(
  "edge-max-c-*",
  set(inputs.edgeCMax, fn.value("[*]")),
  set(inputs.edgeCMax, fn.value(chroma)),
  set(inputs.edgeCMax, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
);

utility(
  "edge-min-c-*",
  set(inputs.edgeCMin, fn.value("[*]")),
  set(inputs.edgeCMin, fn.value(chroma)),
  set(inputs.edgeCMin, getPercentTokenValue("[number]", CHROMA_TOKEN_OPTIONS)),
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
});

const textChromaUncapped = fn.clamp(inputs.textCMin, c, inputs.textCMax);
const textUserLightness = fn.clamp(inputs.textLMin, l, inputs.textLMax);
const textContrastChroma = fn.relu(
  fn.sub(vars.textChromaUncapped, CHILD_TEXT_MIN_CONTRAST_CHROMA_START),
);
const textDarkContrastChroma = fn.relu(
  fn.sub(vars.textChromaUncapped, CHILD_TEXT_MIN_CONTRAST_DARK_CHROMA_START),
);
const textDarkReliefChroma = getRampProgress(
  vars.textChromaUncapped,
  CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_MAX_CHROMA,
  CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_CHROMA_FULL,
);
const textDarkDirectionMask = fn.clamp01(vars.textContrastDirection);

function getDarkNeutralTextBoost() {
  const darkNeutralTextMask = fn.binary(
    fn.sub(
      CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_MAX_CHROMA,
      vars.textChromaUncapped,
    ),
  );
  return fn.mul(
    darkNeutralTextMask,
    getRampProgress(
      vars.textParentL,
      CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_BOOST_START_L,
      DARK_THRESHOLD_L,
    ),
    CHILD_TEXT_MIN_CONTRAST_DARK_NEUTRAL_BOOST,
  );
}

function getDarkParentWcagBoost() {
  // Bumps the dark floor by up to `CHILD_TEXT_MIN_CONTRAST_DARK_PARENT_BOOST`
  // as `textParentL` approaches 0. The base 0.47 floor is calibrated for
  // mid-dark parents where the perceptual-to-luminance ramp already yields a
  // >=4.5:1 WCAG contrast; near-black parents fall off that ramp and need a
  // touch more lightness, both for `ak-text-<number>` and `ak-text-push-<number>`.
  return fn.mul(
    getRampProgress(
      fn.sub(CHILD_TEXT_MIN_CONTRAST_DARK_PARENT_BOOST_END_L, vars.textParentL),
      0,
      CHILD_TEXT_MIN_CONTRAST_DARK_PARENT_BOOST_END_L,
    ),
    CHILD_TEXT_MIN_CONTRAST_DARK_PARENT_BOOST,
  );
}

function getDarkTextRelief(userLightness: Value) {
  return getRampProgress(
    userLightness,
    CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_START_L,
    CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_FULL_L,
  );
}

function getLightChromaMinContrast() {
  return fn.add(
    CHILD_TEXT_MIN_CONTRAST_LIGHT,
    fn.mul(
      vars.textContrastChroma,
      fn.sub(
        CHILD_TEXT_MIN_CONTRAST_LIGHT_CHROMA_SCALE,
        fn.mul(
          CHILD_TEXT_MIN_CONTRAST_LIGHT_CHROMA_DAMPING,
          vars.textContrastChroma,
        ),
      ),
    ),
  );
}

function getDarkChromaMinContrast(
  userLightness: Value,
  darkNeutralTextBoost: Value,
  darkParentWcagBoost: Value,
) {
  const darkTextRelief = getDarkTextRelief(userLightness);
  return fn.add(
    CHILD_TEXT_MIN_CONTRAST_DARK,
    darkParentWcagBoost,
    darkNeutralTextBoost,
    fn.mul(
      CHILD_TEXT_MIN_CONTRAST_DARK_CHROMA_SCALE,
      fn.mul(vars.textDarkContrastChroma, vars.textDarkContrastChroma),
      fn.invert(darkTextRelief),
    ),
  );
}

function getTextChromaMinContrast(darkChromaMinContrast: Value) {
  const lightChromaMinContrast = getLightChromaMinContrast();
  return fn.add(
    fn.mul(lightChromaMinContrast, fn.invert(vars.textDarkDirectionMask)),
    fn.mul(darkChromaMinContrast, vars.textDarkDirectionMask),
  );
}

function getTextAccessibleLightness(chromaMinContrast: Value) {
  const textContrastShift = fn.mul(
    fn.add(
      fn.max(chromaMinContrast, inputs.textPushL),
      fn.mul(vars.contrastT, TEXT_CONTRAST_SCALE),
    ),
    vars.textContrastDirection,
  );
  return fn.clamp01(fn.add(vars.textParentL, textContrastShift));
}

function getTextLightnessWithFloor(lightness: Value) {
  const darkNeutralTextBoost = getDarkNeutralTextBoost();
  const darkParentWcagBoost = getDarkParentWcagBoost();
  const darkChromaMinContrast = getDarkChromaMinContrast(
    lightness,
    darkNeutralTextBoost,
    darkParentWcagBoost,
  );
  const chromaMinContrast = getTextChromaMinContrast(darkChromaMinContrast);
  const textAccessibleLightness = getTextAccessibleLightness(chromaMinContrast);
  return getDirectionalLightness(
    lightness,
    textAccessibleLightness,
    vars.textContrastDirection,
  );
}

function getTextDirectional() {
  const textChroma = fn.min(vars.textChromaUncapped, vars.textChromaCap);
  const darkNeutralTextBoost = getDarkNeutralTextBoost();
  const darkParentWcagBoost = getDarkParentWcagBoost();
  const darkReliefParentBaseMask = fn.binary(
    fn.sub(CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_PARENT_MAX_L, vars.textParentL),
  );
  const darkReliefParentMask = fn.invert(
    fn.mul(
      fn.invert(darkReliefParentBaseMask),
      fn.invert(vars.textDarkReliefChroma),
    ),
  );
  const darkNeutralReliefStartLightness = fn.add(
    vars.textParentL,
    CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_NEUTRAL_START_OFFSET,
  );
  const darkReliefStartLightness = mixValues(
    darkNeutralReliefStartLightness,
    CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_VIVID_START_L,
    vars.textDarkReliefChroma,
  );
  const darkAdaptiveTextRelief = fn.mul(
    darkReliefParentMask,
    getRampProgressBySpan(
      vars.textUserLightness,
      darkReliefStartLightness,
      CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_SPAN_L,
    ),
  );
  const darkTextRelief = getDarkTextRelief(vars.textUserLightness);
  // Base floor plus always-on boosts, minus relief reduction, plus the
  // chroma-scaled boost that only kicks in below the `darkTextRelief` ramp.
  // Keeping `darkNeutralTextBoost` outside the ramp ensures mid-to-bright dark
  // parents (parentL ≈ 0.5) still clear 4.5:1 at high `userL` where
  // `darkTextRelief` would otherwise suppress the boost.
  const darkChromaMinContrast = fn.add(
    fn.sub(
      fn.add(
        CHILD_TEXT_MIN_CONTRAST_DARK,
        darkParentWcagBoost,
        darkNeutralTextBoost,
      ),
      fn.mul(
        mixValues(
          CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_NEUTRAL,
          CHILD_TEXT_MIN_CONTRAST_DARK_RELIEF_VIVID,
          vars.textDarkReliefChroma,
        ),
        darkAdaptiveTextRelief,
      ),
    ),
    fn.mul(
      CHILD_TEXT_MIN_CONTRAST_DARK_CHROMA_SCALE,
      fn.mul(vars.textDarkContrastChroma, vars.textDarkContrastChroma),
      fn.invert(darkTextRelief),
    ),
  );
  const chromaMinContrast = getTextChromaMinContrast(darkChromaMinContrast);
  const textAccessibleLightness = getTextAccessibleLightness(chromaMinContrast);
  const textDirectedLightness = getDirectionalLightness(
    vars.textUserLightness,
    textAccessibleLightness,
    vars.textContrastDirection,
  );
  return fn.oklch(textColorAdjusted, {
    l: textDirectedLightness,
    c: textChroma,
  });
}

function getTextDirectionalDeclarations() {
  return [
    set(vars.textChromaUncapped, textChromaUncapped),
    set(vars.textContrastChroma, textContrastChroma),
    set(vars.textDarkContrastChroma, textDarkContrastChroma),
    set(vars.textDarkReliefChroma, textDarkReliefChroma),
    set(vars.textDarkDirectionMask, textDarkDirectionMask),
    set(vars.textUserLightness, textUserLightness),
    set.color(getTextDirectional()),
  ];
}

function getTextLightnessValue(pattern: string) {
  const lightness = getPercentTokenValue(pattern);
  const directionalLightness = fn.add(
    0.5,
    fn.mul(fn.sub(lightness, 0.5), vars.textContrastDirection),
  );
  return getTextLightnessWithFloor(directionalLightness);
}

utility(
  "text",
  set.backgroundColor(fn.important("transparent")),
  set.color(vars.text),
  at.container(fn.style(vars.layerL), ...getTextDirectionalDeclarations()),
  mapAncestorLayerLightnessSteps((parentL, isDark) => [
    set(vars.textContrastDirection, isDark ? 1 : -1),
    set(vars.textParentL, parentL),
    set(vars.textChromaCap, getChildTextChromaCap(parentL, isDark)),
  ]),
);

utility(
  "text-*",
  set(inputs.textC, fn.value(chroma)),
  set(inputs.textH, fn.value(hue)),
  set(inputs.textColor, fn.value(color, "[color]")),
  set(inputs.textL, getTextLightnessValue("[number]")),
);

utility("text-push-*", set(inputs.textPushL, getPercentTokenValue("[*]")));

utility(
  "ink-*",
  set(inputs.textA, getPercentTokenValue("[number]")),
  set(vars.text, inkText),
  set.color(vars.text),
);

utility("text-layer", set(inputs.textColor, vars.layer));

const textLighten = utility(
  "text-lighten-*",
  set(inputs.textRelativeL, getPercentTokenValue("[*]")),
);
utility("text-darken-*", getNegatedDeclarations(textLighten));

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
utility("text-desaturate-*", getNegatedDeclarations(textSaturate));

utility(
  "text-h-rotate-*",
  set(inputs.textRelativeH, getNumericTokenValue("[*]", HUE_TOKEN_OPTIONS)),
);

utility(
  "text-l-*",
  set(inputs.textL, getTextLightnessWithFloor(fn.value("[*]"))),
  set(
    inputs.textL,
    getTextLightnessWithFloor(getPercentTokenValue("[number]")),
  ),
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
const outlineDirectedLightness = getDirectionalLightness(
  l,
  outlineComputedL,
  vars.outlineContrastDirection,
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
utility("outline-darken-*", getNegatedDeclarations(outlineLighten));

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
utility("outline-desaturate-*", getNegatedDeclarations(outlineSaturate));

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
  stretchInset,
  radiusInset,
  childPadding,
  parentRadius,
  parentRow,
  inherit,
  provide,
}: {
  stretchInset: string;
  radiusInset: string;
  childPadding: string;
  parentRadius: string;
  parentRow: string;
  inherit: WithContextParams["inherit"];
  provide: WithContextParams["provide"];
}) {
  const isCol = fn.sub(1, parentRow);
  const isRow = parentRow;
  const negStretchInset = fn.neg(stretchInset);
  // Incorporate user-specified margin (from ak-frame-m-*) additively so
  // both stretch and manual margin adjustments are applied together.
  const totalNegMargin = fn.add(negStretchInset, inputs.frameMargin);
  // Concentric border radius: reduce parent radius by the total visual
  // distance from parent border-box edge to child border-box edge.
  // frameMargin moves the child further inward, so it reduces the radius.
  const childRadius = fn.max(
    fn.sub(parentRadius, fn.add(radiusInset, inputs.frameMargin)),
    "0px",
  );

  // Inherit per-corner flags from the parent stretch element (default: 1 = all
  // corners rounded, provided by the frame utility for non-stretch parents).
  const parentCornerTL = inherit(vars.frameParentCornerTLContext, 1);
  const parentCornerTR = inherit(vars.frameParentCornerTRContext, 1);
  const parentCornerBL = inherit(vars.frameParentCornerBLContext, 1);
  const parentCornerBR = inherit(vars.frameParentCornerBRContext, 1);

  // Own corner factors based on edge position and parent layout direction.
  const ownCornerTL = inputs.frameStart;
  const ownCornerTR = fn.max(
    fn.mul(isCol, inputs.frameStart),
    fn.mul(isRow, inputs.frameEnd),
  );
  const ownCornerBL = fn.max(
    fn.mul(isCol, inputs.frameEnd),
    fn.mul(isRow, inputs.frameStart),
  );
  const ownCornerBR = inputs.frameEnd;

  // Effective corner factors: only round a corner when both this element AND
  // the parent have a rounded corner at the same position.
  const cornerTL = fn.mul(ownCornerTL, parentCornerTL);
  const cornerTR = fn.mul(ownCornerTR, parentCornerTR);
  const cornerBL = fn.mul(ownCornerBL, parentCornerBL);
  const cornerBR = fn.mul(ownCornerBR, parentCornerBR);

  return [
    rule("&:first-child", set(inputs.frameStart, 1)),
    rule(LAST_VISIBLE_SELECTOR, set(inputs.frameEnd, 1)),
    // Keep the frame model aligned with the visual stretch so descendant
    // frames inherit the corrected geometry.
    set(inputs.frameForce, 1),
    set(inputs.frameRadius, childRadius),
    set(inputs.framePadding, childPadding),
    // Override frameMargin so descendants see the total effective margin.
    // This wins over ak-frame's own set(vars.frameMargin, inputs.frameMargin)
    // because ak-frame-cover appears later in the cascade.
    set(vars.frameMargin, totalNegMargin),
    // Override the frame utility's computed radius so the context propagates
    // the stretch-derived value rather than the frame-* hint radius.
    set(vars.frameRadius, childRadius),
    // Propagate per-corner flags to children.
    set(provide(vars.frameParentCornerTLContext), cornerTL),
    set(provide(vars.frameParentCornerTRContext), cornerTR),
    set(provide(vars.frameParentCornerBLContext), cornerBL),
    set(provide(vars.frameParentCornerBRContext), cornerBR),
    // Cross-axis margins always applied; main-axis margins only at edges
    // Col: inline = cross, block = main
    // Row: block = cross, inline = main
    set.margin(
      fn.join(
        [
          fn.mul(
            fn.max(isRow, fn.mul(isCol, inputs.frameStart)),
            vars.frameMargin,
          ),
          fn.mul(
            fn.max(isCol, fn.mul(isRow, inputs.frameEnd)),
            vars.frameMargin,
          ),
          fn.mul(
            fn.max(isRow, fn.mul(isCol, inputs.frameEnd)),
            vars.frameMargin,
          ),
          fn.mul(
            fn.max(isCol, fn.mul(isRow, inputs.frameStart)),
            vars.frameMargin,
          ),
        ],
        " ",
      ),
    ),
    // Corner radii: each corner inherits its parent's corner state.
    set.borderRadius(
      fn.join(
        [
          fn.mul(cornerTL, vars.frameRadius),
          fn.mul(cornerTR, vars.frameRadius),
          fn.mul(cornerBR, vars.frameRadius),
          fn.mul(cornerBL, vars.frameRadius),
        ],
        " ",
      ),
    ),
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
  set.borderRadius(vars.frameRadius),
  set.margin(vars.frameMargin),
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
    // When parent padding + margin >= 1rem, the child is far enough from
    // the parent edge that concentric radius is not meaningful — use the
    // child's own declared radius instead.
    //
    // Formula: max(auto - inflated, min(declared, auto + inflated))
    //   No cap  (excess=0): max(auto, min(declared, auto)) = auto
    //   Cap     (excess>0): max(auto - huge, min(declared, auto + huge))
    //                      = max(negative, declared) = declared
    //
    // Subtract 0.5px so that exactly 1rem triggers the cap (>= not >).
    const excess = fn.max(
      fn.sub(parentPaddingAndMargin, fn.sub(FRAME_PADDING_CAP, "0.5px")),
      "0px",
    );
    // Must exceed the browser's max representable length (~3.35e7px for
    // infinity-based radii like rounded-full). 0.5px * 1e9 = 5e8 >> 3.35e7.
    const inflatedExcess = fn.mul(excess, 1e9);
    const cappedRadius = fn.max(
      fn.sub(autoRadius, inflatedExcess),
      fn.min(inputs.frameRadius, fn.add(autoRadius, inflatedExcess)),
    );
    // When forced, use the declared radius directly.
    const frameRadius = fn.add(
      fn.mul(inputs.frameForce, inputs.frameRadius),
      fn.mul(fn.sub(1, inputs.frameForce), cappedRadius),
    );
    return [
      set(vars.frameRadius, frameRadius),
      set(provide(vars.frameParentRadiusContext), vars.frameRadius),
      set(provide(vars.frameParentPaddingContext), vars.framePadding),
      set(provide(vars.frameParentBorderContext), vars.frameBorder),
      set(provide(vars.frameParentRingContext), vars.frameRing),
      set(provide(vars.frameParentRowContext), inputs.frameRow),
      // Default: all corners rounded (non-stretch parents).
      set(provide(vars.frameParentCornerTLContext), 1),
      set(provide(vars.frameParentCornerTRContext), 1),
      set(provide(vars.frameParentCornerBLContext), 1),
      set(provide(vars.frameParentCornerBRContext), 1),
    ];
  }),
);

utility("frame-force", set(inputs.frameForce, 1));

utility(
  "frame-*",
  set(inputs.frameRadius, fn.value(radius, "[*]")),
  set(inputs.framePadding, fn.modifier(spacing, "[*]")),
  set(inputs.framePadding, fn.spacing(fn.modifier("number"))),
);

utility("frame-rounded-*", set(inputs.frameRadius, fn.value(radius, "[*]")));
utility("frame-rounded-none", set(inputs.frameRadius, "0px"));

utility(
  "frame-p-*",
  set(inputs.framePadding, fn.value(spacing, "[*]")),
  set(inputs.framePadding, fn.spacing(fn.value("number"))),
);

const frameMargin = utility(
  "frame-m-*",
  set(inputs.frameMargin, fn.value(spacing, "[*]")),
  set(inputs.frameMargin, fn.spacing(fn.value("number", "[number]"))),
);
utility("-frame-m-*", getNegatedDeclarations(frameMargin));

utility(
  "frame-cover",
  frameContext(({ inherit, provide }) => {
    const parentPadding = inherit(vars.frameParentPaddingContext, "0px");
    const parentBorder = inherit(vars.frameParentBorderContext, "0px");
    const parentRadius = inherit(vars.frameParentRadiusContext, "0px");
    const parentRow = inherit(vars.frameParentRowContext, "0");
    // Stretch past parent content box by the child's own border width so
    // the child's content box aligns with the parent's content box. This
    // also collapses borders/rings when both parent and child have them.
    const stretchInset = fn.add(parentPadding, inputs.frameBorder);
    const radiusInset = fn.sub(parentBorder, inputs.frameBorder);
    return getFrameStretchDeclarations({
      stretchInset,
      radiusInset,
      childPadding: parentPadding,
      parentRadius,
      parentRow,
      inherit,
      provide,
    });
  }),
);

utility("frame-row", set(inputs.frameRow, 1));
utility("frame-col", set(inputs.frameRow, 0));

utility("frame-start", set(inputs.frameStart, 1));
utility("frame-end", set(inputs.frameEnd, 1));

utility(
  "frame-border",
  set(inputs.frameBorder, "1px"),
  set.borderWidth(inputs.frameBorder),
);
utility(
  "frame-border-*",
  getFrameBorderWidthDeclarations(inputs.frameBorder),
  set.borderWidth(inputs.frameBorder),
);

utility("frame-ring", set(inputs.frameRing, "1px"));
utility("frame-ring-*", getFrameBorderWidthDeclarations(inputs.frameRing));

function getFrameBorderingDarkLight() {
  // When the layer is darkening relative to its parent (ak-layer-darken-*),
  // reverse the border/ring condition so the edge style matches the visual
  // context: border for darker surfaces, ring for lighter ones.
  const isDarkening = fn.binary(fn.neg(inputs.layerIdleRelativeL));
  const isLightening = fn.invert(isDarkening);
  const borderVal = fn.mul(isLightening, inputs.frameBordering);
  const ringVal = fn.mul(isDarkening, inputs.frameBordering);
  return [
    at.variant(
      dark,
      set(inputs.frameBorder, borderVal),
      set.borderWidth(borderVal),
      set(inputs.frameRing, ringVal),
    ),
    at.variant(
      light,
      set(inputs.frameBorder, ringVal),
      set.borderWidth(ringVal),
      set(inputs.frameRing, borderVal),
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
