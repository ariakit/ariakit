export const LIGHTNESS_LEVELS = 8;
export const SCHEME_THRESHOLD_L = 56.27;
export const SCHEME_THRESHOLD_OKL = 0.623;
// Upper bound for non-bare level expansions in utility value generation.
// Keeps the generated class value space bounded and predictable.
export const MAX_NON_BARE_LEVELS = 10;

// Text contrast within the OkLCH and LCH color spaces
export const TEXT_CONTRAST_OKL = `calc((${SCHEME_THRESHOLD_OKL} - l) * infinity)`;
export const TEXT_CONTRAST_L = `calc((${SCHEME_THRESHOLD_L} - l) * infinity)`;

// Adjusts the lightness of a color based on its hue and chroma in the OkLCH
// color space.
const LA_BASE = 0.561;
const LB_BASE = 0.72;
const T = `(c / 0.4)`;
const LA_HUE_RAD = `((h + 45) * pi / 180)`;
const LA_HUE_COMPONENT = `(0.055 * cos(${LA_HUE_RAD}))`;
const LB_HUE_RAD = `(h * pi / 180)`;
const LB_HUE_COMPONENT = `(0.035 * cos(${LB_HUE_RAD}))`;
const LA = `(${LA_BASE} + ${T} * (-0.005 + ${LA_HUE_COMPONENT}))`;
const LB = `(${LB_BASE} + ${T} * (0.03 + ${LB_HUE_COMPONENT}))`;
const L_DIRECTION = `clamp(0, (l - (${LA} + ${LB}) / 2) * infinity, 1)`;
const L_FORBIDDEN_RANGE = `clamp(0, (l - ${LA}) * (${LB} - l) * infinity, 1)`;
const SAFE_L = `calc(l * (1 - ${L_FORBIDDEN_RANGE}) + (${LA} * (1 - ${L_DIRECTION}) + ${LB} * ${L_DIRECTION}) * ${L_FORBIDDEN_RANGE})`;
const SAFE_L_UP = `calc(l * (1 - ${L_FORBIDDEN_RANGE}) + ${LB} * ${L_FORBIDDEN_RANGE})`;
const SAFE_L_DOWN = `calc(l * (1 - ${L_FORBIDDEN_RANGE}) + ${LA} * ${L_FORBIDDEN_RANGE})`;

// OkL value for ak-layer-pop and ak-layer-hover utilities
const POP_OKL_MULTIPLIER = `(0.06 + c * 0.3)`;
const POP_OKL = `calc(${POP_OKL_MULTIPLIER} * (
  (1 - 2 * clamp(0, (l - (${LA} - ${POP_OKL_MULTIPLIER})) * 1e6, 1)) * clamp(0, (${LA} - l) * 1e6 + 1, 1) +
  (1 - 2 * clamp(0, (l - (${LB} + ${POP_OKL_MULTIPLIER})) * 1e6, 1)) * clamp(0, (l - ${LB}) * 1e6 + 1, 1)
))`;

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
  layerRing: "--ak-layer-ring",
  layerBorder: "--ak-layer-border",
  bordering: "--ak-bordering",
  frameRadius: "--ak-frame-radius",
  frameBorder: "--ak-frame-border",
  framePadding: "--ak-frame-padding",
  frameMargin: "--ak-frame-margin",

  // Private API
  _layerDown: "--_ak-layer-down",
  _layerBase: "--_ak-layer-base",
  _layerL: "--_ak-layer-l",
  _layerOkL: "--_ak-layer-okl",
  _layerAppearance: "--_ak-layer-appearance",
  _layerParent: "--_ak-layer-parent",
  _layerIdle: "--_ak-layer-idle",
  _frameRadius: "--_ak-frame-radius",
  _frameBorder: "--_ak-frame-border",
  _framePadding: "--_ak-frame-padding",
  _frameCappedPadding: "--_ak-frame-capped-padding",
  _textLevel: "--_ak-text-level",

  _safeOkL: "--_ak-safe-okl",
  _safeOkLUp: "--_ak-safe-okl-up",
  _safeOkLDown: "--_ak-safe-okl-down",
  _popOkL: "--_ak-pop-okl",
  _textContrastOkL: "--_ak-text-contrast-okl",
  _textContrastL: "--_ak-text-contrast-l",
  _darkOkL: "--_ak-dark-okl",
  _lightOkL: "--_ak-light-okl",
  _darkL: "--_ak-dark-l",
  _lightL: "--_ak-light-l",
});

export const IN_DARK = `@container style(${vars._layerAppearance}: oklch(1 0 0))`;
export const IN_LIGHT = `@container style(${vars._layerAppearance}: oklch(0 0 0))`;

export const properties = css({
  [`@property ${vars.layer}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(1 0 0)",
  },
  [`@property ${vars.layerParent}`]: {
    syntax: "'*'",
    inherits: "true",
  },
  [`@property ${vars.text}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0)",
  },
  [`@property ${vars.shadow}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(0 0 0 / 15%)",
  },
  [`@property ${vars.ring}`]: {
    syntax: "'*'",
    inherits: "false",
  },
  [`@property ${vars.border}`]: {
    syntax: "'*'",
    inherits: "false",
  },
  [`@property ${vars.layerRing}`]: {
    syntax: "'*'",
    inherits: "true",
  },
  [`@property ${vars.layerBorder}`]: {
    syntax: "'*'",
    inherits: "true",
  },
  [`@property ${vars.bordering}`]: {
    syntax: "'*'",
    inherits: "false",
  },
  [`@property ${vars.frameRadius}`]: {
    syntax: "'<length>'",
    inherits: "true",
    initialValue: "0px",
  },
  [`@property ${vars.frameBorder}`]: {
    syntax: "'<length>'",
    inherits: "false",
    initialValue: "0px",
  },
  [`@property ${vars.framePadding}`]: {
    syntax: "'<length>'",
    inherits: "true",
    initialValue: "0px",
  },
  [`@property ${vars.frameMargin}`]: {
    syntax: "'<length>'",
    inherits: "false",
    initialValue: "0px",
  },
  [`@property ${vars._layerDown}`]: {
    syntax: "0 | 1",
    inherits: "true",
    initialValue: "0",
  },
  [`@property ${vars._layerBase}`]: {
    syntax: "'*'",
    inherits: "false",
  },
  [`@property ${vars._layerIdle}`]: {
    syntax: "'<color>'",
    inherits: "true",
    initialValue: "oklch(1 0 0)",
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
  // OkL value for ak-layer-pop and ak-layer-hover utilities
  [`@property ${vars._popOkL}`]: {
    syntax: "'*'",
    inherits: "false",
    initialValue: POP_OKL,
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
  [`@property ${vars._textLevel}`]: {
    syntax: "'*'",
    inherits: "false",
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
 * @param {CssInJs[]} objects
 * @returns {CssInJs}
 */
export function css(...objects) {
  return Object.assign({}, ...objects);
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
    const query = `@container style(${vars._layerL}: lch(${l} 0 0))`;
    const result = fn(l);
    if (!result) return acc;
    acc[query] = result;
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
    acc[query] = result;
    return acc;
  }, css());
}
