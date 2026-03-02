import type { Namespace } from "./utils2.ts";
import { fn } from "./utils2.ts";

// =============================================================================
// Constants
// =============================================================================

export const SCHEME_THRESHOLD_L = 58.82;
export const SCHEME_THRESHOLD_OKL = 0.645;

// =============================================================================
// Text Contrast
// =============================================================================

const TEXT_CONTRAST_OKL = fn.mul(fn.sub(SCHEME_THRESHOLD_OKL, "l"), "infinity");
const TEXT_CONTRAST_L = fn.mul(fn.sub(SCHEME_THRESHOLD_L, "l"), "infinity");

// =============================================================================
// Light/Dark Detection
// =============================================================================

const IS_DARK_OKL = fn.clamp01(TEXT_CONTRAST_OKL);
const IS_LIGHT_OKL = fn.clamp01(fn.sub(1, TEXT_CONTRAST_OKL));
const IS_DARK_L = fn.clamp01(TEXT_CONTRAST_L);
const IS_LIGHT_L = fn.clamp01(fn.sub(1, TEXT_CONTRAST_L));

// =============================================================================
// Safe Lightness Calculations (with cos() for hue adjustment)
// =============================================================================

const CHROMA_MAX = 0.37;
const LA_BASE = 0.55;
const LB_BASE = 0.72;
const T = fn.div(fn.clamp(0, "c", CHROMA_MAX), CHROMA_MAX);
// TODO: This must be exponential.
const LA = `(${LA_BASE} + ${T} * -0.08)`;
const LB = `(${LB_BASE} + ${T} * 0.05)`;

/**
 * Generates safe lightness calculations based on LA/LB values.
 * @param la - The LA formula
 * @param lb - The LB formula
 */
function getSafeLightness(la: string, lb: string) {
  const lDirection = fn.clamp01(`(l - (${la} + ${lb}) / 2) * infinity`);
  const lForbiddenRange = fn.clamp01(`(l - ${la}) * (${lb} - l) * infinity`);

  const safeL = fn.calc`l * (1 - ${lForbiddenRange}) + (${la} * (1 - ${lDirection}) + ${lb} * ${lDirection}) * ${lForbiddenRange}`;
  const safeLUp = fn.calc`l * (1 - ${lForbiddenRange}) + ${lb} * ${lForbiddenRange}`;
  const safeLDown = fn.calc`l * (1 - ${lForbiddenRange}) + ${la} * ${lForbiddenRange}`;

  return { safeL, safeLUp, safeLDown };
}

/**
 * Generates toggle OkL calculations based on LA/LB values.
 * @param la - The LA formula
 * @param lb - The LB formula
 */
function getToggleOkL(la: string, lb: string) {
  // TODO: Can't do this here because we need to consider the passed value of
  // ak-layer/state-<value> as the scale so the math knows if the value will
  // break into the forbidden range.
  // We also have to increase the forbidden range based on contrast.
  // So we should probably break this into separate variables and bring in the
  // values and contrast var into the math. Same thing for safeOkL.
  const scale = "0.1";
  return `calc(${scale} * (
    (1 - 2 * ${fn.clamp01(`(l - (${la} - ${scale})) * 1e6`)}) * ${fn.clamp01(`(${la} - l) * 1e6 + 1`)} +
    (1 - 2 * ${fn.clamp01(`(l - (${lb} + ${scale})) * 1e6`)}) * ${fn.clamp01(`(l - ${lb}) * 1e6 + 1`)}
  ))`;
}

// Without cos()
const {
  safeL: SAFE_L_NO_COS,
  safeLUp: SAFE_L_UP_NO_COS,
  safeLDown: SAFE_L_DOWN_NO_COS,
} = getSafeLightness(LA, LB);
const TOGGLE_OKL_NO_COS = getToggleOkL(LA, LB);

export function getOkLVars(ns: Namespace) {
  const oklVars = {
    textContrastOkL: ns.prop("text-contrast-okl", {
      initialValue: TEXT_CONTRAST_OKL,
    }),
    textContrastL: ns.prop("text-contrast-l", {
      initialValue: TEXT_CONTRAST_L,
    }),
    darkOkL: ns.prop("dark-okl", { initialValue: IS_DARK_OKL }),
    lightOkL: ns.prop("light-okl", { initialValue: IS_LIGHT_OKL }),
    darkL: ns.prop("dark-l", { initialValue: IS_DARK_L }),
    lightL: ns.prop("light-l", { initialValue: IS_LIGHT_L }),
    safeOkL: ns.prop("safe-okl", { initialValue: SAFE_L_NO_COS }),
    safeOkLUp: ns.prop("safe-okl-up", { initialValue: SAFE_L_UP_NO_COS }),
    safeOkLDown: ns.prop("safe-okl-down", { initialValue: SAFE_L_DOWN_NO_COS }),
    toggleOkL: ns.prop("toggle-okl", { initialValue: TOGGLE_OKL_NO_COS }),
  };

  return oklVars;
}
