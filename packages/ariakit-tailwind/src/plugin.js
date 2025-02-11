import colorString from "color-string";
import plugin from "tailwindcss/plugin";

const LIGHTNESS_LEVELS = 20;

const $ = /** @type {const} */ ({
  layer: "--ak-layer",
  layerBase: "--ak-layer-base",
  layerParent: "--ak-layer-parent",
  // TODO: Maybe this doesn't need to be public API since we have currentColor
  text: "--ak-text",
  ring: "--ak-ring",
  border: "--ak-border",
  shadow: "--ak-shadow",

  _layerL: "--_ak-layer-l",
  _layerAppearance: "--_ak-layer-appearance",
  _layerLevel: "--_ak-layer-level",
  _layerParent: "--_ak-layer-parent",
  _layerIdle: "--_ak-layer-idle",
  _frameBorder: "--_ak-frame-border",
  _frameRadius: "--_ak-frame-radius",
  _framePadding: "--_ak-frame-padding",
  _frameCappedPadding: "--_ak-frame-capped-padding",
  _textLevel: "--_ak-text-level",
  _borderAlpha: "--_ak-border-alpha",
  _ringAlpha: "--_ak-ring-alpha",
});

/** @type {ReturnType<typeof plugin>} */
const AriakitTailwind = plugin(
  ({ addBase, addVariant, addUtilities, matchUtilities, theme }) => {
    addBase({
      // Whether the layer is dark (lch(100 0 0)) or light (lch(0 0 0))
      [`@property ${$._layerAppearance}`]: {
        syntax: "'<color>'",
        inherits: "true",
        initialValue: "lch(0 0 0)",
      },
      // The rounded lightness value of the layer (0-100)
      [`@property ${$._layerL}`]: {
        syntax: "'<color>'",
        inherits: "true",
        initialValue: "oklch(100 0 0)",
      },
      // TODO: Comment
      [`@property ${$._frameCappedPadding}`]: {
        syntax: "'<length>'",
        inherits: "true",
        initialValue: "0px",
      },
      // TODO: Comment
      [`@property ${$._frameBorder}`]: {
        syntax: "'<length>'",
        inherits: "false",
        initialValue: "0px",
      },
    });

    const IN_DARK = `@container style(${$._layerAppearance}: lch(100 0 0))`;
    const IN_LIGHT = `@container style(${$._layerAppearance}: lch(0 0 0))`;
    addVariant("ak-dark", IN_DARK);
    addVariant("ak-light", IN_LIGHT);

    /**
     * @param {string | null | undefined} token
     * @param {string} level
     * @param {string} [highlightLevel]
     */
    function getLayerCss(token, level, highlightLevel) {
      const baseColor = tv("color", token, cssVar($.layerBase));

      const { l, c, h } = getLayerOkLCH(
        // If the color token is provided, we use the level as is, otherwise we
        // stack the levels.
        token ? level : cssVar($._layerLevel),
      );

      const textL = `calc((49.44 - l) * infinity)`;
      const contrast = getContrast();

      const ringC = `calc(c * 2)`;
      const ringAlphaBase = lchLightDark("10%", "14%");
      const ringAlphaLAdd = lchLightDark("(100 - l) * 0.1%", "l * 0.1%");
      const ringAlphaCAdd = `(c * 0.2%)`;
      const ringContrastAdd = `(12% * ${contrast})`;
      const ringAlpha = `calc((${ringAlphaBase} + ${ringAlphaLAdd} + ${ringAlphaCAdd}) + ${ringContrastAdd})`;

      const shadowAlpha = `calc(25% + (1 - l) * 25%)`;

      // const borderC = `calc(c * 2)`;
      const borderAlphaBase = lchLightDark("10%", "8%");
      const borderAlphaLAdd = lchLightDark("(100 - l) * 0.1%", "l * 0.1%");
      const borderAlphaCAdd = lchLightDark("c * 0.5%", "c * 0.2%");
      const borderContrastAdd = `(12% * ${contrast})`;
      const borderAlpha = `calc((${borderAlphaBase} + ${borderAlphaLAdd} + ${borderAlphaCAdd}) + ${borderContrastAdd})`;

      /** @param {string} color */
      const border = (color) => {
        const lBase = oklchLightDark("-0.08", "0.087");
        const lContrast = `(${oklchLightDark("-0.09", "0.165")} * ${contrast})`;
        const l = `max(0, l + ${lBase} + ${lContrast})`;
        return `oklch(from ${color} ${l} c h / 100%)`;
      };

      /** @param {string} color */
      const ring = (color) =>
        `lch(from ${color} ${textL} ${ringC} h / ${cssVar($._ringAlpha)})`;

      /** @param {string} color */
      const shadow = (color) => `oklch(from ${color} 0 0 0 / ${shadowAlpha})`;

      const result = css({
        backgroundColor: cssVar($.layer),
        color: cssVar($.text),

        [$.layer]: cssVar($._layerIdle),
        [$.text]: `lch(from ${cssVar($.layer)} ${textL} 0 0 / 100%)`,
        [$.ring]: ring(cssVar($.layer)),
        [$.border]: border(cssVar($.layer)),
        [$.shadow]: shadow(cssVar($.layer)),

        [$._layerAppearance]: `lch(from ${cssVar($.layer)} ${textL} 0 0 / 100%)`,
        [$._layerL]: `lch(from ${cssVar($.layer)} round(l, ${100 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,

        [`@apply border-(color:${$.border}) ring-(color:${$.ring}) shadow-(color:${$.shadow})`]:
          {},
      });

      Object.assign(result, {
        [$._borderAlpha]: borderAlpha,
        [$._ringAlpha]: ringAlpha,

        "input&": {
          [$._borderAlpha]: `calc(${borderAlpha} * 2.1)`,
          [$._ringAlpha]: `calc(${ringAlpha} * 2.1)`,
          "&::placeholder": {
            "@apply ak-text-opacity": {},
          },
        },
      });

      if (token) {
        Object.assign(result, {
          [$.layerBase]: `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`,
          [$._layerIdle]: cssVar($.layerBase),
        });
      } else {
        Object.assign(result, {
          [$._layerIdle]: `oklch(from ${baseColor} ${l} ${c} ${h})`,
        });
      }

      Object.assign(
        result,
        withParent("layer-level", !!token, ({ opposite, provide, inherit }) => {
          const result = {
            // Provide the current layer level for children
            [provide($._layerLevel)]: token
              ? // Reset level for children when using a color token
                "0"
              : // If the color token is not provided, continue the level stack
                `calc(${inherit($._layerLevel)} + ${highlightLevel || level})`,
            // Provide the current layer level for itself
            [$._layerLevel]: `calc(${inherit($._layerLevel)} + ${level})`,
          };

          if (token) {
            // TODO: Comment (parent with level, then child with reset + pop)
            Object.assign(result, {
              [opposite($._layerLevel)]: "0",
            });
          }

          return result;
        }),
      );

      Object.assign(
        result,
        withParent("layer-parent", false, ({ provide, inherit }) => {
          const result = {
            [provide($._layerParent)]: cssVar($.layer),
            [$.layerParent]: inherit($._layerParent),
            [$.shadow]: shadow(cssVar($.layerParent)),
            [$.border]: border(
              `color-mix(in oklab, ${cssVar($.layer)}, ${cssVar($.layerParent)})`,
            ),
            [$.ring]: ring(
              `color-mix(in oklab, ${cssVar($.layer)}, ${cssVar($.layerParent)})`,
            ),
          };
          if (level.startsWith("-") && !token) {
            const { l, c, h } = getLayerOkLCH(level);
            Object.assign(result, {
              [$._layerIdle]: `oklch(from ${cssVar($.layerParent)} ${l} ${c} ${h})`,
            });
          }
          return result;
        }),
      );

      return result;
    }

    matchUtilities(
      {
        "ak-layer-down": (value) => {
          const { token, level } = parseColorLevel(value);
          return getLayerCss(token, `-${level}`);
        },
        "ak-layer": (value) => {
          const { token, level } = parseColorLevel(value);
          return getLayerCss(token, level);
        },
      },
      { values: getLayerValues() },
    );

    addUtilities({
      ".ak-layer-current": getLayerCss(null, "0"),
    });

    matchUtilities(
      {
        "ak-layer-mix": (value, { modifier }) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, cssVar($.layerParent));
          const { l, c, h } = getLayerOkLCH(level, "0");
          const color = `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
          const percentage = toPercent(modifier, "50%");
          return getLayerCss(
            `color-mix(in oklab, ${cssVar($.layerParent)}, ${color} ${percentage})`,
            level,
          );
        },
      },
      { values: getLayerValues(), modifiers: "any" },
    );

    /**
     * @param {string} level
     * @param {string | number} threshold
     * @param {string | number} contrast
     */
    function getLayerInvertCss(level, threshold, contrast) {
      // light: -1, dark: 1
      const mode = `clamp(-1, (calc(${threshold} * 10) - l * 10) * infinity - 1, 1)`;
      const relativeLevel = `calc(${level} * ${mode})`;
      const l = `calc(l + 0.1 * ${relativeLevel} * ${contrast})`;
      return {
        ...getLayerCss(null, "0", relativeLevel),
        [$.layer]: `oklch(from ${cssVar($._layerIdle)} ${l} c h)`,
      };
    }

    /** @param {string} level */
    function getLayerFeatureCss(level) {
      const threshold = t("layer", "feature-threshold", "0.92");
      // const contrast = getContrast("feature");
      return getLayerInvertCss(level, threshold, 1);
    }

    /** @param {string} level */
    function getLayerPopCss(level) {
      const threshold = t("layer", "pop-threshold", "0.5");
      // const contrast = getContrast("pop");
      return getLayerInvertCss(level, threshold, 1);
    }

    matchUtilities(
      {
        "ak-layer-pop": getLayerPopCss,
        "ak-layer-feature": getLayerFeatureCss,
      },
      { values: getLayerValues({ colors: false }) },
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
        withParent("frame", force, ({ provide, inherit }) => {
          const parentRadius = inherit($._frameRadius, radius);
          const parentPadding = inherit($._framePadding, "0px");
          const parentBorder = inherit($._frameBorder, "0px");
          const minRadius = `min(0.25rem, ${radius})`;
          const nestedRadius = `(${parentRadius} - calc(${parentPadding} + ${parentBorder}))`;

          const computedRadius = force
            ? radius
            : `max(${minRadius}, max(${nestedRadius}, 0px))`;

          return {
            [provide($._framePadding)]: padding,
            [provide($._frameRadius)]: computedRadius,
            [provide($._frameBorder)]: cssVar($._frameBorder),
            borderRadius: computedRadius,

            [$._frameCappedPadding]: capPadding,
            [`@container style(${$._frameCappedPadding}: ${cap})`]: {
              [provide($._frameRadius)]: radius,
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
            withParent("frame", false, ({ provide, inherit }) => {
              const parentPadding = inherit($._framePadding, "0px");
              const parentRadius = inherit($._frameRadius, radius);
              const parentBorder = inherit($._frameBorder, "0px");
              const margin = `calc(${parentPadding} * -1)`;
              const computedPadding = extra.modifier
                ? padding
                : inherit($._framePadding, padding);
              const computedRadius = `calc(${parentRadius} - ${parentBorder})`;
              return css({
                [provide($._framePadding)]: computedPadding,
                [provide($._frameRadius)]: computedRadius,
                [provide($._frameBorder)]: cssVar($._frameBorder),
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
            [$._frameBorder]: value,
            [`@apply border-(length:${$._frameBorder})`]: {},
          });
        },
      },
      { values: theme("borderWidth") },
    );

    matchUtilities(
      {
        "ak-text": (value) => {
          const { token, level } = parseColorLevel(value);
          const contrast = getContrast();
          const { l, c, h } = getLayerOkLCH(cssVar($._textLevel), "0");
          const tokenColor = tv("color", token, cssVar($.layer));
          const baseColor =
            level === "0"
              ? tokenColor
              : `oklch(from ${tokenColor} ${l} ${c} ${h} / 100%)`;

          const result = {
            color: cssVar($.text),
            [$._textLevel]: level,
          };

          return Object.assign(
            result,
            withLayerLightness((l) => {
              if (l === 50) return;
              // TODO: Refactor names.
              const lFactor = l < 50 ? 1 : -1;
              const l2 = `calc(${l} + ${53 * lFactor} + (20 * ${contrast} * ${lFactor}))`;
              const lString = l < 50 ? `max(l, ${l2})` : `min(l, ${l2})`;
              const c = l > 50 ? `min(c, 92)` : `c`;
              return {
                [$.text]: `lch(from ${baseColor} ${lString} ${c} h / 100%)`,
                [$._textLevel]: l > 50 ? `-${level}` : level,
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
            color: `lch(from ${cssVar($.layer)} ${textL} 0 0 / ${alpha})`,
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
     * @param {string} [_token]
     */
    function getContrast(_token = "DEFAULT") {
      const contrastBase = t("contrast", "DEFAULT", "0");
      return `max(0, ${contrastBase})`;
    }

    /**
     * @param {string} [light]
     * @param {string} [dark]
     */
    function oklchLightDark(light, dark) {
      const textL = `calc((0.5 - l) * infinity)`;
      const isBgDark = `clamp(0, ${textL}, 1)`;
      const isBgLight = `clamp(0, 1 - ${textL}, 1)`;
      return `((${light} * ${isBgLight}) + (${dark} * ${isBgDark}))`;
    }

    /**
     * @param {string} [light]
     * @param {string} [dark]
     */
    function lchLightDark(light, dark) {
      const textL = `calc((49.44 - l) * infinity)`;
      const isBgDark = `clamp(0, ${textL}, 1)`;
      const isBgLight = `clamp(0, 1 - ${textL}, 1)`;
      return `((${light} * ${isBgLight}) + (${dark} * ${isBgDark}))`;
    }

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
        // Add non bare level values
        for (let i = 0; i <= maxNonBareLevels; i++) {
          values[i] = `${i}`;
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
      const matches = value.match(/[\.\d]+$/);
      if (!matches) {
        return { token: value, level: "0" };
      }
      const [level] = matches;
      if (!level || theme("colors")[value] || colorString.get(value)) {
        return { token: value, level: "0" };
      }
      return { token: value.slice(0, -level.length - 1), level };
    }

    /**
     * Returns the layer's computed okLCH values based on the provided level.
     * @param {string} level
     */
    function getLayerOkLCH(level, contrast = getContrast()) {
      const minL = 0.11;
      const lMultiplier = 0.05;
      const cMultiplier = 0.002;

      let l = `max(0, max(l, ${minL}) + ${level} * ${lMultiplier})`;
      const c = `max(0, c - ${level} * ${cMultiplier})`;
      const h = "h";

      if (`${contrast}` !== "0") {
        const isDown = level.startsWith("-");
        const layerContrast = `min(1, calc(-1 * ${contrast}))`;
        const negativeContrast = `min(0, ${layerContrast})`;
        l = `calc(${l} + ${lMultiplier} * ${negativeContrast} * ${oklchLightDark(isDown ? "-1" : "-5", "1")})`;
        // const positiveContrast = `max(0, ${layerContrast})`;
        // c = `calc(${c} - ${cMultiplier} * ${positiveContrast})`;
      }
      // const contrastLevel = `calc(${level} + ${negativeContrast} * ${oklchLightDark(isDown ? "-1" : "-5", "1")})`;
      // const l = `max(0, calc(max(l, ${minL}) + ${contrastLevel} * (${lMultiplier} + ${lMultiplier} * ${positiveContrast})))`;
      // const c = `max(0, calc(c - ${level} * (${cMultiplier} + ${cMultiplier} * ${positiveContrast})))`;
      // const h = "h";
      return { l, c, h };
    }
  },
);

// =============================================================================
// ===== UTILS =================================================================
// =============================================================================

/**
 * @param {(typeof $)[keyof typeof $]} name
 * @param {string} [defaultValue]
 */
function cssVar(name, defaultValue) {
  return `var(${name}${defaultValue ? `, ${defaultValue}` : ""})`;
}

/**
 * @param {number} [value]
 */
function isInlineThemeReference(value) {
  if (!value) return false;
  if (value & (1 << 0)) return true;
  if (value & (1 << 1)) return true;
  return false;
}

/**
 * Return the absolute value in CSS.
 * @param {string} value
 */
// function abs(value) {
//   return `max(${value}, ${value} * -1)`;
// }

/**
 * Parses a string value into a percentage.
 * @param {string | null | undefined} value
 * @param {string} [defaultValue]
 */
function toPercent(value, defaultValue = "100%") {
  if (!value) return defaultValue;
  return /^\d+$/.test(value) ? `${value}%` : value;
}

/**
 * Just to please TypeScript.
 * @typedef {{[key: string]: string | string[] | CssInJs | CssInJs[]}} CssInJs
 * @param {CssInJs} [object]
 */
function css(object = {}) {
  return object;
}

/**
 * @typedef {{ value: string, kind: string, fraction: string | null }}
 * BareValueFnParams
 * @param {(params: BareValueFnParams) => string | undefined} fn
 * @returns {Record<string, string>}
 */
function bareValue(fn) {
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
function withLayerLightness(fn) {
  const levels = Array.from(
    { length: LIGHTNESS_LEVELS + 1 },
    (_, i) => (i / LIGHTNESS_LEVELS) * 100,
  );
  return levels.reduce((acc, l) => {
    l = Math.round(l);
    const query = `@container style(${$._layerL}: lch(${l} 0 0))`;
    const result = fn(l);
    if (!result) return acc;
    Object.assign(acc, { [query]: result });
    return acc;
  }, css());
}

/**
 * Returns CSS that enables a child to inherit CSS variables from its parent.
 * @typedef {"even" | "odd"} Parity
 * @typedef {(prop: (typeof $)[keyof typeof $]) => string} Provide
 * @typedef {(prop: (typeof $)[keyof typeof $], defaultValue?: string) =>
 * string} Inherit
 * @typedef {{ opposite: Provide, provide: Provide, inherit: Inherit }}
 * WithParentFnParams
 * @typedef {(params: WithParentFnParams) => CssInJs} WithParentFn
 * @param {string} id
 * @param {boolean} reset
 * @param {WithParentFn} fn
 */
function withParent(id, reset, fn) {
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

export default AriakitTailwind;
