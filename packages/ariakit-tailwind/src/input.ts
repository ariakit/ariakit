import type { Value, VarProperty } from "./utils2.ts";
import {
  at,
  createNamespace,
  createVar,
  createVariant,
  fn,
  rule,
  set,
} from "./utils2.ts";

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
const laSpreadContrastMultiplier =
  (LA_BASE - FORBIDDEN_RANGE_LA_MIN) / laSpread;
const lbSpreadContrastMultiplier =
  (FORBIDDEN_RANGE_LB_MAX - LB_BASE) / lbSpread;
const chromaT = fn.div(fn.min(c, CHROMA_MAX), CHROMA_MAX);

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

const ak = createNamespace("ak");
const _ak = createNamespace("_ak");
const hue = createNamespace("hue");
const color = createNamespace("color");
const chroma = createNamespace("chroma");

const contrast = createVar("--contrast", 0);
const contrastT = fn.div(fn.relu(contrast), CONTRAST_HIGH);

const vars = {
  contrast,
  textContrastL: _ak.prop("text-contrast-l", { initialValue: textContrastL }),
  textContrastOkL: _ak.prop("text-contrast-okl", {
    initialValue: textContrastOkL,
  }),
  forbiddenLaBase: _ak.prop("forbidden-la-base", {
    initialValue: fn.sub(LA_BASE, fn.mul(chromaT, laSpread)),
  }),
  forbiddenLbBase: _ak.prop("forbidden-lb-base", {
    initialValue: fn.add(LB_BASE, fn.mul(chromaT, lbSpread)),
  }),
  autoLDirection: _ak.prop("auto-l-direction", {
    initialValue: fn.sub(darkOkL, lightOkL),
  }),
  forbiddenLa: _ak.prop("forbidden-la"),
  forbiddenLb: _ak.prop("forbidden-lb"),
  safeOkL: _ak.prop("safe-okl"),
  darkOkL: _ak.prop("dark-okl", { initialValue: darkOkL }),
  lightOkL: _ak.prop("light-okl", { initialValue: lightOkL }),
  darkL: _ak.prop("dark-l", { initialValue: darkL }),
  lightL: _ak.prop("light-l", { initialValue: lightL }),
  layerBase: ak.prop.white("layer-base"),
  layerIdleMixed: _ak.prop.white("layer-idle-mixed"),
  layerIdleToggled: _ak.prop.white("layer-idle-toggled"),
  layerIdle: _ak.prop.white("layer-idle"),
  layerAppearance: _ak.prop.black("layer-appearance", { inherits: true }),
  stateBase: ak.prop.white("state-base"),
  layerMixed: ak.prop.white("layer-mixed"),
  layerToggled: ak.prop.white("layer-toggled"),
  layer: ak.prop.white("layer", { inherits: true }),
  layerParent: ak.prop.white("layer-parent", { inherits: true }),
  edge: ak.prop.black("edge"),
  edgeL: _ak.prop("edge-l"),
  text: ak.prop.black("text", { inherits: true }),
  chromaSrgbMax: chroma.var("srgb-max", CHROMA_MAX_SRGB),
  chromaP3Max: chroma.var("p3-max", CHROMA_MAX_P3),
  chromaRec2020Max: chroma.var("rec2020-max", CHROMA_MAX_REC2020),
  hueWarm: hue.var("warm", 90),
  hueCool: hue.var("cool", 220),
  shadow: ak.prop.color("shadow", {
    inherits: true,
    initialValue: fn.oklch({ a: "15%" }),
  }),
};

const inputs = {
  layerColor: _ak.prop("layer-color"),
  layerAutoL: _ak.prop("layer-auto-lightness", 0),
  layerRelativeL: _ak.prop("layer-relative-lightness", 0),
  layerRelativeC: _ak.prop("layer-relative-chroma", 0),
  layerRelativeH: _ak.prop("layer-relative-hue", 0),
  layerContrastL: _ak.prop("layer-contrast-lightness", 0),
  layerL: _ak.prop("layer-lightness"),
  layerC: _ak.prop("layer-chroma"),
  layerH: _ak.prop("layer-hue"),
  layerLMin: _ak.prop("layer-lightness-min", 0),
  layerLMax: _ak.prop("layer-lightness-max", 1),
  layerCMin: _ak.prop("layer-chroma-min", 0),
  layerCMax: _ak.prop("layer-chroma-max", vars.chromaP3Max),
  stateAutoL: _ak.prop("state-auto-lightness", 0),
  stateRelativeL: _ak.prop("state-relative-lightness", 0),
  stateRelativeC: _ak.prop("state-relative-chroma", 0),
  stateRelativeH: _ak.prop("state-relative-hue", 0),
  stateContrastL: _ak.prop("state-contrast-lightness", 0),
  edgeL: _ak.prop("edge-l"),
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
);

const forbiddenLa = fn.max(
  FORBIDDEN_RANGE_LA_MIN,
  fn.sub(
    vars.forbiddenLaBase,
    fn.mul(contrastT, laSpread, laSpreadContrastMultiplier),
  ),
);
const forbiddenLb = fn.min(
  FORBIDDEN_RANGE_LB_MAX,
  fn.add(
    vars.forbiddenLbBase,
    fn.mul(contrastT, lbSpread, lbSpreadContrastMultiplier),
  ),
);

const dark = createVariant(
  "ak-dark",
  at.container(fn.style(vars.layerAppearance, "oklch(1 0 0)"), set("@slot")),
);

const light = createVariant(
  "ak-light",
  at.container(fn.style(vars.layerAppearance, "oklch(0 0 0)"), set("@slot")),
);

const root = rule(
  ":root",
  at.variant("contrast-more", set(vars.contrast, CONTRAST_HIGH)),
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

// Keep edge contrast directional: darker in light mode, lighter in dark mode.
const edgeL = {
  light: fn.min(
    "l",
    fn.sub(
      fn.var(inputs.edgeL, fn.mul(inputs.edgeL, 0.15)),
      fn.mul(contrastT, 0.45),
    ),
  ),
  dark: fn.max(
    fn.max("l", 0.13),
    fn.add(
      fn.var(inputs.edgeL, fn.invert(fn.mul(inputs.edgeL, 0.1))),
      fn.mul(contrastT, 0.3),
    ),
  ),
};

// Push schemes away from the middle: lighten light mode, darken dark mode.
const contrastNegative = fn.min(0, fn.min(1, fn.neg(contrastT)));
const lContrast = fn.mul(contrastNegative, oklchLightDark(-0.3334, 0.3334));

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
function getContrastL(value: Value) {
  // Scale local contrast utility by global contrast preference.
  const contrastValue = fn.add(value, fn.mul(value, contrastT, 3.334));
  const direction = vars.autoLDirection;
  const la = vars.forbiddenLa;
  const lb = vars.forbiddenLb;
  const nextL = fn.add(l, fn.mul(contrastValue, direction));
  const directionToLight = fn.clamp01(direction);
  const directionToDark = fn.clamp01(fn.neg(direction));
  const reachedFromDarkSide = fn.binary(fn.sub(nextL, la));
  const reachedFromLightSide = fn.binary(fn.sub(lb, nextL));
  const valueEnabled = fn.binary(contrastValue);
  // Only evaluate the boundary that matches current travel direction.
  const reachedForbiddenRange = fn.mul(
    valueEnabled,
    fn.add(
      fn.mul(directionToLight, reachedFromDarkSide),
      fn.mul(directionToDark, reachedFromLightSide),
    ),
  );
  const directionalBoundary = fn.add(
    fn.mul(la, fn.invert(directionToLight)),
    fn.mul(lb, directionToLight),
  );
  // Once boundary is reached, snap to the directional side of the band.
  const targetL = fn.add(
    fn.mul(nextL, fn.invert(reachedForbiddenRange)),
    fn.mul(directionalBoundary, reachedForbiddenRange),
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
  l: getLayerL(inputs.layerRelativeL, inputs.layerL),
  c: getLayerC(inputs.layerRelativeC, inputs.layerC),
  h: getLayerH(inputs.layerRelativeH, inputs.layerH),
};

const state = {
  l: getLayerL(inputs.stateRelativeL),
  c: getLayerC(inputs.stateRelativeC),
  h: getLayerH(inputs.stateRelativeH),
};

const layerIdle = fn.oklch(
  fn.oklch(vars.layerIdleMixed, {
    l: fn.add(
      fn.clamp(
        inputs.layerLMin,
        getLayerL(getAutoL(inputs.layerAutoL)),
        inputs.layerLMax,
      ),
      lContrast,
    ),
  }),
  { l: getContrastL(inputs.layerContrastL) },
);

const stateBase = fn.oklch(fn.oklch(vars.layerIdle, state), {
  l: vars.safeOkL,
});

const layer = fn.oklch(
  fn.oklch(
    fn.oklch(vars.layerMixed, {
      l: getLayerL(getAutoL(inputs.stateAutoL)),
    }),
    { l: getContrastL(inputs.stateContrastL) },
  ),
  { l: vars.safeOkL, c: fn.clamp(inputs.layerCMin, "c", inputs.layerCMax) },
);

utility(
  "layer",
  at.apply`ring-[color:${vars.edge}]`,
  set(vars.shadow, "oklch(0 0 0 / 15%)"),
  set(vars.text, fn.exp`lch(from ${vars.layer} ${textContrastL} 0 0)`),
  set(vars.forbiddenLa, forbiddenLa),
  set(vars.forbiddenLb, forbiddenLb),
  set(vars.safeOkL, getSafeLightness(l, vars.forbiddenLa, vars.forbiddenLb)),
  set(vars.edgeL, edgeL.light),
  set(vars.layerBase, fn.oklch(inputs.layerColor, idle)),
  set(vars.layerIdleMixed, vars.layerBase),
  set(vars.layerIdle, layerIdle),
  set(vars.stateBase, stateBase),
  set(vars.layerMixed, vars.stateBase),
  set(vars.layer, layer),
  set.color(vars.text),
  set.borderColor(vars.edge),
  set.backgroundColor(vars.layer),
  at.variant(dark, set(vars.edgeL, edgeL.dark)),
);

utility(
  "layer-*",
  set(inputs.layerC, fn.value(chroma)),
  set(inputs.layerH, fn.value(hue)),
  set(inputs.layerColor, fn.value(color, "[color]")),
  set(
    inputs.layerAutoL,
    fn.div(fn.value("number", "[number]", numbers()), 100),
  ),
);

utility(
  "state-*",
  set(inputs.stateAutoL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

const layerLighten = utility(
  "layer-lighten-*",
  set(inputs.layerRelativeL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

utility("layer-darken-*", ...negChildren(layerLighten));

const stateLighten = utility(
  "state-lighten-*",
  set(inputs.stateRelativeL, fn.div(fn.value("number", "[*]", numbers()), 100)),
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
  set(inputs.layerContrastL, fn.div(fn.value("number", "[*]", numbers()), 100)),
);

utility(
  "state-contrast-*",
  set(inputs.stateContrastL, fn.div(fn.value("number", "[*]", numbers()), 100)),
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
    inputs.layerRelativeC,
    fn.div(fn.value("number", "[*]", numbers({ max: 40 })), 100),
  ),
);
utility("layer-desaturate-*", ...negChildren(layerSaturate));

const stateSaturate = utility(
  "state-saturate-*",
  set(
    inputs.stateRelativeC,
    fn.div(fn.value("number", "[*]", numbers({ max: 40 })), 100),
  ),
);
utility("state-desaturate-*", ...negChildren(stateSaturate));

utility(
  "layer-h-rotate-*",
  set(
    inputs.layerRelativeH,
    fn.value("number", "[*]", numbers({ max: 360, step: 15 })),
  ),
);

utility(
  "state-h-rotate-*",
  set(
    inputs.stateRelativeH,
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

export const input = [
  theme,
  root,
  dark,
  light,
  ...utilities,
  ...Object.values(vars),
  ...Object.values(inputs),
];
