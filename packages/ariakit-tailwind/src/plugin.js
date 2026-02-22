import colorString from "color-string";
import plugin from "tailwindcss/plugin";
import {
  bareValue,
  colorMix,
  css,
  down,
  downUp,
  IN_DARK,
  IN_LIGHT,
  isInlineThemeReference,
  LIGHTNESS_LEVELS,
  layerIdleProp,
  lchLightDark,
  MAX_NON_BARE_LEVELS,
  negative,
  oklchLightDark,
  prop,
  SCHEME_THRESHOLD_L,
  SCHEME_THRESHOLD_OKL,
  TEXT_CONTRAST_L,
  textColor,
  toPercent,
  up,
  withParentL,
  withParentOkL,
} from "./utils.js";
import { vars } from "./vars.js";

/** @type {ReturnType<typeof plugin>} */
const AriakitTailwind = plugin(
  ({ addBase, addVariant, addUtilities, matchUtilities, theme }) => {
    addVariant("ak-dark", IN_DARK);
    addVariant("ak-light", IN_LIGHT);

    // =========================================================================
    // LAYER VALUES AND PARSING
    // =========================================================================

    /**
     * Returns the accepted values for the layer utilities.
     * @param {object} params
     * @param {string[]} [params.additionalKeys]
     * @param {boolean} [params.colors]
     * @param {boolean} [params.downLevels]
     * @param {boolean} [params.levels]
     * @param {string | null} [params.DEFAULT]
     */
    function getLayerValues({
      additionalKeys = [],
      colors = true,
      levels = true,
      downLevels = levels,
      DEFAULT = levels ? "1" : undefined,
    } = {}) {
      /** @type {Record<string, string>} */
      const values = {};

      if (DEFAULT) {
        values.DEFAULT = DEFAULT;
      }

      // Precompute numeric level values
      if (levels) {
        if (downLevels) {
          values.down = "down";
        }
        for (let i = 0; i <= MAX_NON_BARE_LEVELS; i++) {
          values[i] = `${i}`;
          if (downLevels) {
            values[`down-${i}`] = `down-${i}`;
          }
        }
      }

      // Expand color tokens with levels
      if (colors) {
        const { __CSS_VALUES__, ...themeColors } = theme("colors");
        const themeKeys = Object.keys(themeColors);
        const keys = [...themeKeys, ...additionalKeys];

        for (const key of keys) {
          if (!levels) values[key] = key;
          if (/-\d+$/.test(key)) continue;
          for (let i = 1; i <= MAX_NON_BARE_LEVELS; i++) {
            values[`${key}-${i}`] = `${key}-${i}`;
            if (downLevels) {
              values[`${key}-down`] = `${key}-down`;
              values[`${key}-down-${i}`] = `${key}-down-${i}`;
            }
          }
        }
      }

      // Allow bare values via parseColorLevel guardrails
      Object.assign(
        values,
        bareValue(({ value }) => {
          const { token, level } = parseColorLevel(value);
          if (token && !colors) return;
          if (!token && level === "0") return;
          if (token && !theme("colors")[token]) return;
          if (level && level !== "0" && !levels) return;
          if (level.startsWith("-") && !downLevels) return;
          return value;
        }),
      );

      return values;
    }

    /**
     * Parses the color token and level from the provided value.
     * @param {string} [value]
     */
    function parseColorLevel(value) {
      if (!value) {
        return { token: undefined, level: prop(vars._layerLevel, "1") };
      }
      if (theme("colors")[value] || colorString.get(value)) {
        return { token: value, level: prop(vars._layerLevel, "0") };
      }
      const matches = value.match(/(down-?)?([.\d]+)?$/);
      if (!matches) {
        return { token: value, level: prop(vars._layerLevel, "0") };
      }
      const [, down, level] = matches;
      if (!level) {
        return {
          token: down ? value.slice(0, -down.length) : value,
          level: down
            ? negative(prop(vars._layerLevel, "1"))
            : prop(vars._layerLevel, "0"),
        };
      }
      return {
        token: value.slice(0, -((down?.length || 0) + level.length) - 1),
        level: down ? negative(level) : level,
      };
    }

    // =========================================================================
    // LAYER COLOR COMPUTATION
    // =========================================================================

    /**
     * Returns the layer's computed okLCH values based on the provided level.
     * @param {string} level
     * @param {string} [contrast]
     */
    function getLayerOkLCH(level, contrast = "0") {
      const minL = `min(0.13, ${level})`;
      const lMultiplier = 0.05;
      const cMultiplier = 0.002;

      let l = `max(0, max(l, ${minL}) + ${level} * ${lMultiplier})`;
      const c = `max(0, c - ${level} * ${cMultiplier})`;
      const h = "h";

      if (`${contrast}` !== "0") {
        const layerContrast = `min(1, calc(-1 * ${contrast}))`;
        const negativeContrast = `min(0, ${layerContrast})`;
        l = `calc(${l} + ${lMultiplier} * ${negativeContrast} * ${oklchLightDark(downUp(level, "-1", "-5"), downUp(level, "-0.5", "1"))})`;
      }
      return { l, c, h };
    }

    /**
     * Adjust color contrast relative to the parent scheme and layer direction.
     * Maintains perceived contrast when the parent scheme changes and when the
     * current layer is a down layer.
     * @param {object} params
     * @param {string} params.color
     * @param {string} params.level
     * @param {"light" | "dark"} [params.scheme]
     * @param {string} [params.contrast]
     */
    function getLayerContrastColor({
      color,
      scheme,
      level,
      contrast = getContrast(),
    }) {
      if (contrast === "0") return color;
      const lMultiplier = `(0.07 + c / 3)`;
      const light = downUp(level, "-0.3", "-1");
      const dark = downUp(level, "0", "1");
      const contrastMultiplier =
        scheme === "light"
          ? light
          : scheme === "dark"
            ? dark
            : oklchLightDark(light, dark);
      const layerContrast = `min(1, calc(-1 * ${contrast}))`;
      const negativeContrast = `min(0, ${layerContrast})`;
      return `oklch(from ${color} calc(l + ${lMultiplier} * ${negativeContrast} * ${contrastMultiplier}) c h)`;
    }

    /**
     * Returns the current layer's css.
     */
    function getCurrentLayerCss() {
      return css(getEdgeCss({ color: prop(vars.layer), soft: true }), {
        backgroundColor: prop(vars.layer),
        borderColor: prop(vars.border, prop(vars.layerBorder)),
        color: prop(vars.text),
        "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
        "--tw-shadow-color": prop(vars.shadow),
      });
    }

    // =========================================================================
    // EDGE STYLES
    // =========================================================================

    /**
     * Builds a layer color with level, safe lightness and contrast applied.
     * @param {object} params
     * @param {string} params.baseColor
     * @param {string} params.level
     * @returns {string}
     */
    function getLayerColor({ baseColor, level }) {
      const { l, c, h } = getLayerOkLCH(level);
      const colorWithLevel =
        level === "0"
          ? baseColor
          : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
      const color = `oklch(from ${colorWithLevel} ${prop(vars._safeOkL)} c h / 100%)`;
      return getLayerContrastColor({ color, level, contrast: getContrast() });
    }

    /**
     * @param {object} params
     * @param {string | null | undefined} [params.token]
     * @param {string} [params.level]
     * @param {boolean} [params.soft]
     */
    function getLayerCss({ token, level = "0", soft = false }) {
      const shadowAlpha = `calc(10% + (1 - l) * 2 * 25%)`;

      /** @param {string} color */
      const shadow = (color) => `oklch(from ${color} 0 0 0 / ${shadowAlpha})`;

      const layerParent = prop(vars.layerParent, "canvas");

      const result = css(getCurrentLayerCss(), {
        [vars.shadow]: shadow(layerParent),
        [vars.layer]: layerIdleProp(3),
        [vars.layerLevel]: level,
        [vars._layerAppearance]: textColor(prop(vars.layer)),
        [vars._layerL]: `lch(from ${prop(vars.layer)} round(l, ${100 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
        [vars._layerOkL]: `oklch(from ${prop(vars.layer)} round(l, ${1 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
      });

      const baseColor = token
        ? tv("color", token)
        : prop(vars._layerBase, prop(vars.layerParent));
      const computedColor = getLayerColor({ baseColor, level });

      if (token) {
        Object.assign(result, {
          [vars._layerBase]: computedColor,
        });
      }

      if (!soft) {
        Object.assign(result, {
          [vars.layerIdle]: computedColor,
          [vars.layerState]: layerIdleProp(1),
          [vars.layerModifier]: layerIdleProp(2),
          [vars.text]: textColor(prop(vars.layer)),
        });
      }

      Object.assign(
        result,
        getEdgeCss({
          color: colorMix(prop(vars.layer), layerParent),
          soft: true,
        }),
        withContext("layer-parent", false, ({ provide, inherit }) => {
          return {
            [provide(vars._layerParent)]: prop(vars.layer),
            [vars.layerParent]: inherit(vars._layerParent),
          };
        }),
      );

      return result;
    }

    matchUtilities(
      {
        "ak-layer": (value) => {
          const { token, level } = parseColorLevel(value);
          return getLayerCss({ token, level });
        },
      },
      { values: getLayerValues() },
    );

    matchUtilities(
      {
        "ak-layer-level": (value) => {
          return { [vars._layerLevel]: value };
        },
      },
      {
        values: getLayerValues({
          levels: true,
          colors: false,
          downLevels: false,
        }),
      },
    );

    matchUtilities(
      {
        "ak-layer-contrast": (value) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, layerIdleProp(1));
          const { l, c, h } = getLayerOkLCH(level);

          /**
           * Computes the contrast-adjusted color for a given parent lightness.
           * @param {number} parentL
           * @param {string} outputVar - The CSS variable to set the result on
           */
          const getContrastCss = (parentL, outputVar) => {
            const isDark = parentL < SCHEME_THRESHOLD_OKL;
            const t = isDark ? 1 : -1;
            const contrastL = `(${Math.max(parentL, 0.15)} + ${t * 0.25})`;
            const contrastLString = isDark
              ? `max(l, ${contrastL})`
              : `min(l, ${contrastL})`;
            const colorWithLevel =
              level === "0"
                ? baseColor
                : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
            const colorWithContrastL = `oklch(from ${colorWithLevel} ${contrastLString} c h / 100%)`;
            const colorWithContrast = getLayerContrastColor({
              color: colorWithContrastL,
              level,
              scheme: isDark ? "light" : "dark",
              contrast: `calc(${getContrast()} * 2)`,
            });
            const colorWithSafeL = `oklch(from ${colorWithContrast} ${prop(isDark ? vars._safeOkLUp : vars._safeOkLDown)} c h)`;
            return { [outputVar]: colorWithSafeL };
          };

          if (token) {
            // With token: create a new contrast layer (existing behavior)
            return Object.assign(
              getLayerCss({ token, level }),
              withParentOkL((parentL) =>
                css(
                  getContrastCss(parentL, vars._layerBase),
                  getContrastCss(parentL, vars.layerIdle),
                ),
              ),
            );
          }

          // Without token: apply contrast to current layer (soft mode)
          return Object.assign(
            getLayerCss({ soft: true }),
            withParentOkL((parentL) =>
              getContrastCss(parentL, vars.layerState),
            ),
          );
        },
      },
      { values: getLayerValues({ DEFAULT: "0" }) },
    );

    addUtilities({
      ".ak-layer-current": getCurrentLayerCss(),
    });

    matchUtilities(
      {
        "ak-layer-mix": (value, { modifier }) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, layerIdleProp(2));
          const { l, c, h } = getLayerOkLCH(level);
          const color = `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
          const percentage = toPercent(modifier, "50%");
          const mixColor = `color-mix(in oklab, ${prop(vars.layerParent)}, ${color} ${percentage})`;
          if (token) {
            return {
              ...getLayerCss({ token }),
              [vars.layerIdle]: mixColor,
              [vars._layerBase]: mixColor,
            };
          }
          return {
            ...getLayerCss({ token, level, soft: true }),
            [vars.layerModifier]: mixColor,
            [vars.layer]: mixColor,
          };
        },
      },
      { values: getLayerValues({ DEFAULT: "0" }), modifiers: "any" },
    );

    /**
     * @param {string} level
     */
    function getLayerPopOkL(level) {
      const l = `max(l, min(0.13, ${level}))`;
      return `calc(${l} + ${level} * ${prop(vars._popOkL)})`;
    }

    matchUtilities(
      {
        "ak-layer-hover": (value) => {
          const { token, level } = parseColorLevel(value);
          return {
            ...(token
              ? getLayerCss({ token })
              : getLayerCss({ token, level, soft: true })),
            [vars.layer]: `oklch(from ${layerIdleProp(3)} ${getLayerPopOkL(level)} c h)`,
          };
        },
        "ak-layer-hover-vivid": (value) => {
          const { token, level } = parseColorLevel(value);
          const c = `clamp(0, c + 0.1 * ${level}, 0.4)`;
          const colorBase = `oklch(from ${layerIdleProp(3)} l ${c} h)`;
          const colorWithSafeL = `oklch(from ${colorBase} ${prop(vars._safeOkL)} c h)`;
          return {
            ...(token
              ? getLayerCss({ token })
              : getLayerCss({ token, level, soft: true })),
            [vars.layer]: `oklch(from ${colorWithSafeL} ${getLayerPopOkL(level)} c h)`,
          };
        },
        "ak-layer-feature": (level) => {
          const result = getLayerCss({ token: null, level });
          Object.assign(
            result,
            withParentL((l) => {
              if (l !== 100 && l !== 0) return;
              return {
                borderWidth: `1px`,
              };
            }),
          );
          return result;
        },
      },
      { values: getLayerValues({ downLevels: false }) },
    );

    /**
     * @param {string | undefined} token
     * @param {string} level
     */
    const getLayerPop = (token, level) => {
      const color = tv("color", token, prop(vars.layerParent));
      const popColor = `oklch(from ${prop(vars._layerBase)} ${getLayerPopOkL(level)} c h)`;
      return {
        ...getLayerCss({ token: color }),
        [vars.layerIdle]: popColor,
      };
    };

    matchUtilities(
      {
        "ak-layer-pop": (value) => {
          const { token, level } = parseColorLevel(value);
          return getLayerPop(token, level);
        },
      },
      { values: getLayerValues({ downLevels: false }) },
    );

    matchUtilities(
      {
        "ak-layer-invert": (value) => {
          const { token, level } = parseColorLevel(value);
          return getLayerPop(token, level);
        },
      },
      { values: getLayerValues({ DEFAULT: "12", levels: false }) },
    );

    /**
     * @param {object} params
     * @param {string} params.color
     * @param {string} [params.level]
     * @param {string | null} [params.modifier]
     * @param {boolean} [params.soft]
     */
    function getEdgeCss({ color, level = "0", modifier = null, soft = false }) {
      const contrast = getContrast();
      const alphaModifier = modifier || 10;
      const lLight = `min(l, ${level} * 0.15 - ${contrast} * 0.15)`;
      const lDark = `max(max(l, 0.13), 1 - ${level} * 0.1 + ${contrast} * 0.1)`;
      // const c = `calc(c * 2)`;
      const c = `c`;
      const alphaBase = `(${alphaModifier} * ${oklchLightDark("1.2%", "1%")})`;
      const alphaLAdd = oklchLightDark("(1 - l) * 0.1%", "l * 0.1%");
      const alphaCAdd = `(c * 50%)`;
      const contrastAdd = `(12% * ${contrast})`;
      const alpha = `calc(${alphaBase} + ${alphaLAdd} + ${alphaCAdd} + ${contrastAdd})`;
      const lVar = soft ? vars._edgeLSoft : vars._edgeL;
      const finalColor = `oklch(from ${color} ${prop(lVar)} ${c} h / ${alpha})`;
      return {
        "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
        [lVar]: lLight,
        borderColor: prop(vars.border, prop(vars.layerBorder)),
        [soft ? vars.layerRing : vars.ring]: soft
          ? prop(vars.ring, finalColor)
          : finalColor,
        [soft ? vars.layerBorder : vars.border]: soft
          ? prop(vars.border, finalColor)
          : finalColor,
        [IN_DARK]: {
          [lVar]: lDark,
        },
      };
    }

    // =========================================================================
    // FRAME STYLES
    // =========================================================================

    matchUtilities(
      {
        "ak-edge": (value, { modifier }) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv(
            "color",
            value === "current" ? null : token,
            prop(vars.layer),
          );
          return getEdgeCss({ color: baseColor, level, modifier });
        },
      },
      {
        values: getLayerValues({ downLevels: false, DEFAULT: "current" }),
        modifiers: "any",
      },
    );

    matchUtilities(
      {
        // TODO: Maybe abstract this
        "ak-edge-shadow": (value, { modifier }) => {
          const { level } = parseColorLevel(value);
          const color = prop(vars.layer);
          const contrast = getContrast();
          const alphaModifier = modifier || 10;
          const lLight = `min(l - 0.1, ${level} * 0.15 - ${contrast} * 0.15)`;
          const lDark = `max(max(l, 0.13) + 0.13, 1 - ${level} * 0.1 + ${contrast} * 0.1)`;
          const alphaBase = `((${alphaModifier} + 100 - l * 100) * 1%)`;
          const alphaLAdd = oklchLightDark("(1 - l) * 0.1%", "l * 0.1%");
          // const alphaCAdd = `(c * 50%)`;
          const contrastAdd = `(12% * ${contrast})`;
          const alpha = `calc(${alphaBase} + ${alphaLAdd} + ${contrastAdd})`;
          const finalColor = `oklch(from ${color} ${prop(vars._edgeL)} 0 0 / ${alpha})`;
          return {
            "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
            [vars._edgeL]: lLight,
            borderColor: prop(vars.border, prop(vars.layerBorder)),
            [vars.ring]: finalColor,
            [vars.border]: finalColor,
            ...withParentL((l) => {
              if (l !== 0) return;
              return { [vars._edgeL]: lDark };
            }),
          };
        },
      },
      {
        values: getLayerValues({
          downLevels: false,
          colors: false,
          DEFAULT: "0",
        }),
        modifiers: "any",
      },
    );

    matchUtilities(
      {
        "ak-edge-contrast": (value) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv(
            "color",
            token,
            prop(vars.layerParent, prop(vars.layer)),
          );
          const { l, c, h } = getLayerOkLCH(
            oklchLightDark(`calc(${level} * -1)`, level),
          );

          return Object.assign(
            {
              "--tw-ring-color": prop(vars.ring),
              borderColor: prop(vars.border),
            },
            withParentOkL((parentL) => {
              const isDark = parentL < SCHEME_THRESHOLD_OKL;
              const t = isDark ? 1 : -1.2;
              const contrastL = `(${Math.max(parentL, 0.15)} + ${t * 0.3})`;
              const contrastLString = isDark
                ? `max(l, ${contrastL})`
                : `min(l, ${contrastL})`;
              const colorWithLevel =
                level === "0"
                  ? baseColor
                  : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
              const colorWithContrastL = `oklch(from ${colorWithLevel} ${contrastLString} c h / 100%)`;
              const colorWithContrast = getLayerContrastColor({
                level,
                color: colorWithContrastL,
                scheme: isDark ? "light" : "dark",
              });
              return {
                [vars.ring]: colorWithContrast,
                [vars.border]: colorWithContrast,
              };
            }),
          );
        },
      },
      {
        values: getLayerValues({ downLevels: false, DEFAULT: "0" }),
      },
    );

    // TODO: Abstract this logic (used in ak-layer-contrast and partly on
    // ak-edge-contrast)
    matchUtilities(
      {
        "ak-outline": (value) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, prop(vars.layerParent));
          const { l, c, h } = getLayerOkLCH(level);

          return Object.assign(
            withParentOkL((parentL) => {
              const isDark = parentL < SCHEME_THRESHOLD_OKL;
              const t = isDark ? 1 : -1;
              const contrastL = `(${Math.max(parentL, 0.15)} + ${t * 0.3})`;
              const contrastLString = isDark
                ? `max(l, ${contrastL})`
                : `min(l, ${contrastL})`;
              const colorWithLevel =
                level === "0"
                  ? baseColor
                  : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
              const colorWithContrastL = `oklch(from ${colorWithLevel} ${contrastLString} c h / 100%)`;
              const colorWithContrast = getLayerContrastColor({
                level,
                color: colorWithContrastL,
                scheme: isDark ? "light" : "dark",
              });
              const colorWithSafeL = `oklch(from ${colorWithContrast} ${prop(isDark ? vars._safeOkLUp : vars._safeOkLDown)} c h)`;
              return {
                outlineColor: colorWithSafeL,
              };
            }),
          );
        },
      },
      { values: getLayerValues({ DEFAULT: "0" }) },
    );

    /**
     * @param {string} radiusKey
     * @param {string | null} [modifier]
     */
    function getFrameArgs(radiusKey, modifier) {
      const radius = tv("radius", radiusKey, radiusKey);
      const padding =
        modifier ||
        (radiusKey === "DEFAULT"
          ? "0px"
          : theme("spacing")[radiusKey]
            ? t("spacing", radiusKey)
            : "0px");

      return { radius, padding };
    }

    // Threshold above which nested radius uses the provided value instead of
    // computed. This prevents overly small inner radii with large padding.
    const FRAME_PADDING_CAP = "1rem";

    /**
     * Returns CSS for tracking capped padding value.
     * @param {string} padding - The padding value to cap
     */
    function getFrameCappedPaddingCss(padding) {
      return {
        [vars._frameCappedPadding]: `min(${padding}, ${FRAME_PADDING_CAP})`,
      };
    }

    /**
     * Returns container query CSS that overrides nested radius when padding
     * exceeds cap threshold.
     * @param {object} params
     * @param {string} params.radius - The base radius to use when cap is hit
     * @param {Provide} params.provide - The provide function from withContext
     */
    function getFrameCapRadiusCss({ radius, provide }) {
      return {
        [`@container style(${vars._frameCappedPadding}: ${FRAME_PADDING_CAP})`]:
          {
            [provide(vars._frameRadius)]: radius,
            [vars.frameRadius]: radius,
          },
      };
    }

    /**
     * Returns the computed radius for a given radius value.
     * @param {object} params
     * @param {string} params.radius - The base radius value
     * @param {boolean} [params.force] - Whether to force the radius
     */
    function getComputedRadius({ radius, force = false }) {
      if (force) {
        return radius;
      }
      const minRadius = `min(0.125rem, ${radius})`;
      return `max(${minRadius}, max(${prop(vars._nestedRadius)}, 0px))`;
    }

    /**
     * Computes the nested radius based on parent frame context.
     * @param {object} params
     * @param {string} params.radius - The base radius value
     * @param {boolean} [params.force] - Whether to force the radius
     * @param {Inherit} params.inherit - The inherit function from withContext
     */
    function getNestedRadius({ radius, force = false, inherit }) {
      if (force) return;
      const parentPadding = inherit(vars._framePadding, "0px");
      const parentRadius = inherit(vars._frameRadius, radius);
      const parentBorder = inherit(vars._frameBorder, "0px");
      const selfMargin = prop(vars.frameMargin, "0px");
      return `calc(${parentRadius} - (${parentPadding} + ${parentBorder} + ${selfMargin}))`;
    }

    /**
     * @param {object} params
     * @param {string} params.radiusKey
     * @param {string | null} [params.modifier]
     * @param {boolean} [params.force]
     */
    function getFrameCss({ radiusKey, modifier = null, force = false }) {
      const { radius, padding } = getFrameArgs(radiusKey, modifier);
      const computedRadius = getComputedRadius({ radius, force });
      return css(
        {
          [vars.framePadding]: padding,
          [vars.frameRadius]: computedRadius,
          padding: prop(vars.framePadding),
          scrollPadding: prop(vars.framePadding),
          borderRadius: prop(vars.frameRadius),
        },
        getFrameCappedPaddingCss(prop(vars.framePadding)),
        withContext("frame", force, ({ provide, inherit }) => {
          const nestedRadius = getNestedRadius({
            radius,
            force,
            inherit,
          });
          const contextCss = css({
            [provide(vars._framePadding)]: prop(vars.framePadding),
            [provide(vars._frameRadius)]: prop(vars.frameRadius),
            [provide(vars._frameBorder)]: prop(vars._frameBorder),
            [provide(vars._frameRing)]: prop(vars._frameRing),
          });
          if (nestedRadius) {
            contextCss[vars._nestedRadius] = nestedRadius;
            Object.assign(
              contextCss,
              getFrameCapRadiusCss({ radius, provide }),
            );
          }
          return contextCss;
        }),
      );
    }

    /**
     * Creates frame CSS for edge styles (start or end)
     * @param {object} params
     * @param {"start" | "end"} params.position
     * @param {string} params.margin
     * @param {string} params.radius
     * @returns {import("./utils.js").CssInJs}
     */
    function createFrameEdgeStyles({ position, margin, radius }) {
      if (position === "start") {
        return {
          marginBlockStart: margin,
          borderStartStartRadius: radius,
          borderStartEndRadius: radius,
        };
      }
      return {
        marginBlockEnd: margin,
        borderEndStartRadius: radius,
        borderEndEndRadius: radius,
      };
    }

    /**
     * Creates the frame cover edge styles for start or end edges
     * @param {"start" | "end"} position
     */
    function getFrameCoverEdgeStyles(position) {
      return withContext("frame", false, ({ inherit }) => {
        const parentPadding = inherit(vars._framePadding, "0px");
        const parentRadius = inherit(vars._frameRadius, "0px");
        const borderForMargin = prop(vars.frameBorder);
        const margin = `calc((${parentPadding} + ${borderForMargin}) * -1)`;
        return createFrameEdgeStyles({
          position,
          margin,
          radius: parentRadius,
        });
      });
    }

    /**
     * Creates frame CSS for cover/overflow variants
     * @param {object} params
     * @param {string} params.radiusKey
     * @param {{ modifier: string | null }} params.extra
     * @param {boolean} params.useSelfBorder
     */
    function getFrameStretchCss({ radiusKey, extra, useSelfBorder }) {
      const { radius, padding } = getFrameArgs(radiusKey, extra.modifier);
      const cap = `1rem`;
      const capPadding = `min(${padding}, ${cap})`;
      const result = {
        [vars._frameCappedPadding]: capPadding,
        [vars.framePadding]: padding,
        padding,
        scrollPadding: padding,
        borderRadius: "0",
        [IN_DARK]: { colorScheme: "dark" },
        [IN_LIGHT]: { colorScheme: "light" },
      };
      return css(
        result,
        withContext("frame", false, ({ provide, inherit }) => {
          const parentPadding = inherit(vars._framePadding, "0px");
          const parentRadius = inherit(vars._frameRadius, radius);
          const parentBorder = inherit(vars._frameBorder, "0px");
          const parentRing = inherit(vars._frameRing, "0px");
          const selfRing = prop(vars._frameRing, "0px");
          // For overflow, include parent ring minus self ring in margin (clamped to 0)
          const borderForMargin = useSelfBorder
            ? prop(vars.frameBorder)
            : `calc(${parentBorder} + max(0px, ${parentRing} - ${selfRing}))`;
          const margin = `calc((${parentPadding} + ${borderForMargin}) * -1)`;
          const computedPadding = extra.modifier
            ? padding
            : inherit(vars._framePadding, padding);
          const computedRadius = useSelfBorder
            ? `calc(${parentRadius} - ${parentBorder})`
            : parentRadius;
          return css({
            [vars.frameMargin]: margin,
            [vars.framePadding]: computedPadding,
            [vars.frameRadius]: computedRadius,
            [provide(vars._framePadding)]: prop(vars.framePadding),
            [provide(vars._frameRadius)]: prop(vars.frameRadius),
            [provide(vars._frameBorder)]: prop(vars._frameBorder),
            [provide(vars._frameRing)]: prop(vars._frameRing),
            padding: prop(vars.framePadding),
            scrollPadding: prop(vars.framePadding),
            marginInline: prop(vars.frameMargin),
            "&:first-child": createFrameEdgeStyles({
              position: "start",
              margin,
              radius: prop(vars.frameRadius),
            }),
            "&:not(:has(~ *:not([hidden],template)))": createFrameEdgeStyles({
              position: "end",
              margin,
              radius: prop(vars.frameRadius),
            }),
          });
        }),
      );
    }

    matchUtilities(
      {
        "ak-frame-cover": (radiusKey, extra) =>
          getFrameStretchCss({ radiusKey, extra, useSelfBorder: true }),
        "ak-frame-overflow": (radiusKey, extra) =>
          getFrameStretchCss({ radiusKey, extra, useSelfBorder: false }),
        "ak-frame-force": (radiusKey, extra) =>
          getFrameCss({ radiusKey, modifier: extra.modifier, force: true }),
        "ak-frame": (radiusKey, extra) =>
          getFrameCss({ radiusKey, modifier: extra.modifier }),
      },
      {
        values: Object.keys(theme("radius")).reduce(
          (acc, key) => {
            if (key === "__CSS_VALUES__") return acc;
            acc[key] = key;
            return acc;
          },
          /** @type {Record<string, string>} */ ({}),
        ),
        modifiers: Object.keys(theme("spacing")).reduce(
          (acc, key) => {
            if (key === "__CSS_VALUES__") return acc;
            if (key === "DEFAULT") return acc;
            const isNumber = /^\d*\.?\d+$/u.test(key);
            if (isNumber) {
              acc[key] = `--spacing(${key})`;
            } else {
              acc[key] = t("spacing", key);
            }
            return acc;
          },
          /** @type {Record<string, string>} */ ({}),
        ),
      },
    );

    addUtilities({
      ".ak-frame-cover-start": getFrameCoverEdgeStyles("start"),
      ".ak-frame-cover-end": getFrameCoverEdgeStyles("end"),
    });

    matchUtilities(
      {
        "ak-frame-p": (value) => {
          const padding = value;
          const result = css(
            {
              [vars.framePadding]: padding,
              padding,
              scrollPadding: padding,
            },
            getFrameCappedPaddingCss(padding),
          );
          Object.assign(
            result,
            withContext("frame", false, ({ provide, inherit }) => {
              return {
                [provide(vars._framePadding)]: padding,
                [provide(vars._frameRadius)]: inherit(
                  vars._frameRadius,
                  prop(vars.frameRadius),
                ),
                [provide(vars._frameBorder)]: prop(vars._frameBorder),
                [provide(vars._frameRing)]: prop(vars._frameRing),
              };
            }),
          );
          return result;
        },
      },
      {
        values: Object.keys(theme("spacing")).reduce(
          (acc, key) => {
            if (key === "__CSS_VALUES__") return acc;
            if (key === "DEFAULT") return acc;
            const isNumber = /^\d*\.?\d+$/u.test(key);
            if (isNumber) {
              acc[key] = `--spacing(${key})`;
            } else {
              acc[key] = t("spacing", key);
            }
            return acc;
          },
          /** @type {Record<string, string>} */ ({}),
        ),
      },
    );

    matchUtilities(
      {
        "ak-frame-m": (value) => {
          return {
            [vars.frameMargin]: value,
            margin: value,
          };
        },
      },
      {
        values: Object.keys(theme("spacing")).reduce(
          (acc, key) => {
            if (key === "__CSS_VALUES__") return acc;
            if (key === "DEFAULT") return acc;
            const isNumber = /^\d*\.?\d+$/u.test(key);
            if (isNumber) {
              acc[key] = `--spacing(${key})`;
            } else {
              acc[key] = t("spacing", key);
            }
            return acc;
          },
          /** @type {Record<string, string>} */ ({}),
        ),
      },
    );

    /**
     * Creates frame-rounded CSS with optional force mode.
     * @param {object} params
     * @param {string} params.radiusKey
     * @param {boolean} [params.force]
     */
    function getFrameRoundedCss({ radiusKey, force = false }) {
      const radius = tv("radius", radiusKey, radiusKey);
      const computedRadius = getComputedRadius({ radius, force });
      return Object.assign(
        {
          [vars.frameRadius]: computedRadius,
          borderRadius: prop(vars.frameRadius),
        },
        withContext("frame", force, ({ provide, inherit }) => {
          const nestedRadius = getNestedRadius({ radius, force, inherit });
          const contextCss = css({
            [provide(vars._frameRadius)]: computedRadius,
            [provide(vars._frameBorder)]: prop(vars._frameBorder),
            [provide(vars._frameRing)]: prop(vars._frameRing),
          });
          if (nestedRadius) {
            contextCss[vars._nestedRadius] = nestedRadius;
            Object.assign(
              contextCss,
              getFrameCapRadiusCss({ radius, provide }),
            );
          }
          return contextCss;
        }),
      );
    }

    matchUtilities(
      {
        "ak-frame-rounded": (radiusKey) => getFrameRoundedCss({ radiusKey }),
        "ak-frame-rounded-force": (radiusKey) =>
          getFrameRoundedCss({ radiusKey, force: true }),
      },
      {
        values: Object.keys(theme("radius")).reduce(
          (acc, key) => {
            if (key === "__CSS_VALUES__") return acc;
            acc[key] = key;
            return acc;
          },
          /** @type {Record<string, string>} */ ({}),
        ),
      },
    );

    matchUtilities(
      {
        "ak-frame-border": (value) => {
          return css({
            [vars._frameBorder]: value,
            [vars.frameBorder]: value,
            borderWidth: prop(vars.frameBorder),
          });
        },
        "ak-border": (value) => {
          return css({
            [vars._frameBorder]: value,
            [vars.frameBorder]: value,
            borderWidth: prop(vars.frameBorder),
          });
        },
        "ak-ring": (value) => {
          const formatted = value.replaceAll(" ", "_");
          return css({
            [vars._frameRing]: value,
            [vars.frameRing]: value,
            [`@apply ring-[length:${formatted}]`]: {},
          });
        },
        "ak-bordering": (value) => {
          const valueDown = `calc(${down(prop(vars.layerLevel), value)})`;
          const valueUp = `calc(${up(prop(vars.layerLevel), value)})`;
          return css({
            [vars.bordering]: value,
            [IN_DARK]: {
              [vars._frameBorder]: valueUp,
              [vars.frameBorder]: valueUp,
              [vars._frameRing]: valueDown,
              [vars.frameRing]: valueDown,
              borderWidth: prop(vars.frameBorder),
              [`@apply ring-[length:${valueDown.replaceAll(" ", "_")}]`]: {},
            },
            [IN_LIGHT]: {
              [vars._frameBorder]: valueDown,
              [vars.frameBorder]: valueDown,
              [vars._frameRing]: valueUp,
              [vars.frameRing]: valueUp,
              borderWidth: prop(vars.frameBorder),
              [`@apply ring-[length:${valueUp.replaceAll(" ", "_")}]`]: {},
            },
          });
        },
      },
      { values: theme("borderWidth") },
    );

    matchUtilities(
      {
        "ak-text": (value, { modifier }) => {
          if (value === "current") {
            const percentage = toPercent(modifier, "100%");
            const baseAlpha = lchLightDark(53.6, 45.7);
            const lAdd = lchLightDark(`(100 - l) * 0.85`, `l * 1.08`);
            const cAdd = `(c * 0.036)`;
            const contrastAdd = `(20 * ${getContrast()})`;
            const minAlpha = `calc(${baseAlpha} + ${lAdd} + ${cAdd} + ${contrastAdd})`;
            const alpha = `clamp(${minAlpha} * 1%, ${percentage}, 100%)`;
            return {
              color: `lch(from ${prop(vars.layer)} ${TEXT_CONTRAST_L} 0 0 / ${alpha})`,
            };
          }
          const { token, level } = parseColorLevel(value);
          const contrast = getContrast();
          const { l, c, h } = getLayerOkLCH(prop(vars._textLevel));
          const tokenColor = tv("color", token, prop(vars.layer));
          const baseColor =
            level === "0"
              ? tokenColor
              : `oklch(from ${tokenColor} ${l} ${c} ${h} / 100%)`;

          const result = {
            color: prop(vars.text),
            [vars._textLevel]: level,
          };

          return Object.assign(
            result,
            withParentL((parentL) => {
              const step = 100 / LIGHTNESS_LEVELS;
              const threshold = Math.round(SCHEME_THRESHOLD_L / step) * step;
              if (parentL >= threshold - step && parentL <= threshold + step) {
                return;
              }
              const isDark = parentL < SCHEME_THRESHOLD_L;
              const t = isDark ? 1 : -1;
              const multiplier = `(max(53, ${modifier || 75}) * ${t})`;
              const l = `calc(${parentL} + ${multiplier} + (20 * ${contrast} * ${t}))`;
              const lString = isDark ? `max(l, ${l})` : `min(l, ${l})`;
              const c = isDark ? `c` : `min(c, 92)`;
              return {
                [vars.text]: `lch(from ${baseColor} clamp(0, ${lString}, 100) ${c} h / 100%)`,
                [vars._textLevel]: isDark ? level : `calc(${level} * -1)`,
              };
            }),
          );
        },
      },
      {
        values: getLayerValues({ levels: false, DEFAULT: "current" }),
        modifiers: "any",
      },
    );

    // =========================================================================
    // ===== THEME UTILS =======================================================
    // =========================================================================

    /**
     * Returns either the inline value or the CSS variable reference.
     * @param {string} namespace
     * @param {string} token
     * @param {string} [defaultValue]
     * @returns {string}
     */
    function t(namespace, token, defaultValue) {
      const options = theme(namespace)?.__CSS_VALUES__?.[token];
      const key = `--${namespace}${token === "DEFAULT" ? "" : `-${token}`}`;
      if (isInlineThemeReference(options)) {
        return theme(key, defaultValue);
      }
      if (defaultValue) {
        return `var(${key}, ${defaultValue})`;
      }
      return `var(${key})`;
    }

    /**
     * Returns either t(namespace, token) or the inline defaultValue if the
     * token is not provided.
     * @overload
     * @param {string} namespace
     * @param {string} token
     * @returns {string}
     * @overload
     * @param {string} namespace
     * @param {string | null | undefined} token
     * @param {string} defaultValue
     * @returns {string}
     * @overload
     * @param {string} namespace
     * @param {string | null | undefined} token
     * @param {string} [defaultValue]
     * @returns {string | undefined}
     * @param {string} namespace
     * @param {string | null | undefined} token
     * @param {string} [defaultValue]
     */
    function tv(namespace, token, defaultValue) {
      if (!token) return defaultValue;
      if (theme(namespace)?.[token]) {
        return t(namespace, token);
      }
      return token;
    }

    /**
     * @param {"color" | "length" | "number"} syntax
     * @param {string} css
     */
    // @ts-ignore
    function _debug(syntax, css) {
      const initialValues = {
        color: "red",
        length: "9999px",
        number: "9999",
      };
      addBase({
        "@property --debug": {
          syntax: `"<${syntax}>"`,
          inherits: "true",
          initialValue: initialValues[syntax],
        },
      });
      return { "--debug": css };
    }

    /**
     * Returns the contrast value.
     */
    function getContrast() {
      const contrastBase = t("contrast", "DEFAULT", "0");
      return `max(0, ${contrastBase})`;
    }

    /**
     * Returns CSS that enables a child to inherit CSS variables from its parent.
     * @typedef {"even" | "odd"} Parity
     * @typedef {(prop: (typeof vars)[keyof typeof vars]) => string} Provide
     * @typedef {(prop: (typeof vars)[keyof typeof vars], defaultValue?: string) =>
     * string} Inherit
     * @typedef {{ opposite: Provide, provide: Provide, inherit: Inherit }}
     * WithParentFnParams
     * @typedef {(params: WithParentFnParams) => import("./utils.js").CssInJs} WithParentFn
     * @param {string} id
     * @param {boolean} reset
     * @param {WithParentFn} fn
     */
    function withContext(id, reset, fn) {
      const getParityKey = () => `--_ak-${id}-parity`;

      /** @param {Parity} parity */
      const getNextParity = (parity) =>
        // TODO: Check if this !reset is necessary (it is, hover:ak-layer-10)
        parity === "even" && !reset ? "odd" : "even";

      /**
       * @param {Parity} [parity]
       * @returns {import("./utils.js").CssInJs}
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
        result[`@container style(${getParityKey()}: ${parity})`] =
          getCss(parity);
      }

      result[`@container not style(${getParityKey()})`] = getCss();

      return result;
    }
  },
);

export default AriakitTailwind;
