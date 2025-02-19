export const LIGHTNESS_LEVELS = 20;
export const SCHEME_THRESHOLD_L = 56.27;
export const SCHEME_THRESHOLD_OKL = 0.623;

// Text contrast within the OkLCH and LCH color spaces
export const TEXT_CONTRAST_OKL = `calc((${SCHEME_THRESHOLD_OKL} - l) * infinity)`;
export const TEXT_CONTRAST_L = `calc((${SCHEME_THRESHOLD_L} - l) * infinity)`;

// Adjusts the lightness of a color based on its hue and chroma in the OkLCH
// color space.
const LA_BASE = 0.56;
const LB_BASE = 0.72;
const T = `(c / 0.4)`;
const LA_HUE_RAD = `((h + 45) * pi / 180)`;
const LA_HUE_COMPONENT = `(0.055 * cos(${LA_HUE_RAD}))`;
const LB_HUE_RAD = `(h * pi / 180)`;
const LB_HUE_COMPONENT = `(0.035 * cos(${LB_HUE_RAD}))`;
const LA = `(${LA_BASE} + ${T} * (-0.005 + ${LA_HUE_COMPONENT}))`;
const LB = `(${LB_BASE} + ${T} * (0.03 + ${LB_HUE_COMPONENT}))`;
const L_DIRECTION = `clamp(0, (l - (${LA} + ${LB}) / 2) * infinity, 1)`;
const L_FORBIDDEN_RANGE = `clamp(0, (l - ${0.56}) * (${LB} - l) * infinity, 1)`;
const SAFE_L = `calc(l * (1 - ${L_FORBIDDEN_RANGE}) + (${LA} * (1 - ${L_DIRECTION}) + ${LB} * ${L_DIRECTION}) * ${L_FORBIDDEN_RANGE})`;
const SAFE_L_UP = `calc(l * (1 - ${L_FORBIDDEN_RANGE}) + ${LB} * ${L_FORBIDDEN_RANGE})`;
const SAFE_L_DOWN = `calc(l * (1 - ${L_FORBIDDEN_RANGE}) + ${LA} * ${L_FORBIDDEN_RANGE})`;

// Light/dark detection (0-1) within the OkLCH and LCH color spaces
const IS_DARK_OKL = `clamp(0, ${TEXT_CONTRAST_OKL}, 1)`;
const IS_LIGHT_OKL = `clamp(0, 1 - ${TEXT_CONTRAST_OKL}, 1)`;
const IS_DARK_L = `clamp(0, ${TEXT_CONTRAST_L}, 1)`;
const IS_LIGHT_L = `clamp(0, 1 - ${TEXT_CONTRAST_L}, 1)`;

export const vars = /** @type {const} */ ({
  // Public API
  layer: "--ak-layer",
  layerParent: "--ak-layer-parent",
  text: "--ak-text",
  ring: "--ak-ring",
  border: "--ak-border",
  shadow: "--ak-shadow",

  // Private API
  _layerBase: "--_ak-layer-base",
  _layerL: "--_ak-layer-l",
  _layerOkL: "--_ak-layer-okl",
  _layerAppearance: "--_ak-layer-appearance",
  _layerParent: "--_ak-layer-parent",
  _layerIdle: "--_ak-layer-idle",
  _frameBorder: "--_ak-frame-border",
  _frameRadius: "--_ak-frame-radius",
  _framePadding: "--_ak-frame-padding",
  _frameCappedPadding: "--_ak-frame-capped-padding",
  _textLevel: "--_ak-text-level",

  _safeOkL: "--_ak-safe-okl",
  _safeOkLUp: "--_ak-safe-okl-up",
  _safeOkLDown: "--_ak-safe-okl-down",
  _safeOkLA: "--_ak-safe-okla",
  _safeOkLB: "--_ak-safe-oklb",
  _textContrastOkL: "--_ak-text-contrast-okl",
  _textContrastL: "--_ak-text-contrast-l",
  _darkOkL: "--_ak-dark-okl",
  _lightOkL: "--_ak-light-okl",
  _darkL: "--_ak-dark-l",
  _lightL: "--_ak-light-l",
});

export const properties = css({
  [`@property ${vars.layer}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(1 0 0)",
  },
  [`@property ${vars.layerParent}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(1 0 0)",
  },
  [`@property ${vars.text}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0)",
  },
  [`@property ${vars.ring}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0)",
  },
  [`@property ${vars.border}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0)",
  },
  [`@property ${vars.shadow}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0 / 15%)",
  },
  [`@property ${vars._layerBase}`]: {
    syntax: "'*'",
    inherits: "false",
  },
  [`@property ${vars._layerIdle}`]: {
    syntax: "'<color>'",
    inherits: "false",
    initialValue: "oklch(100 0 0)",
  },
  // Whether the layer is dark (oklch(1 0 0)) or light (oklch(0 0 0))
  [`@property ${vars._layerAppearance}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0)",
  },
  // The rounded lightness value of the layer (0-100)
  [`@property ${vars._layerL}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "lch(100 0 0)",
  },
  // The rounded ok lightness value of the layer (0-1)
  [`@property ${vars._layerOkL}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(1 0 0)",
  },
  // TODO: Comment
  [`@property ${vars._frameCappedPadding}`]: {
    syntax: "'<length>'",
    inherits: "true",
    initialValue: "0px",
  },
  // TODO: Comment
  [`@property ${vars._frameBorder}`]: {
    syntax: "'<length>'",
    inherits: "false",
    initialValue: "0px",
  },
  // TODO: Comment
  [`@property ${vars._safeOkL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: SAFE_L,
  },
  // TODO: Comment
  [`@property ${vars._safeOkLUp}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: SAFE_L_UP,
  },
  [`@property ${vars._safeOkLDown}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: SAFE_L_DOWN,
  },
  // TODO: Comment
  [`@property ${vars._safeOkLA}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: LA,
  },
  // TODO: Comment
  [`@property ${vars._safeOkLB}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: LB,
  },
  [`@property ${vars._textContrastOkL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: TEXT_CONTRAST_OKL,
  },
  [`@property ${vars._textContrastL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: TEXT_CONTRAST_L,
  },
  [`@property ${vars._darkOkL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: IS_DARK_OKL,
  },
  [`@property ${vars._lightOkL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: IS_LIGHT_OKL,
  },
  [`@property ${vars._darkL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: IS_DARK_L,
  },
  [`@property ${vars._lightL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: IS_LIGHT_L,
  },
});

/**
 * @param {(typeof vars)[keyof typeof vars]} name
 * @param {string} [defaultValue]
 */
export function prop(name, defaultValue) {
  return `var(${name}${defaultValue ? `, ${defaultValue}` : ""})`;
}

/**
 * @param {number} [value]
 */
export function isInlineThemeReference(value) {
  if (!value) return false;
  if (value & (1 << 0)) return true;
  if (value & (1 << 1)) return true;
  return false;
}

/**
 * Return the absolute value in CSS.
 * @param {string} value
 */
export function abs(value) {
  return `max(${value}, ${value} * -1)`;
}

/**
 * Return the sign value in CSS.
 * @param {string} value
 */
export function sign(value) {
  return `clamp(-1, ${value} * infinity, 1)`;
}

/**
 * @param {string | number} [light]
 * @param {string | number} [dark]
 */
export function oklchLightDark(light, dark) {
  return `((${light} * ${prop(vars._lightOkL)}) + (${dark} * ${prop(vars._darkOkL)}))`;
}

/**
 * @param {string | number} [light]
 * @param {string | number} [dark]
 */
export function lchLightDark(light, dark) {
  return `((${light} * ${prop(vars._lightL)}) + (${dark} * ${prop(vars._darkL)}))`;
}

/**
 * @param {string} colorA
 * @param {string} colorB
 */
export function colorMix(colorA, colorB) {
  return `color-mix(in oklab, ${colorA}, ${colorB})`;
}

/**
 * @param {string} color
 */
export function textColor(color) {
  return `oklch(from ${color} ${prop(vars._textContrastOkL)} 0 0 / 100%)`;
}

/**
 * Parses a string value into a percentage.
 * @param {string | null | undefined} value
 * @param {string} [defaultValue]
 */
export function toPercent(value, defaultValue = "100%") {
  if (!value) return defaultValue;
  return /^\d+$/.test(value) ? `${value}%` : value;
}

/**
 * Just to please TypeScript.
 * @typedef {{[key: string]: string | string[] | CssInJs | CssInJs[]}} CssInJs
 * @param {CssInJs} [object]
 */
export function css(object = {}) {
  return object;
}

/**
 * @typedef {{ value: string, kind: string, fraction: string | null }}
 * BareValueFnParams
 * @param {(params: BareValueFnParams) => string | undefined} fn
 * @returns {Record<string, string>}
 */
export function bareValue(fn) {
  return {
    // @ts-expect-error
    __BARE_VALUE__: fn,
  };
}

/**
 * Returns the layer's computed okLCH values based on the provided level.
 * @param {string} level
 * @param {string} [contrast]
 */
export function getLayerOkLCH(level, contrast = "0") {
  const minL = `min(0.13, ${level})`;
  const lMultiplier = 0.05;
  const cMultiplier = 0.002;

  let l = `max(0, max(l, ${minL}) + ${level} * ${lMultiplier})`;
  const c = `max(0, c - ${level} * ${cMultiplier})`;
  const h = "h";

  if (`${contrast}` !== "0") {
    const isDown = level.startsWith("-");
    const layerContrast = `min(1, calc(-1 * ${contrast}))`;
    const negativeContrast = `min(0, ${layerContrast})`;
    l = `calc(${l} + ${lMultiplier} * ${negativeContrast} * ${oklchLightDark(isDown ? "-1" : "-5", isDown ? "-0.5" : "1")})`;
  }
  return { l, c, h };
}

/**
 * Returns CSS that enables a child to apply CSS based on the parent's layer
 * lightness level (0-100).
 * @param {(l: number) => CssInJs | null | undefined} fn
 */
export function withParentL(fn) {
  const levels = Array.from(
    { length: LIGHTNESS_LEVELS + 1 },
    (_, i) => (i / LIGHTNESS_LEVELS) * 100,
  );
  return levels.reduce((acc, l) => {
    l = Math.round(l);
    const query = `@container style(${vars._layerL}: lch(${l} 0 0))`;
    const result = fn(l);
    if (!result) return acc;
    Object.assign(acc, { [query]: result });
    return acc;
  }, css());
}
/**
 * Returns CSS that enables a child to apply CSS based on the parent's layer ok
 * lightness level (0-1).
 * @param {(l: number) => CssInJs | null | undefined} fn
 */
export function withParentOkL(fn) {
  const levels = Array.from(
    { length: LIGHTNESS_LEVELS + 1 },
    (_, i) => i / LIGHTNESS_LEVELS,
  );
  return levels.reduce((acc, l) => {
    const query = `@container style(${vars._layerOkL}: oklch(${l} 0 0))`;
    const result = fn(l);
    if (!result) return acc;
    Object.assign(acc, { [query]: result });
    return acc;
  }, css());
}

/**
 * Returns CSS that enables a child to inherit CSS variables from its parent.
 * @typedef {"even" | "odd"} Parity
 * @typedef {(prop: (typeof vars)[keyof typeof vars]) => string} Provide
 * @typedef {(prop: (typeof vars)[keyof typeof vars], defaultValue?: string) =>
 * string} Inherit
 * @typedef {{ opposite: Provide, provide: Provide, inherit: Inherit }}
 * WithParentFnParams
 * @typedef {(params: WithParentFnParams) => CssInJs} WithParentFn
 * @param {string} id
 * @param {boolean} reset
 * @param {WithParentFn} fn
 */
export function withContext(id, reset, fn) {
  const getParityKey = () => `--_ak-${id}-parity`;

  /** @param {Parity} parity */
  const getNextParity = (parity) =>
    // TODO: Check if this !reset is necessary (it is, hover:ak-layer-10)
    parity === "even" && !reset ? "odd" : "even";

  /**
   * @param {Parity} [parity]
   * @returns {CssInJs}
   */
  const getCss = (parity = "even") => ({
    [getParityKey()]: getNextParity(parity),
    ...fn({
      opposite: (prop) => `${prop}-${parity === "even" ? "odd" : "even"}`,
      provide: (prop) => `${prop}-${getNextParity(parity)}`,
      inherit: (prop, defaultValue) =>
        `var(${prop}-${parity}${defaultValue ? `, ${defaultValue}` : ""})`,
    }),
  });

  if (reset) {
    return getCss();
  }

  const result = css();

  for (const parity of /** @type {Parity[]} */ (["even", "odd"])) {
    result[`@container style(${getParityKey()}: ${parity})`] = getCss(parity);
  }

  result[`@container not style(${getParityKey()})`] = getCss();

  return result;
}
