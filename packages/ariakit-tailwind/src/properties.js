import { writeFileSync } from "node:fs";
import { vars } from "./vars.js";

// =============================================================================
// Constants
// =============================================================================

const SCHEME_THRESHOLD_L = 56.27;
const SCHEME_THRESHOLD_OKL = 0.623;

// =============================================================================
// Text Contrast
// =============================================================================

const TEXT_CONTRAST_OKL = `calc((${SCHEME_THRESHOLD_OKL} - l) * infinity)`;
const TEXT_CONTRAST_L = `calc((${SCHEME_THRESHOLD_L} - l) * infinity)`;

// =============================================================================
// Light/Dark Detection
// =============================================================================

const IS_DARK_OKL = `clamp(0, ${TEXT_CONTRAST_OKL}, 1)`;
const IS_LIGHT_OKL = `clamp(0, 1 - ${TEXT_CONTRAST_OKL}, 1)`;
const IS_DARK_L = `clamp(0, ${TEXT_CONTRAST_L}, 1)`;
const IS_LIGHT_L = `clamp(0, 1 - ${TEXT_CONTRAST_L}, 1)`;

// =============================================================================
// Safe Lightness Calculations (with cos() for hue adjustment)
// =============================================================================

const LA_BASE = 0.561;
const LB_BASE = 0.72;
const T = `(c / 0.4)`;

// With cos() - for browsers that support it
const LA_HUE_RAD = `((h + 45) * pi / 180)`;
const LA_HUE_COMPONENT = `(0.055 * cos(${LA_HUE_RAD}))`;
const LB_HUE_RAD = `(h * pi / 180)`;
const LB_HUE_COMPONENT = `(0.035 * cos(${LB_HUE_RAD}))`;

const LA = `(${LA_BASE} + ${T} * (-0.005 + ${LA_HUE_COMPONENT}))`;
const LB = `(${LB_BASE} + ${T} * (0.03 + ${LB_HUE_COMPONENT}))`;

// Without cos() - fallback for browsers that don't support it
const LA_NO_COS = `(${LA_BASE} + ${T} * -0.005)`;
const LB_NO_COS = `(${LB_BASE} + ${T} * 0.03)`;

/**
 * Generates safe lightness calculations based on LA/LB values.
 * @param {string} la - The LA formula
 * @param {string} lb - The LB formula
 */
function getSafeLightness(la, lb) {
  const lDirection = `clamp(0, (l - (${la} + ${lb}) / 2) * infinity, 1)`;
  const lForbiddenRange = `clamp(0, (l - ${la}) * (${lb} - l) * infinity, 1)`;

  const safeL = `calc(l * (1 - ${lForbiddenRange}) + (${la} * (1 - ${lDirection}) + ${lb} * ${lDirection}) * ${lForbiddenRange})`;
  const safeLUp = `calc(l * (1 - ${lForbiddenRange}) + ${lb} * ${lForbiddenRange})`;
  const safeLDown = `calc(l * (1 - ${lForbiddenRange}) + ${la} * ${lForbiddenRange})`;

  return { safeL, safeLUp, safeLDown };
}

/**
 * Generates pop OkL calculations based on LA/LB values.
 * @param {string} la - The LA formula
 * @param {string} lb - The LB formula
 */
function getPopOkL(la, lb) {
  const popOkLMultiplier = `(0.06 + c * 0.3)`;
  return `calc(${popOkLMultiplier} * (
  (1 - 2 * clamp(0, (l - (${la} - ${popOkLMultiplier})) * 1e6, 1)) * clamp(0, (${la} - l) * 1e6 + 1, 1) +
  (1 - 2 * clamp(0, (l - (${lb} + ${popOkLMultiplier})) * 1e6, 1)) * clamp(0, (l - ${lb}) * 1e6 + 1, 1)
))`;
}

// With cos()
const {
  safeL: SAFE_L,
  safeLUp: SAFE_L_UP,
  safeLDown: SAFE_L_DOWN,
} = getSafeLightness(LA, LB);
const POP_OKL = getPopOkL(LA, LB);

// Without cos()
const {
  safeL: SAFE_L_NO_COS,
  safeLUp: SAFE_L_UP_NO_COS,
  safeLDown: SAFE_L_DOWN_NO_COS,
} = getSafeLightness(LA_NO_COS, LB_NO_COS);
const POP_OKL_NO_COS = getPopOkL(LA_NO_COS, LB_NO_COS);

// =============================================================================
// CSS Generation
// =============================================================================

const SUPPORTS_COS = "color: oklch(from black l c cos(h))";

const css = `
@property ${vars.layer} {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(1 0 0);
}

@property ${vars.layerParent} {
  syntax: "*";
  inherits: true;
}

@property ${vars.text} {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(0 0 0);
}

@property ${vars.shadow} {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(0 0 0 / 15%);
}

@property ${vars.ring} {
  syntax: "*";
  inherits: false;
}

@property ${vars.border} {
  syntax: "*";
  inherits: false;
}

@property ${vars.layerRing} {
  syntax: "*";
  inherits: true;
}

@property ${vars.layerBorder} {
  syntax: "*";
  inherits: true;
}

@property ${vars.bordering} {
  syntax: "*";
  inherits: false;
}

@property ${vars.frameRadius} {
  syntax: "<length>";
  inherits: true;
  initial-value: 0px;
}

@property ${vars.frameBorder} {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property ${vars.framePadding} {
  syntax: "<length>";
  inherits: true;
  initial-value: 0px;
}

@property ${vars.frameMargin} {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property ${vars._layerDown} {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

@property ${vars._layerBase} {
  syntax: "*";
  inherits: false;
}

@property ${vars._layerIdleBase} {
  syntax: "<color>";
  inherits: false;
  initial-value: oklch(1 0 0);
}

@property ${vars._layerIdle} {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(1 0 0);
}

@property ${vars._layerAppearance} {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(0 0 0);
}

@property ${vars._layerL} {
  syntax: "<color>";
  inherits: true;
  initial-value: lch(100 0 0);
}

@property ${vars._layerOkL} {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(1 0 0);
}

@property ${vars._frameCappedPadding} {
  syntax: "<length>";
  inherits: true;
  initial-value: 0px;
}

@property ${vars._frameBorder} {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property ${vars._textContrastOkL} {
  syntax: "*";
  inherits: false;
  initial-value: ${TEXT_CONTRAST_OKL};
}

@property ${vars._textContrastL} {
  syntax: "*";
  inherits: false;
  initial-value: ${TEXT_CONTRAST_L};
}

@property ${vars._darkOkL} {
  syntax: "*";
  inherits: false;
  initial-value: ${IS_DARK_OKL};
}

@property ${vars._lightOkL} {
  syntax: "*";
  inherits: false;
  initial-value: ${IS_LIGHT_OKL};
}

@property ${vars._darkL} {
  syntax: "*";
  inherits: false;
  initial-value: ${IS_DARK_L};
}

@property ${vars._lightL} {
  syntax: "*";
  inherits: false;
  initial-value: ${IS_LIGHT_L};
}

@property ${vars._textLevel} {
  syntax: "*";
  inherits: false;
}

@supports (${SUPPORTS_COS}) {
  @property ${vars._safeOkL} {
    syntax: "*";
    inherits: false;
    initial-value: ${SAFE_L};
  }

  @property ${vars._safeOkLUp} {
    syntax: "*";
    inherits: false;
    initial-value: ${SAFE_L_UP};
  }

  @property ${vars._safeOkLDown} {
    syntax: "*";
    inherits: false;
    initial-value: ${SAFE_L_DOWN};
  }

  @property ${vars._popOkL} {
    syntax: "*";
    inherits: false;
    initial-value: ${POP_OKL};
  }
}

@supports not (${SUPPORTS_COS}) {
  @property ${vars._safeOkL} {
    syntax: "*";
    inherits: false;
    initial-value: ${SAFE_L_NO_COS};
  }

  @property ${vars._safeOkLUp} {
    syntax: "*";
    inherits: false;
    initial-value: ${SAFE_L_UP_NO_COS};
  }

  @property ${vars._safeOkLDown} {
    syntax: "*";
    inherits: false;
    initial-value: ${SAFE_L_DOWN_NO_COS};
  }

  @property ${vars._popOkL} {
    syntax: "*";
    inherits: false;
    initial-value: ${POP_OKL_NO_COS};
  }
}
`;

writeFileSync(new URL("./properties.css", import.meta.url), `${css.trim()}\n`);

console.log("Generated properties.css");
