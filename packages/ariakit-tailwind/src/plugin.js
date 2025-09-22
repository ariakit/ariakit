import colorString from "color-string";
import plugin from "tailwindcss/plugin";
import {
  bareValue,
  colorMix,
  css,
  IN_DARK,
  IN_LIGHT,
  isInlineThemeReference,
  LIGHTNESS_LEVELS,
  lchLightDark,
  MAX_NON_BARE_LEVELS,
  oklchLightDark,
  prop,
  properties,
  SCHEME_THRESHOLD_L,
  SCHEME_THRESHOLD_OKL,
  TEXT_CONTRAST_L,
  textColor,
  toPercent,
  vars,
  withParentL,
  withParentOkL,
} from "./utils.js";

/** @type {ReturnType<typeof plugin>} */
const AriakitTailwind = plugin(
  ({ addBase, addVariant, addUtilities, matchUtilities, theme }) => {
    /** @type {Set<string>} */
    const registeredContextProps = new Set();

    addBase(properties);

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
          values.down = "down-1";
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
          values[key] = key;
          if (/-\d+$/.test(key)) continue;
          for (let i = 1; i <= MAX_NON_BARE_LEVELS; i++) {
            values[`${key}-${i}`] = `${key}-${i}`;
            if (downLevels) {
              values[`${key}-down`] = `${key}-down-1`;
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
        return { token: undefined, level: "1" };
      }
      const matches = value.match(/(down-)?([.\d]+)$/);
      if (!matches) {
        return { token: value, level: "0" };
      }
      const [, down, level = down ? "-1" : undefined] = matches;
      if (!level || theme("colors")[value] || colorString.get(value)) {
        return { token: value, level: "0" };
      }
      return {
        token: value.slice(0, -((down?.length || 0) + level.length) - 1),
        level: down ? `-${level}` : level,
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
        const isDown = level.startsWith("-");
        const layerContrast = `min(1, calc(-1 * ${contrast}))`;
        const negativeContrast = `min(0, ${layerContrast})`;
        l = `calc(${l} + ${lMultiplier} * ${negativeContrast} * ${oklchLightDark(isDown ? "-1" : "-5", isDown ? "-0.5" : "1")})`;
      }
      return { l, c, h };
    }

    /**
     * Adjust color contrast relative to the parent scheme and layer direction.
     * Maintains perceived contrast when the parent scheme changes and when the
     * current layer is a down layer.
     * @param {object} params
     * @param {string} params.color
     * @param {boolean} params.isDown
     * @param {"light" | "dark"} [params.scheme]
     * @param {string} [params.contrast]
     */
    function getLayerContrastColor({
      color,
      isDown,
      scheme,
      contrast = getContrast(),
    }) {
      if (contrast === "0") return color;
      const lMultiplier = `(0.07 + c / 3)`;
      const light = isDown ? "-0.3" : "-1";
      const dark = isDown ? "0" : "1";
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
     * @param {boolean} params.isDown
     * @returns {string}
     */
    function getLayerColor({ baseColor, level, isDown }) {
      const { l, c, h } = getLayerOkLCH(level);
      const colorWithLevel =
        level === "0"
          ? baseColor
          : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
      const color = `oklch(from ${colorWithLevel} ${prop(vars._safeOkL)} c h / 100%)`;
      return getLayerContrastColor({ color, isDown, contrast: getContrast() });
    }

    /**
     * @param {object} params
     * @param {string | null | undefined} [params.token]
     * @param {string} [params.level]
     * @param {boolean} [params.soft]
     */
    function getLayerCss({ token, level = "0", soft = false }) {
      const shadowAlpha = `calc(10% + (1 - l) * 2 * 25%)`;
      const isDown = level.startsWith("-") && !token;

      /** @param {string} color */
      const shadow = (color) => `oklch(from ${color} 0 0 0 / ${shadowAlpha})`;

      const result = css(getCurrentLayerCss(), {
        [vars.layer]: prop(vars._layerIdle),
        [vars.shadow]: shadow(prop(vars.layer)),

        [vars._layerDown]: isDown ? "1" : "0",
        [vars._layerAppearance]: textColor(prop(vars.layer)),
        [vars._layerL]: `lch(from ${prop(vars.layer)} round(l, ${100 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
        [vars._layerOkL]: `oklch(from ${prop(vars.layer)} round(l, ${1 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
      });

      const baseColor = token
        ? tv("color", token)
        : prop(vars._layerBase, prop(vars.layerParent));
      const computedColor = getLayerColor({ baseColor, level, isDown });

      if (token) {
        Object.assign(result, {
          [vars._layerBase]: computedColor,
        });
      }

      if (!soft) {
        Object.assign(result, {
          [vars._layerIdle]: computedColor,
          [vars.text]: textColor(prop(vars.layer)),
        });
      }

      Object.assign(
        result,
        withContext("layer-parent", false, ({ provide, inherit }) => {
          const layerParent = prop(vars.layerParent, "canvas");
          const result = {
            [provide(vars._layerParent)]: prop(vars.layer),
            [vars.shadow]: shadow(layerParent),
            [vars.layerParent]: inherit(vars._layerParent),
          };
          return Object.assign(
            result,
            getEdgeCss({
              color: colorMix(prop(vars.layer), layerParent),
              soft: true,
            }),
          );
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
        "ak-layer-contrast": (value) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, prop(vars.layerParent));
          const { l, c, h } = getLayerOkLCH(level);

          return Object.assign(
            getLayerCss({ token, level }),
            withParentOkL((parentL) => {
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
                isDown: false,
                scheme: isDark ? "light" : "dark",
                contrast: `calc(${getContrast()} * 2)`,
              });
              const colorWithSafeL = `oklch(from ${colorWithContrast} ${prop(isDark ? vars._safeOkLUp : vars._safeOkLDown)} c h)`;
              return {
                [vars._layerIdle]: colorWithSafeL,
                [vars._layerBase]: colorWithSafeL,
              };
            }),
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
          const baseColor = tv("color", token, prop(vars._layerIdle));
          const { l, c, h } = getLayerOkLCH(level);
          const color = `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
          const percentage = toPercent(modifier, "50%");
          const mixColor = `color-mix(in oklab, ${prop(vars.layerParent)}, ${color} ${percentage})`;
          if (token) {
            return {
              ...getLayerCss({ token }),
              [vars._layerIdle]: mixColor,
              [vars._layerBase]: mixColor,
            };
          }
          return {
            ...getLayerCss({ token, level, soft: true }),
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
            [vars.layer]: `oklch(from ${prop(vars._layerIdle)} ${getLayerPopOkL(level)} c h)`,
          };
        },
        "ak-layer-hover-vivid": (value) => {
          const { token, level } = parseColorLevel(value);
          const c = `clamp(0, c + 0.1 * ${level}, 0.4)`;
          const colorBase = `oklch(from ${prop(vars._layerIdle)} l ${c} h)`;
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

    matchUtilities(
      {
        "ak-layer-pop": (value) => {
          const { token, level } = parseColorLevel(value);
          const color = tv("color", token, prop(vars.layerParent));
          return {
            ...getLayerCss({ token: color }),
            [vars._layerIdle]: `oklch(from ${prop(vars._layerBase)} ${getLayerPopOkL(level)} c h)`,
          };
        },
      },
      { values: getLayerValues({ downLevels: false }) },
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
      const lVar = soft ? "--l-soft" : "--l";
      const finalColor = `oklch(from ${color} var(${lVar}) ${c} h / ${alpha})`;
      return {
        "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
        // TODO: Rename this variable
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
          const finalColor = `oklch(from ${color} var(--l) 0 0 / ${alpha})`;
          return {
            "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
            // TODO: Rename this variable
            "--l": lLight,
            borderColor: prop(vars.border, prop(vars.layerBorder)),
            [vars.ring]: finalColor,
            [vars.border]: finalColor,
            ...withParentL((l) => {
              if (l !== 0) return;
              return { "--l": lDark };
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
          const { l, c, h } = getLayerOkLCH(oklchLightDark(`-${level}`, level));

          return Object.assign(
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
                color: colorWithContrastL,
                isDown: false,
                scheme: isDark ? "light" : "dark",
              });
              return {
                "--tw-ring-color": prop(vars.ring),
                borderColor: prop(vars.border),
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
                color: colorWithContrastL,
                isDown: false,
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

    /**
     * @param {object} params
     * @param {string} params.radiusKey
     * @param {string | null} [params.modifier]
     * @param {boolean} [params.force]
     */
    function getFrameCss({ radiusKey, modifier = null, force = false }) {
      const { radius, padding } = getFrameArgs(radiusKey, modifier);
      const cap = `1rem`;
      const capPadding = `min(${padding}, ${cap})`;

      const result = {
        [vars.framePadding]: padding,
        padding,
        scrollPadding: padding,
        borderRadius: radius,
      };
      Object.assign(
        result,
        withContext("frame", force, ({ provide, inherit }) => {
          const parentPadding = inherit(vars._framePadding, "0px");
          const parentRadius = inherit(vars._frameRadius, radius);
          const parentBorder = inherit(vars._frameBorder, "0px");
          const minRadius = `min(0.125rem, ${radius})`;
          const nestedRadius = `(${parentRadius} - calc(${parentPadding} + ${parentBorder}))`;

          const computedRadius = force
            ? radius
            : `max(${minRadius}, max(${nestedRadius}, 0px))`;

          return {
            [provide(vars._framePadding)]: padding,
            [provide(vars._frameRadius)]: computedRadius,
            [provide(vars._frameBorder)]: prop(vars._frameBorder),
            [vars.frameRadius]: computedRadius,
            borderRadius: computedRadius,

            [vars._frameCappedPadding]: capPadding,
            [`@container style(${vars._frameCappedPadding}: ${cap})`]: {
              [provide(vars._frameRadius)]: radius,
              [vars.frameRadius]: radius,
              borderRadius: radius,
            },
          };
        }),
      );

      return result;
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
        [vars.framePadding]: padding,
        padding,
        scrollPadding: padding,
        borderRadius: radius,
        [IN_DARK]: { colorScheme: "dark" },
        [IN_LIGHT]: { colorScheme: "light" },
      };

      return Object.assign(
        result,
        withContext("frame", false, ({ provide, inherit }) => {
          const parentPadding = inherit(vars._framePadding, "0px");
          const parentRadius = inherit(vars._frameRadius, radius);
          const parentBorder = inherit(vars._frameBorder, "0px");
          const borderForMargin = useSelfBorder
            ? prop(vars.frameBorder)
            : parentBorder;
          const margin = `calc((${parentPadding} + ${borderForMargin}) * -1)`;
          const computedPadding = extra.modifier
            ? padding
            : inherit(vars._framePadding, padding);
          const computedRadius = useSelfBorder
            ? `calc(${parentRadius} - ${parentBorder})`
            : parentRadius;

          return css({
            [vars._frameCappedPadding]: capPadding,
            [provide(vars._framePadding)]: computedPadding,
            [provide(vars._frameRadius)]: computedRadius,
            [provide(vars._frameBorder)]: prop(vars._frameBorder),
            [vars.frameMargin]: margin,
            [vars.framePadding]: computedPadding,
            [vars.frameRadius]: computedRadius,
            marginInline: margin,
            padding: computedPadding,
            scrollPadding: computedPadding,
            borderRadius: "0",
            "&:first-child": createFrameEdgeStyles({
              position: "start",
              margin,
              radius: computedRadius,
            }),
            "&:not(:has(~ *:not([hidden],template)))": createFrameEdgeStyles({
              position: "end",
              margin,
              radius: computedRadius,
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
        "ak-bordering": (value) => {
          const down = prop(vars._layerDown);
          const valueDown = `calc(${value} * ${down})`;
          const valueUp = `calc(${value} * (1 - ${down}))`;
          return css({
            [vars.bordering]: value,
            [IN_DARK]: {
              [vars._frameBorder]: valueUp,
              [vars.frameBorder]: valueUp,
              borderWidth: prop(vars.frameBorder),
              [`@apply ring-[${valueDown.replaceAll(" ", "_")}]`]: {},
            },
            [IN_LIGHT]: {
              [vars._frameBorder]: valueDown,
              [vars.frameBorder]: valueDown,
              borderWidth: prop(vars.frameBorder),
              [`@apply ring-[${valueUp.replaceAll(" ", "_")}]`]: {},
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
                [vars._textLevel]: isDark ? level : `-${level}`,
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

      if (!registeredContextProps.has(id)) {
        addBase({
          [`@property ${getParityKey()}`]: {
            syntax: "'even | odd | none'",
            inherits: "true",
            initialValue: "none",
          },
        });
        registeredContextProps.add(id);
      }

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

      result[`@container style(${getParityKey()}: none)`] = getCss();

      return result;
    }
  },
);

export default AriakitTailwind;
