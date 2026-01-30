export { vars } from "./vars.js";

export const LIGHTNESS_LEVELS = 8;
export const SCHEME_THRESHOLD_L = 56.27;
export const SCHEME_THRESHOLD_OKL = 0.623;
// Upper bound for non-bare level expansions in utility value generation.
// Keeps the generated class value space bounded and predictable.
export const MAX_NON_BARE_LEVELS = 10;

// Text contrast within the OkLCH and LCH color spaces
export const TEXT_CONTRAST_OKL = `calc((${SCHEME_THRESHOLD_OKL} - l) * infinity)`;
export const TEXT_CONTRAST_L = `calc((${SCHEME_THRESHOLD_L} - l) * infinity)`;

// Re-import vars for internal use
import { vars } from "./vars.js";

export const IN_DARK = `@container style(${vars._layerAppearance}: oklch(1 0 0))`;
export const IN_LIGHT = `@container style(${vars._layerAppearance}: oklch(0 0 0))`;

/**
 * @param {(typeof vars)[keyof typeof vars]} name
 * @param {string} [defaultValue]
 */
export function prop(name, defaultValue) {
  return `var(${name}${defaultValue ? `, ${defaultValue}` : ""})`;
}

/**
 * @param {1 | 2 | 3} [defaultLevel]
 */
export function layerIdleProp(defaultLevel = 3) {
  if (defaultLevel === 3) {
    return prop(
      vars.layerModifier,
      prop(vars.layerState, prop(vars.layerIdle)),
    );
  } else if (defaultLevel === 2) {
    return prop(vars.layerState, prop(vars.layerIdle));
  } else {
    return prop(vars.layerIdle);
  }
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
