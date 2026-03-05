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

const l = "l";
const c = "c";
const h = "h";
const CHROMA_MAX_SRGB = 0.32;
const CHROMA_MAX_P3 = 0.368;
const CHROMA_MAX_REC2020 = 0.467;
const CHROMA_MAX = CHROMA_MAX_P3;
const DARK_THRESHOLD_L = 58.82;
const DARK_THRESHOLD_OKL = 0.645;
const CONTRAST_HIGH = 100;
const LA_BASE = 0.55;
const LB_BASE = 0.725;
const DARK_HIGH_MAX_L = roundToDecimals(LA_BASE / 2, 4);
const LIGHT_LOW_SPLIT_REFERENCE_MAX_L = 0.99;
const LIGHT_LOW_MAX_L = roundToDecimals(
  (LB_BASE + LIGHT_LOW_SPLIT_REFERENCE_MAX_L) / 2,
  4,
);
const BAND_LEVEL_DARK_HIGH = 0;
const BAND_LEVEL_DARK_LOW = 0.25;
const BAND_LEVEL_MID = 0.5;
const BAND_LEVEL_LIGHT_LOW = 0.75;
const BAND_LEVEL_LIGHT_HIGH = 1;
const L_SPREAD_RATIO = 0.15;
const FORBIDDEN_RANGE_LA_MIN = 0.2;
const FORBIDDEN_RANGE_LB_MAX = 0.9;

const textContrastOkL = fn.inflate(fn.sub(DARK_THRESHOLD_OKL, "l"));
const textContrastL = fn.inflate(fn.sub(DARK_THRESHOLD_L, "l"));
const darkOkL = fn.clamp01(textContrastOkL);
const lightOkL = fn.clamp01(fn.invert(textContrastOkL));
const darkL = fn.clamp01(textContrastL);
const lightL = fn.clamp01(fn.invert(textContrastL));

const laSpread = L_SPREAD_RATIO * LA_BASE;
const lbSpread = L_SPREAD_RATIO * (1 - LB_BASE);
// Calibrate contrast so `contrastT=1` reaches the configured hard bounds.
const laSpreadContrastMultiplier = roundToDecimals(
  (LA_BASE - FORBIDDEN_RANGE_LA_MIN) / laSpread,
  4,
);
const lbSpreadContrastMultiplier = roundToDecimals(
  (FORBIDDEN_RANGE_LB_MAX - LB_BASE) / lbSpread,
  4,
);

const utilities = new Set<ReturnType<typeof ak.utility>>();

/**
 * Registers an `ak` utility and stores it for the exported input list.
 */
function utility(...args: Parameters<typeof ak.utility>) {
  const utility = ak.utility(...args);
  utilities.add(utility);
  return utility;
}

/**
 * Builds quoted numeric tokens for `--value()` utility ranges.
 */
function numbers({
  min = 0,
  max = 100,
  step = 5,
}: {
  min?: number;
  max?: number;
  step?: number;
} = {}) {
  return Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => `"${min + i * step}"`,
  ).join(", ");
}

/**
 * Returns declaration children with their values negated. Used to derive
 * inverse utilities from the positive definitions.
 */
function negChildren(rule: ReturnType<typeof utility>) {
  return rule.children
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
function roundToDecimals(n: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

/**
 * Returns whether `value` is within `[min, max]`
 */
function getInRange(value: Value, min: number, max: number) {
  return fn.mul(
    fn.binary(fn.sub(value, min - 1e-6)),
    fn.binary(fn.sub(max, value)),
  );
}

/**
 * Returns whether `l` is inside the forbidden lightness interval. The value is
 * 0 outside `[la, lb]` and approaches 1 inside it.
 */
function getInForbiddenRange(l: Value, la: Value, lb: Value) {
  return fn.binary(fn.mul(fn.sub(l, la), fn.sub(lb, l)));
}

/**
 * Returns which forbidden boundary should be used for `l`. The result is 0 on
 * the lower side and 1 on the upper side.
 */
function getForbiddenDirection(l: Value, la: Value, lb: Value) {
  return fn.binary(fn.sub(l, fn.half(fn.add(la, lb))));
}

/**
 * Keeps lightness outside the forbidden interval. When `l` enters it, the value
 * is blended toward `la` or `lb`.
 */
function getSafeLightness(l: Value, la: Value, lb: Value) {
  const direction = getForbiddenDirection(l, la, lb);
  const inForbiddenRange = getInForbiddenRange(l, la, lb);
  return fn.add(
    fn.mul(l, fn.invert(inForbiddenRange)),
    fn.mul(
      fn.add(fn.mul(la, fn.invert(direction)), fn.mul(lb, direction)),
      inForbiddenRange,
    ),
  );
}

/**
 * Computes an automatic lightness delta that avoids forbidden lightness. If the
 * next lightness enters the forbidden interval, direction is reduced and can
 * flip.
 */
function getAutoLightness(
  value: Value,
  direction: Value,
  la: Value,
  lb: Value,
) {
  const nextL = fn.add(l, fn.mul(value, direction));
  const nextLInForbiddenRange = getInForbiddenRange(nextL, la, lb);
  // Maps mask {0,1} to {+1,-1}: keep direction outside, flip inside.
  const shiftedDirection = fn.mul(
    direction,
    fn.invert(fn.double(nextLInForbiddenRange)),
  );
  return fn.mul(value, shiftedDirection);
}

/**
 * Blends separate light and dark values by the active appearance weights.
 */
function oklchLightDark(light: Value, dark: Value) {
  return fn.add(fn.mul(vars.lightOkL, light), fn.mul(vars.darkOkL, dark));
}

/**
 * Returns all CSS color interpolation methods for `color-mix()`.
 */
function colorMixMethods() {
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
    ...polar.flatMap((s) => [s, ...hueStrategies.map((h) => `${s} ${h} hue`)]),
  ];
}

const ak = createNamespace("ak");
const _ak = createNamespace("_ak");
const hue = createNamespace("hue");
const color = createNamespace("color");
const chroma = createNamespace("chroma");
const mix = createNamespace("mix");

const contrast = createVar("--contrast", 0);
const contrastTValue = fn.div(fn.relu(contrast), CONTRAST_HIGH);
const chromaT = fn.div(fn.min(c, CHROMA_MAX), CHROMA_MAX);

// Band membership expressions — depend only on `l` and fixed constants.
const bandDarkHigh = getInRange(l, 0, DARK_HIGH_MAX_L);
const bandDarkLow = getInRange(l, DARK_HIGH_MAX_L, LA_BASE);
const bandLightLow = getInRange(l, LB_BASE, LIGHT_LOW_MAX_L);
const bandLightHigh = fn.binary(fn.sub(l, LIGHT_LOW_MAX_L));

// Constants registered once as @property initial values. They only depend on
// color channels or fixed numeric constants.
const constantMathVars = {
  textContrastL: _ak.prop("tcl", { initial: textContrastL }),
  textContrastOkL: _ak.prop("tcokl", { initial: textContrastOkL }),
  forbiddenLaBase: _ak.prop("flab", {
    initial: fn.sub(LA_BASE, fn.mul(chromaT, laSpread)),
  }),
  forbiddenLbBase: _ak.prop("flbb", {
    initial: fn.add(LB_BASE, fn.mul(chromaT, lbSpread)),
  }),
  autoLDirection: _ak.prop("ald", { initial: fn.sub(darkOkL, lightOkL) }),
  darkOkL: _ak.prop("dokl", { initial: darkOkL }),
  lightOkL: _ak.prop("lokl", { initial: lightOkL }),
  darkL: _ak.prop("dl", { initial: darkL }),
  lightL: _ak.prop("ll", { initial: lightL }),
  bandDarkHigh: _ak.prop("bdh", { initial: bandDarkHigh }),
  bandDarkLow: _ak.prop("bdl", { initial: bandDarkLow }),
  bandLightLow: _ak.prop("bll", { initial: bandLightLow }),
  bandLightHigh: _ak.prop("blh", { initial: bandLightHigh }),
};

// Utility-assigned math values. These depend on other vars and are resolved in
// @utility ak-layer.
const layerMathVars = {
  contrastT: _ak.prop("ct"),
  contrastNegative: _ak.prop("cn"),
  lContrast: _ak.prop("lc"),
  forbiddenLa: _ak.prop("fla"),
  forbiddenLb: _ak.prop("flb"),
  safeOkL: _ak.prop("sokl"),
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
  layerScheme: _ak.prop.black("lsch", { inherits: true }),
  layerBand: _ak.prop.black("lbnd", { inherits: true }),
  layerBase: _ak.prop.canvas("lb"),
  layerAuto: _ak.prop.canvas("la"),
  layerContrast: _ak.prop.canvas("lct"),
  layer: ak.prop.canvas("layer", { inherits: true }),
  layerParentContext: _ak.var("lpc"),
  layerParent: ak.prop.canvas("layer-parent", { inherits: true }),
  edge: ak.prop.black("edge"),
  text: ak.prop.black("text", { inherits: true }),
};

const vars = {
  contrast,
  ...constantMathVars,
  ...layerMathVars,
  ...themeTokenVars,
  ...layerColorVars,
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
  ...colorMixMethods().map((m) => set(mix.var(m.replaceAll(" ", "-"), m))),
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
  );
}

/**
 * Applies contrast lightness while stopping at forbidden boundaries.
 * This keeps contrast adjustments from crossing the unsafe lightness band.
 */
function getContrastL(contrastValue: Value) {
  const direction = vars.autoLDirection;
  const la = vars.forbiddenLa;
  const lb = vars.forbiddenLb;
  const nextL = fn.add(l, fn.mul(contrastValue, direction));
  const reachedFromDarkSide = fn.binary(fn.sub(nextL, la));
  const reachedFromLightSide = fn.binary(fn.sub(lb, nextL));
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
  const targetL = fn.add(
    fn.mul(nextL, fn.invert(reachedForbiddenRange)),
    fn.mul(vars.directionalBoundaryL, reachedForbiddenRange),
  );
  return targetL;
}

/**
 * Resolves layer lightness from relative offset and optional absolute input.
 */
function getLayerL(relativeL: Value, absoluteL?: VarProperty) {
  const lMin = fn.max("l", fn.min(0.13, relativeL));
  const lDefault = fn.add(lMin, relativeL);
  return absoluteL ? fn.var(absoluteL, lDefault) : lDefault;
}

/**
 * Resolves layer chroma from relative offset and optional absolute input.
 */
function getLayerC(relativeC: Value, absoluteC?: VarProperty) {
  const cDefault = fn.add("c", relativeC);
  return absoluteC ? fn.var(absoluteC, cDefault) : cDefault;
}

/**
 * Resolves layer hue from relative offset and optional absolute input.
 */
function getLayerH(relativeH: Value, absoluteH?: VarProperty) {
  const hDefault = fn.add("h", relativeH);
  return absoluteH ? fn.var(absoluteH, hDefault) : hDefault;
}

const idle = {
  l: getLayerL(inputs.layerIdleRelativeL, inputs.layerL),
  c: getLayerC(inputs.layerIdleRelativeC, inputs.layerC),
  h: getLayerH(inputs.layerIdleRelativeH, inputs.layerH),
};

const state = {
  l: getLayerL(inputs.layerRelativeL),
  c: getLayerC(inputs.layerRelativeC),
  h: getLayerH(inputs.layerRelativeH),
};

const forbiddenLa = fn.max(
  FORBIDDEN_RANGE_LA_MIN,
  fn.sub(
    vars.forbiddenLaBase,
    fn.mul(vars.contrastT, laSpread, laSpreadContrastMultiplier),
  ),
);
const forbiddenLb = fn.min(
  FORBIDDEN_RANGE_LB_MAX,
  fn.add(
    vars.forbiddenLbBase,
    fn.mul(vars.contrastT, lbSpread, lbSpreadContrastMultiplier),
  ),
);

const layerBaseColor = fn.var(inputs.layerColor, vars.layerParent);
const layerIdleBase = fn.oklch(layerBaseColor, idle);
const layerIdleMixed = fn.var(inputs.layerMix, vars.layerIdleBase);
const layerIdleAuto = fn.oklch(vars.layerIdleMixed, {
  l: fn.add(
    fn.clamp(
      inputs.layerLMin,
      getLayerL(vars.layerIdleAutoDelta),
      inputs.layerLMax,
    ),
    vars.lContrast,
  ),
});
const layerIdle = fn.oklch(vars.layerIdleAuto, {
  l: getContrastL(vars.layerIdleContrastValue),
});

const layerBase = fn.oklch(fn.oklch(vars.layerIdle, state), {
  l: vars.safeOkL,
});

const layerAuto = fn.oklch(vars.layerBase, {
  l: getLayerL(vars.layerAutoDelta),
});

const layerContrast = fn.oklch(vars.layerAuto, {
  l: getContrastL(vars.layerContrastValue),
});

const layer = fn.oklch(vars.layerContrast, {
  l: vars.safeOkL,
  c: fn.clamp(inputs.layerCMin, "c", inputs.layerCMax),
});

// Assign derived math first so later color stages can reference short vars.
const layerMathDeclarations = [
  set(vars.contrastT, contrastTValue),
  set(vars.contrastNegative, fn.min(0, fn.min(1, fn.neg(vars.contrastT)))),
  set(
    vars.lContrast,
    fn.mul(vars.contrastNegative, oklchLightDark(-0.3334, 0.3334)),
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
  set(vars.safeOkL, getSafeLightness(l, vars.forbiddenLa, vars.forbiddenLb)),
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
const edgeContrastT = fn.var(vars.contrastT, contrastTValue);
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

const layerBandL = fn.add(
  BAND_LEVEL_MID,
  fn.mul(vars.bandDarkHigh, BAND_LEVEL_DARK_HIGH - BAND_LEVEL_MID),
  fn.mul(vars.bandDarkLow, BAND_LEVEL_DARK_LOW - BAND_LEVEL_MID),
  fn.mul(vars.bandLightLow, BAND_LEVEL_LIGHT_LOW - BAND_LEVEL_MID),
  fn.mul(vars.bandLightHigh, BAND_LEVEL_LIGHT_HIGH - BAND_LEVEL_MID),
);
const layerBand = fn.oklch(vars.layer, { l: layerBandL, c: 0, h: 0 });
const layerScheme = fn.oklch(vars.layer, {
  l: vars.textContrastOkL,
  c: 0,
  h: 0,
});

const layerContext = createContext();

utility(
  "layer",
  set.color(vars.text),
  set.borderColor(vars.edge),
  set.backgroundColor(vars.layer),
  at.apply`ring-[color:${vars.edge}]`,
  set(vars.layer, layer),
  set(vars.text, fn.exp`lch(from ${vars.layer} ${vars.textContrastL} 0 0)`),
  set(vars.edge, edge),
  set(vars.layerBand, layerBand),
  set(vars.layerScheme, layerScheme),
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
  set(
    inputs.layerIdleAutoL,
    fn.div(fn.value("number", "[number]", numbers()), 100),
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
  set(
    inputs.layerMixAmount,
    fn.toPercent(fn.value("number", "[number]", numbers())),
  ),
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
  set(inputs.layerAutoL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

const layerLighten = utility(
  "layer-lighten-*",
  set(
    inputs.layerIdleRelativeL,
    fn.div(fn.value("number", "[*]", numbers()), 100),
  ),
);

utility("layer-darken-*", ...negChildren(layerLighten));

const stateLighten = utility(
  "state-lighten-*",
  set(inputs.layerRelativeL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

utility("state-darken-*", ...negChildren(stateLighten));

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
    getHueToward("h", vars.hueCool, fn.value("number", "[*]", numbers())),
  ),
);

utility(
  "layer-warm-*",
  set(
    inputs.layerH,
    getHueToward("h", vars.hueWarm, fn.value("number", "[*]", numbers())),
  ),
);

utility(
  "layer-contrast-*",
  set(
    inputs.layerIdleContrastL,
    fn.div(fn.value("number", "[*]", numbers()), 100),
  ),
);

utility(
  "state-contrast-*",
  set(inputs.layerContrastL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

utility(
  "layer-max-*",
  set(inputs.layerCMax, fn.value(chroma)),
  set(inputs.layerLMax, fn.value("[*]")),
  set(inputs.layerLMax, fn.div(fn.value("number", "[number]", numbers()), 100)),
);

utility(
  "layer-min-*",
  set(inputs.layerCMin, fn.value(chroma)),
  set(inputs.layerLMin, fn.value("[*]")),
  set(inputs.layerLMin, fn.div(fn.value("number", "[number]", numbers()), 100)),
);

utility(
  "layer-max-c-*",
  set(inputs.layerCMax, fn.value("[*]")),
  set(inputs.layerCMax, fn.value(chroma)),
  set(
    inputs.layerCMax,
    fn.div(fn.value("number", "[number]", numbers({ max: 40 })), 100),
  ),
);

utility(
  "layer-min-c-*",
  set(inputs.layerCMin, fn.value("[*]")),
  set(inputs.layerCMin, fn.value(chroma)),
  set(
    inputs.layerCMin,
    fn.div(fn.value("number", "[number]", numbers({ max: 40 })), 100),
  ),
);

utility(
  "layer-max-c-auto",
  // Keep chroma near zero at lightness extremes and peak at threshold.
  set(
    inputs.layerCMax,
    fn.mul(
      CHROMA_MAX,
      fn.div(l, DARK_THRESHOLD_OKL),
      fn.div(fn.invert(l), fn.invert(DARK_THRESHOLD_OKL)),
    ),
  ),
);

const layerSaturate = utility(
  "layer-saturate-*",
  set(
    inputs.layerIdleRelativeC,
    fn.div(fn.value("number", "[*]", numbers({ max: 40 })), 100),
  ),
);
utility("layer-desaturate-*", ...negChildren(layerSaturate));

const stateSaturate = utility(
  "state-saturate-*",
  set(
    inputs.layerRelativeC,
    fn.div(fn.value("number", "[*]", numbers({ max: 40 })), 100),
  ),
);
utility("state-desaturate-*", ...negChildren(stateSaturate));

utility(
  "layer-h-rotate-*",
  set(
    inputs.layerIdleRelativeH,
    fn.value("number", "[*]", numbers({ max: 360, step: 15 })),
  ),
);

utility(
  "state-h-rotate-*",
  set(
    inputs.layerRelativeH,
    fn.value("number", "[*]", numbers({ max: 360, step: 15 })),
  ),
);

utility(
  "layer-l-*",
  set(inputs.layerL, fn.value("[*]")),
  set(inputs.layerL, fn.div(fn.value("number", "[number]", numbers()), 100)),
);

utility(
  "layer-c-*",
  set(inputs.layerC, fn.value("[*]")),
  set(inputs.layerC, fn.value(chroma)),
  set(
    inputs.layerC,
    fn.div(fn.value("number", "[number]", numbers({ max: 40 })), 100),
  ),
);

utility(
  "layer-h-*",
  set(inputs.layerH, fn.value(hue, "[*]")),
  set(
    inputs.layerH,
    fn.value("number", "[number]", numbers({ max: 360, step: 15 })),
  ),
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
  set(inputs.edgeA, fn.div(fn.value("number", "[number]", numbers()), 100)),
);

const edgeLighten = utility(
  "edge-lighten-*",
  set(inputs.edgeRelativeL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);
utility("edge-darken-*", ...negChildren(edgeLighten));

utility(
  "edge-cool-*",
  set(
    inputs.edgeH,
    getHueToward("h", vars.hueCool, fn.value("number", "[*]", numbers())),
  ),
);

utility(
  "edge-warm-*",
  set(
    inputs.edgeH,
    getHueToward("h", vars.hueWarm, fn.value("number", "[*]", numbers())),
  ),
);

utility(
  "edge-contrast-*",
  set(inputs.edgeContrastL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

const edgeSaturate = utility(
  "edge-saturate-*",
  set(
    inputs.edgeRelativeC,
    fn.div(fn.value("number", "[*]", numbers({ max: 40 })), 100),
  ),
);
utility("edge-desaturate-*", ...negChildren(edgeSaturate));

utility(
  "edge-h-rotate-*",
  set(
    inputs.edgeRelativeH,
    fn.value("number", "[*]", numbers({ max: 360, step: 15 })),
  ),
);

utility(
  "edge-l-*",
  set(inputs.edgeL, fn.value("[*]")),
  set(inputs.edgeL, fn.div(fn.value("number", "[number]", numbers()), 100)),
);

utility(
  "edge-c-*",
  set(inputs.edgeC, fn.value("[*]")),
  set(inputs.edgeC, fn.value(chroma)),
  set(
    inputs.edgeC,
    fn.div(fn.value("number", "[number]", numbers({ max: 40 })), 100),
  ),
);

utility(
  "edge-h-*",
  set(inputs.edgeH, fn.value(hue, "[*]")),
  set(
    inputs.edgeH,
    fn.value("number", "[number]", numbers({ max: 360, step: 15 })),
  ),
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
