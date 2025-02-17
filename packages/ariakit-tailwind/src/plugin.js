import colorString from "color-string";
import plugin from "tailwindcss/plugin";
import {
  LIGHTNESS_LEVELS,
  bareValue,
  colorMix,
  css,
  isInlineThemeReference,
  lchLightDark,
  oklchLightDark,
  prop,
  properties,
  textColor,
  toPercent,
  vars,
  withContext,
  withParentLightness,
} from "./utils.js";

/** @type {ReturnType<typeof plugin>} */
const AriakitTailwind = plugin(
  ({ addBase, addVariant, addUtilities, matchUtilities, theme }) => {
    addBase(properties);

    const IN_DARK = `@container style(${vars._layerAppearance}: oklch(1 0 0))`;
    const IN_LIGHT = `@container style(${vars._layerAppearance}: oklch(0 0 0))`;
    addVariant("ak-dark", IN_DARK);
    addVariant("ak-light", IN_LIGHT);

    /**
     * Returns the accepted values for the layer utilities.
     * @param {{ additionalKeys?: string[], colors?: boolean, levels?: boolean,
     * DEFAULT?: string | null }} [options]
     */
    function getLayerValues({
      additionalKeys = [],
      colors = true,
      levels = true,
      DEFAULT = levels ? "1" : undefined,
    } = {}) {
      const maxNonBareLevels = 10;
      /** @type {Record<string, string>} */
      const values = {};
      if (DEFAULT) {
        values.DEFAULT = DEFAULT;
      }
      if (levels) {
        values.down = "down-1";
        // Add non bare level values
        for (let i = 0; i <= maxNonBareLevels; i++) {
          values[i] = `${i}`;
          values[`down-${i}`] = `down-${i}`;
        }
      }
      // Add non bare color and level values
      if (colors) {
        const { __CSS_VALUES__, ...themeColors } = theme("colors");
        const themeKeys = Object.keys(themeColors);
        const keys = [...themeKeys, ...additionalKeys];

        for (const key of keys) {
          const hasTrailingNumber = /-\d+$/.test(key);
          if (hasTrailingNumber) {
            values[key] = key;
            continue;
          }
          values[key] = key;
          for (let i = 1; i <= maxNonBareLevels; i++) {
            values[`${key}-${i}`] = `${key}-${i}`;
            values[`${key}-down`] = `${key}-down-1`;
            values[`${key}-down-${i}`] = `${key}-down-${i}`;
          }
        }
        Object.assign(
          values,
          bareValue(({ value }) => {
            const { token } = parseColorLevel(value);
            if (!token) return;
            if (!theme("colors")[token]) return;
            return value;
          }),
        );
      }
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
      const matches = value.match(/(down\-)?([\.\d]+)$/);
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

    /**
     * Returns the layer's computed okLCH values based on the provided level.
     * @param {string} level
     */
    function getLayerOkLCH(level) {
      const minL = `min(0.13, ${level})`;
      const lMultiplier = 0.05;
      const cMultiplier = 0.002;
      const l = `max(0, max(l, ${minL}) + ${level} * ${lMultiplier})`;
      const c = `max(0, c - ${level} * ${cMultiplier})`;
      const h = "h";
      return { l, c, h };
    }

    /**
     * @param {string} color
     * @param {boolean} isDown
     * @param {string} [contrast]
     */
    function getLayerContrastColor(color, isDown, contrast = getContrast()) {
      if (contrast === "0") return color;
      const lMultiplier = `(0.07 + c / 3)`;
      const contrastMultiplier = oklchLightDark(
        isDown ? "-0.3" : "-1",
        isDown ? "0" : "1",
      );
      const layerContrast = `min(1, calc(-1 * ${contrast}))`;
      const negativeContrast = `min(0, ${layerContrast})`;
      return `oklch(from ${color} calc(l + ${lMultiplier} * ${negativeContrast} * ${contrastMultiplier}) c h)`;
    }

    /**
     * Returns the current layer's css.
     */
    function getCurrentLayerCss() {
      return css({
        backgroundColor: prop(vars.layer),
        borderColor: prop(vars.border),
        color: prop(vars.text),
        "--tw-ring-color": prop(vars.ring),
        "--tw-shadow-color": prop(vars.shadow),
      });
    }

    /**
     * @param {string | null | undefined} token
     * @param {string} level
     * @param {string} [_highlightLevel]
     */
    function getLayerCss(
      token,
      level,
      _highlightLevel,
      contrast = getContrast(),
    ) {
      const baseColor = tv("color", token);
      const { l, c, h } = getLayerOkLCH(level);
      const isDown = level.startsWith("-") && !token;

      const ringC = `calc(c * 2)`;
      const ringAlphaBase = lchLightDark("10%", "14%");
      const ringAlphaLAdd = lchLightDark("(100 - l) * 0.1%", "l * 0.1%");
      const ringAlphaCAdd = `(c * 0.2%)`;
      const ringContrastAdd = `(12% * ${contrast})`;
      const ringAlpha = `calc((${ringAlphaBase} + ${ringAlphaLAdd} + ${ringAlphaCAdd}) + ${ringContrastAdd})`;

      const shadowAlpha = `calc(10% + (1 - l) * 2 * 25%)`;

      /** @param {string} color */
      const border = (color) => {
        const lBase = oklchLightDark("-0.08", "0.087");
        const lContrast = `(${oklchLightDark("-0.09", "0.165")} * ${contrast})`;
        const l = `max(0, l + ${lBase} + ${lContrast})`;
        return `oklch(from ${color} ${l} c h / 100%)`;
      };

      /** @param {string} color */
      const ring = (color) =>
        `lch(from ${color} ${prop(vars._textContrastL)} ${ringC} h / ${ringAlpha})`;

      /** @param {string} color */
      const shadow = (color) => `oklch(from ${color} 0 0 0 / ${shadowAlpha})`;

      const result = css({
        ...getCurrentLayerCss(),

        [vars.layer]: prop(vars._layerIdle),
        [vars.text]: textColor(prop(vars.layer)),
        [vars.ring]: ring(prop(vars.layer)),
        [vars.border]: border(prop(vars.layer)),
        [vars.shadow]: shadow(prop(vars.layer)),

        [vars._layerAppearance]: textColor(prop(vars.layer)),
        [vars._layerL]: `lch(from ${prop(vars.layer)} round(l, ${100 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
      });

      if (token) {
        const colorWithLevel = `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
        const colorWithSafeL = `oklch(from ${colorWithLevel} ${prop(vars._safeOkL)} c h)`;
        const colorWithContrast = getLayerContrastColor(colorWithSafeL, isDown);
        Object.assign(result, {
          [vars._layerIdle]: colorWithContrast,
          [vars._layerBase]: colorWithContrast,
        });
      } else {
        const color = prop(vars._layerBase, prop(vars.layerParent));
        const colorWithLevel = `oklch(from ${color} ${l} ${c} ${h} / 100%)`;
        const colorWithSafeL = `oklch(from ${colorWithLevel} ${prop(vars._safeOkL)} c h)`;
        const colorWithContrast = getLayerContrastColor(colorWithSafeL, isDown);
        Object.assign(result, {
          [vars._layerIdle]: colorWithContrast,
        });
      }

      Object.assign(
        result,
        withContext("layer-parent", false, ({ provide, inherit }) => {
          const layerParent = prop(vars.layerParent);
          const result = {
            [provide(vars._layerParent)]: prop(vars.layer),
            [vars.layerParent]: inherit(vars._layerParent),
            [vars.shadow]: shadow(layerParent),
            [vars.border]: border(colorMix(prop(vars.layer), layerParent)),
            [vars.ring]: ring(colorMix(prop(vars.layer), layerParent)),
          };
          return result;
        }),
      );

      return result;
    }

    matchUtilities(
      {
        "ak-layer": (value) => {
          const { token, level } = parseColorLevel(value);
          return getLayerCss(token, level);
        },
      },
      { values: getLayerValues() },
    );

    addUtilities({
      ".ak-layer-current": getCurrentLayerCss(),
    });

    matchUtilities(
      {
        "ak-layer-mix": (value, { modifier }) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, prop(vars.layerParent));
          const { l, c, h } = getLayerOkLCH(level /*, "0"*/);
          const color = `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
          const percentage = toPercent(modifier, "50%");
          return getLayerCss(
            `color-mix(in oklab, ${prop(vars.layerParent)}, ${color} ${percentage})`,
            level,
          );
        },
      },
      { values: getLayerValues(), modifiers: "any" },
    );

    /** @param {string} level */
    function getLayerPopCss(level) {
      const threshold = t("layer", "pop-threshold", "0.5");
      // light: -1, dark: 1
      const mode = `clamp(-1, (calc(${threshold} * 10) - l * 10) * infinity - 1, 1)`;
      const relativeLevel = `calc(${level} * ${mode})`;
      const minL = `min(0.16, ${level})`;
      const l = `calc(max(l, ${minL}) + 0.06 * ${relativeLevel})`;
      return {
        ...getLayerCss(null, "0", relativeLevel),
        [vars.layer]: `oklch(from ${prop(vars._layerIdle)} ${l} c h / 100%)`,
      };
    }

    /** @param {string} level */
    function getLayerFeatureCss(level) {
      const result = getLayerCss(null, level);
      Object.assign(
        result,
        withParentLightness((l) => {
          if (l !== 100 && l !== 0) return;
          return {
            borderWidth: `1px`,
          };
        }),
      );
      return result;
    }

    matchUtilities(
      {
        "ak-layer-pop": getLayerPopCss,
        "ak-layer-feature": getLayerFeatureCss,
      },
      { values: getLayerValues({ colors: false }) },
    );

    matchUtilities(
      {
        "ak-layer-contrast": (value) => {
          const { token, level } = parseColorLevel(value);
          const result = getLayerCss(token, level);
          const contrast = getContrast();

          return Object.assign(
            result,
            withParentLightness((l) => {
              // if (l === 50) return;
              // TODO: Refactor names.
              const lFactor = l < 50 ? 1 : -1;
              const l2 = `calc(${l} + ${41 * lFactor} + (100 * ${contrast} * ${lFactor}))`;
              const lString = l < 50 ? `max(l, ${l2})` : `min(l, ${l2})`;
              const c = l > 50 ? `min(c, 92)` : `c`;
              return {
                [vars._layerIdle]: `lch(from ${prop(vars._layerBase)} clamp(0, ${lString}, 100) ${c} h / 100%)`,
              };
            }),
          );
        },
      },
      { values: getLayerValues({ levels: false }) },
    );

    /**
     * @param {string} radiusKey
     * @param {string | null} [modifier]
     */
    function getFrameArgs(radiusKey, modifier) {
      const radius = t("radius", radiusKey);
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
     * @param {string} radiusKey
     * @param {string | null} [modifier]
     * @param {boolean} [force]
     */
    function getFrameCss(radiusKey, modifier, force = false) {
      const { radius, padding } = getFrameArgs(radiusKey, modifier);
      const cap = `1rem`;
      const capPadding = `min(${padding}, ${cap})`;

      const result = {
        padding,
        scrollPadding: padding,
        borderRadius: radius,
      };
      Object.assign(
        result,
        withContext("frame", force, ({ provide, inherit }) => {
          const parentRadius = inherit(vars._frameRadius, radius);
          const parentPadding = inherit(vars._framePadding, "0px");
          const parentBorder = inherit(vars._frameBorder, "0px");
          const minRadius = `min(0.25rem, ${radius})`;
          const nestedRadius = `(${parentRadius} - calc(${parentPadding} + ${parentBorder}))`;

          const computedRadius = force
            ? radius
            : `max(${minRadius}, max(${nestedRadius}, 0px))`;

          return {
            [provide(vars._framePadding)]: padding,
            [provide(vars._frameRadius)]: computedRadius,
            [provide(vars._frameBorder)]: prop(vars._frameBorder),
            borderRadius: computedRadius,

            [vars._frameCappedPadding]: capPadding,
            [`@container style(${vars._frameCappedPadding}: ${cap})`]: {
              [provide(vars._frameRadius)]: radius,
              borderRadius: radius,
            },
          };
        }),
      );

      return result;
    }

    matchUtilities(
      {
        "ak-frame-cover": (radiusKey, extra) => {
          const { radius, padding } = getFrameArgs(radiusKey, extra.modifier);
          const result = {
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
              const margin = `calc(${parentPadding} * -1)`;
              const computedPadding = extra.modifier
                ? padding
                : inherit(vars._framePadding, padding);
              const computedRadius = `calc(${parentRadius} - ${parentBorder})`;
              return css({
                [provide(vars._framePadding)]: computedPadding,
                [provide(vars._frameRadius)]: computedRadius,
                [provide(vars._frameBorder)]: prop(vars._frameBorder),
                marginInline: margin,
                padding: computedPadding,
                scrollPadding: computedPadding,
                borderRadius: computedRadius,
                "&:first-child": {
                  marginBlockStart: margin,
                },
                "&:not(:has(~ *:not([hidden])))": {
                  marginBlockEnd: margin,
                },
              });
            }),
          );
        },
        "ak-frame-force": (radiusKey, extra) =>
          getFrameCss(radiusKey, extra.modifier, true),
        "ak-frame": (radiusKey, extra) =>
          getFrameCss(radiusKey, extra.modifier),
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

    matchUtilities(
      {
        "ak-frame-border": (value) => {
          return css({
            [vars._frameBorder]: value,
            borderWidth: prop(vars._frameBorder),
          });
        },
      },
      { values: theme("borderWidth") },
    );

    matchUtilities(
      {
        // TODO: Allow levels. It will decide if the text should have less
        // contrast up to a minimum (1, 2, 3 -> less contrast).
        "ak-text": (value) => {
          const { token, level } = parseColorLevel(value);
          const contrast = getContrast();
          const { l, c, h } = getLayerOkLCH(prop(vars._textLevel) /*, "0"*/);
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
            withParentLightness((l) => {
              if (l === 50) return;
              // TODO: Refactor names.
              const lFactor = l < 50 ? 1 : -1;
              // const l2 = `calc(${l} + ${53 * lFactor} + (20 * ${contrast} * ${lFactor}))`;
              const l2 = `calc(${l} + ${75 * lFactor} + (20 * ${contrast} * ${lFactor}))`;
              const lString = l < 50 ? `max(l, ${l2})` : `min(l, ${l2})`;
              const c = l > 50 ? `min(c, 92)` : `c`;
              return {
                [vars.text]: `lch(from ${baseColor} clamp(0, ${lString}, 100) ${c} h / 100%)`,
                [vars._textLevel]: l > 50 ? `-${level}` : level,
              };
            }),
          );
        },
      },
      { values: getLayerValues({ levels: false }) },
    );

    matchUtilities(
      {
        "ak-text-opacity": (value) => {
          const percentage = toPercent(value, "0%");
          const textL = `calc((49.44 - l) * infinity)`;
          const isBgDark = `clamp(0, ${textL}, 1)`;
          const isBgLight = `clamp(0, 1 - ${textL}, 1)`;
          const baseAlpha = `((45.7 * ${isBgDark}) + (53.6 * ${isBgLight}))`;
          const lAdd = `((l * 1.08 * ${isBgDark}) + ((100 - l) * 0.85 * ${isBgLight}))`;
          const cAdd = `(c * 0.036)`;
          const contrastAdd = `(20 * ${getContrast()})`;
          const minAlpha = `calc(${baseAlpha} + ${lAdd} + ${cAdd} + ${contrastAdd})`;
          const alpha = `clamp(${minAlpha} * 1%, ${percentage}, 100%)`;
          return {
            color: `lch(from ${prop(vars.layer)} ${textL} 0 0 / ${alpha})`,
          };
        },
      },
      {
        values: {
          DEFAULT: "0",
          ...Array.from({ length: 21 }, (_, i) => 5 * i).reduce((acc, n) => {
            acc[`${n}`] = `${n}`;
            return acc;
          }, css()),
          ...bareValue(({ value }) => {
            if (!/^\d+$/.test(value)) return;
            return value;
          }),
        },
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
    function debug(syntax, css) {
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
  },
);

export default AriakitTailwind;
