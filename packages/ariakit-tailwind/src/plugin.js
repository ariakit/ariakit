import colorString from "color-string";
import plugin from "tailwindcss/plugin";

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
function abs(value) {
  return `max(${value}, ${value} * -1)`;
}

/**
 * Just to please TypeScript.
 * @typedef {{[key: string]: string | string[] | CssInJs | CssInJs[]}} CssInJs
 * @param {CssInJs} object
 */
function css(object) {
  return object;
}

/**
 * @typedef {"even" | "odd"} Parity
 * @typedef {(prop: string) => string} Provide
 * @typedef {(prop: string, defaultValue?: string) => string} Inherit
 * @typedef {{ provide: Provide, inherit: Inherit }} FromParentFnParams
 * @typedef {(params: FromParentFnParams) => CssInJs} FromParentFn
 * @param {string} namespace
 * @param {boolean} reset
 * @param {FromParentFn} fn
 */
function fromParent(namespace, reset, fn) {
  const getParityKey = () => `--_${namespace}-parity`;

  /** @param {Parity} parity */
  const getNextParity = (parity) =>
    // TODO: Check if this !reset is necessary
    parity === "even" && !reset ? "odd" : "even";

  /**
   * @param {Parity} parity
   * @returns {Inherit}
   */
  const createInherit = (parity) => (prop, defaultValue) => {
    return `var(${prop}-${parity}${defaultValue ? `, ${defaultValue}` : ""})`;
  };

  /**
   * @param {Parity} parity
   * @returns {Provide}
   */
  const createProvide = (parity) => (prop) => {
    return `${prop}-${getNextParity(parity)}`;
  };

  /**
   * @param {Parity} [parity]
   * @returns {CssInJs}
   */
  const getCss = (parity = "even") => ({
    [getParityKey()]: getNextParity(parity),
    ...fn({
      provide: createProvide(parity),
      inherit: createInherit(parity),
    }),
  });

  if (reset) {
    return getCss();
  }

  /** @type {CssInJs} */
  const css = {};

  for (const parity of /** @type {Parity[]} */ (["even", "odd"])) {
    css[`@container style(${getParityKey()}: ${parity})`] = getCss(parity);
  }

  css[`@container not style(${getParityKey()})`] = getCss();

  return css;
}

/** @type {ReturnType<typeof plugin>} */
const AriakitTailwind = plugin(
  ({ addBase, addVariant, addUtilities, matchUtilities, theme }) => {
    addBase({
      "@property --_ak-layer-appearance": {
        syntax: "'<color>'",
        inherits: "true",
        initialValue: "lch(0 0 0)",
      },
      "@property --_ak-layer-l": {
        syntax: "'<color>'",
        inherits: "true",
        initialValue: "oklch(1 0 0)",
      },
    });

    const lLength = 20;
    const inDark = "@container style(--_ak-layer-appearance: lch(100 0 0))";
    const inLight = "@container style(--_ak-layer-appearance: lch(0 0 0))";

    addVariant("ak-in-dark", inDark);
    addVariant("ak-in-light", inLight);

    /**
     * Returns either the inline value or the CSS variable reference.
     * @param {string} namespace
     * @param {string} token
     * @param {string} [defaultValue]
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

    function getLayerValues(onlyLevels = false) {
      const { __CSS_VALUES__, ...colors } = theme("colors");
      const keys = Object.keys(colors);
      const maxNonBareLevels = 10;
      /** @type {Record<string, string>} */
      const values = {
        DEFAULT: "1",
        // @ts-expect-error
        __BARE_VALUE__: ({ value }) => {
          const { token } = parseColorLevel(value);
          if (!token) return value;
          if (!theme("colors")[token]) return;
          return value;
        },
      };
      // Add non bare level values
      for (let i = 0; i <= maxNonBareLevels; i++) {
        values[i] = `${i}`;
      }
      // Add non bare color and level values
      if (!onlyLevels) {
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
      }
      return values;
    }

    /** @param {string} [value] */
    function parseColorLevel(value) {
      if (!value) {
        return { token: undefined, level: "1" };
      }
      const matches = value.match(/\d+$/);
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
     * @param {string} level
     * @param {string} computedLevel
     */
    function getLayerOkLCH(level, computedLevel) {
      const isDown = level.startsWith("-");

      const contrastBase = t("layer", "contrast", "8");
      const contrastUp = t("layer", "contrast-up", contrastBase);
      const contrastDown = t("layer", "contrast-down", contrastBase);
      const contrast = isDown ? contrastDown : contrastUp;
      const l = `calc(max(l, 0.11) + ${computedLevel} * 0.01 * ${contrast})`;
      const c = `calc(c - ${abs(computedLevel)} * 0.0004 * ${contrast})`;
      const h = "h";
      return { l, c, h };
    }

    /**
     * @param {string | null | undefined} token
     * @param {string} level
     * @param {string} [highlightLevel]
     */
    function getLayerCss(token, level, highlightLevel) {
      const baseColor = token
        ? theme("colors")[token]
          ? t("color", token)
          : token
        : "var(--ak-layer-base)";

      const { l, c, h } = getLayerOkLCH(
        level,
        // If the color token is provided, we use the level as is, otherwise we
        // stack the levels.
        token ? level : "var(--_layer-level)",
      );

      const isDown = level.startsWith("-");

      const textL = `calc((49.44 - l) * infinity)`;
      const isBgDark = `clamp(0, ${textL}, 1)`;
      const isBgLight = `clamp(0, 1 - ${textL}, 1)`;

      const borderAlphaBase = `calc(15% * ${isBgDark} + 15% * ${isBgLight})`;
      const borderAlphaAdd = `calc(l * 0.1% * ${isBgDark} + (100 - l) * 0.1% * ${isBgLight})`;
      const borderAlpha = `calc(${borderAlphaBase} + ${borderAlphaAdd})`;

      const shadowAlpha = `calc(25% + (1 - l) * 25%)`;

      return css({
        backgroundColor: "var(--ak-layer)",
        color: "var(--ak-text)",
        "@apply border-(--ak-border) ring-(--ak-border) shadow-(color:--ak-shadow)":
          {},

        "--ak-shadow": `oklch(from var(--ak-layer) 0 0 0 / ${shadowAlpha})`,
        "--ak-border": `lch(from var(--ak-layer) ${textL} c h / ${borderAlpha})`,
        "--ak-text": `lch(from var(--ak-layer) ${textL} 0 0 / 100%)`,
        "--ak-layer": `var(--_layer-original)`,
        ...(token
          ? {
              "--ak-layer-base":
                level === "0"
                  ? baseColor
                  : `oklch(from ${baseColor} ${l} ${c} ${h})`,
              "--_layer-original": `var(--ak-layer-base)`,
            }
          : {
              "--_layer-original": `oklch(from ${baseColor} ${l} ${c} ${h})`,
            }),

        // Properties
        "--_ak-layer-appearance": `lch(from var(--ak-layer) ${textL} 0 0 / 100%)`,
        "--_ak-layer-l": `lch(from var(--ak-layer) round(l, ${100 / lLength}) 0 0 / 100%)`,

        // TODO: ak-layer-constrast-*
        // ...Array.from(
        //   { length: lLength + 1 },
        //   (_, i) => (i / lLength) * 100,
        // ).reduce((acc, l) => {
        //   l = Math.round(l);
        //   const key = `@container style(--_ak-layer-l: lch(${l} 0 0))`;
        //   if (l === 50) return acc;
        //   const l2 = l < 50 ? l + 10 : l - 10;
        //   const lString = l < 50 ? `max(l, ${l2})` : `min(l, ${l2})`;
        //   const c = l > 50 ? `min(c, 92)` : `c`;
        //   acc[key] = {
        //     "--_layer-original": `lch(from ${baseColor} ${lString} ${c} h / 100%)`,
        //   };
        //   return acc;
        // }, css({})),

        ...fromParent("layer", !!token, ({ provide, inherit }) => ({
          // Provide the current layer level for children
          [provide("--_layer-level")]: token
            ? // Reset level for children when using a color token
              "0"
            : // If the color token is not provided, continue the level stack
              `calc(${inherit("--_layer-level")} + ${highlightLevel || level})`,
          // Provide the current layer level for itself
          "--_layer-level": `calc(${inherit("--_layer-level")} + ${level})`,
        })),

        ...fromParent("layer-parent", false, ({ provide, inherit }) => ({
          [provide("--_layer-parent")]: "var(--ak-layer)",
          "--ak-layer-parent": inherit("--_layer-parent"),

          ...(!isDown && {
            "--ak-border": `lch(from ${inherit("--_layer-parent")} ${textL} c h / ${borderAlpha})`,
            "--ak-shadow": `oklch(from ${inherit("--_layer-parent")} 0 0 0 / ${shadowAlpha})`,
          }),
        })),
      });
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
        "ak-text": (value) => {
          const { token } = parseColorLevel(value);
          const baseColor = token
            ? theme("colors")[token]
              ? t("color", token)
              : token
            : "var(--ak-layer)";

          // const colored = baseColor === "var(--ak-layer)" ? 0 : -1;
          // const textL = `calc((49.44 - l) * infinity)`;
          // const isBgDark = `clamp(0, ${textL}, 1)`;
          // const isBgLight = `clamp(0, 1 - ${textL}, 1)`;
          // const baseAlpha = `((45.7 * ${isBgDark}) + (53.6 * ${isBgLight}))`;
          // const lAdd = `((l * 1.08 * ${isBgDark}) + ((100 - l) * 0.85 * ${isBgLight}))`;
          // const cAdd = `(c * 0.036)`;
          // const minAlpha = `calc(${baseAlpha} + ${lAdd} + ${cAdd})`;
          // const alpha = `clamp(${minAlpha} * 1%, 0%, 100%)`;

          return css({
            ...Array.from(
              { length: lLength + 1 },
              (_, i) => (i / lLength) * 100,
            ).reduce((acc, l) => {
              l = Math.round(l);
              const key = `@container style(--_ak-layer-l: lch(${l} 0 0))`;
              if (l === 50) return acc;
              const l2 = l < 50 ? l + 53 : l - 53;
              const lString = l < 50 ? `max(l, ${l2})` : `min(l, ${l2})`;
              const c = l > 50 ? `min(c, 92)` : `c`;
              acc[key] = {
                "--ak-text": `lch(from ${baseColor} ${lString} ${c} h / 100%)`,
                color: `var(--ak-text)`,
              };
              return acc;
            }, css({})),
          });
        },
      },
      {
        values: { ...getLayerValues(), DEFAULT: "0" },
      },
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
      const l = `calc(l + ${relativeLevel} * 0.01 * ${contrast})`;
      return {
        ...getLayerCss(null, "0", relativeLevel),
        "--ak-layer": `oklch(from var(--_layer-original) ${l} c h)`,
      };
    }

    /** @param {string} level */
    function getLayerHighlightCss(level) {
      const threshold = t("layer", "highlight-threshold", "0.92");
      const contrastBase = t("layer", "highlight-contrast", "8");
      const contrastUp = t("layer", "highlight-contrast-up", contrastBase);
      const contrastDown = t("layer", "highlight-contrast-down", contrastBase);
      const contrast = level.startsWith("-") ? contrastDown : contrastUp;
      return getLayerInvertCss(level, threshold, contrast);
    }

    /** @param {string} level */
    function getLayerHoverCss(level) {
      const threshold = t("layer", "hover-threshold", "0.5");
      const contrastBase = t("layer", "hover-contrast", "8");
      const contrastUp = t("layer", "hover-contrast-up", contrastBase);
      const contrastDown = t("layer", "hover-contrast-down", contrastBase);
      const contrast = level.startsWith("-") ? contrastDown : contrastUp;
      return getLayerInvertCss(level, threshold, contrast);
    }

    matchUtilities(
      {
        "ak-layer-down-hover": (value) => getLayerHoverCss(`-${value}`),
        "ak-layer-hover": getLayerHoverCss,
        "ak-layer-down-highlight": (value) => getLayerHighlightCss(`-${value}`),
        "ak-layer-highlight": getLayerHighlightCss,
      },
      { values: getLayerValues(true) },
    );

    matchUtilities(
      {
        "ak-layer-mix": (value, { modifier }) => {
          const { token, level } = parseColorLevel(value);
          const parent = "var(--ak-layer-parent)";
          const baseColor = token
            ? theme("colors")[token]
              ? t("color", token)
              : token
            : parent;
          const { l, c, h } = getLayerOkLCH(level, level);
          const color = `oklch(from ${baseColor} ${l} ${c} ${h})`;
          const percentage = modifier
            ? /^\d+$/.test(modifier)
              ? `${modifier}%`
              : modifier
            : "50%";
          return getLayerCss(
            `color-mix(in oklab, ${parent}, ${color} ${percentage})`,
            level,
          );
        },
      },
      {
        values: getLayerValues(),
        modifiers: "any",
      },
    );

    /**
     * @param {string} radiusKey
     * @param {string | null} [modifier]
     * @param {boolean} [force]
     */
    function getFrameCss(radiusKey, modifier, force = false) {
      const radius = t("radius", radiusKey);
      const padding =
        modifier ||
        (radiusKey === "DEFAULT"
          ? "0px"
          : theme("spacing")[radiusKey]
            ? t("spacing", radiusKey)
            : "0px");
      return css({
        padding,
        borderRadius: radius,
        ...fromParent("frame", force, ({ provide, inherit }) => ({
          [provide("--_padding")]: padding,
          [provide("--_radius")]: radius,
          borderRadius: force
            ? radius
            : `calc(${inherit("--_radius", radius)} - ${inherit("--_padding", "0px")})`,
        })),
      });
    }

    matchUtilities(
      {
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
  },
);

export default AriakitTailwind;
