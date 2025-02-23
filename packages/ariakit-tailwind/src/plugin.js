import colorString from "color-string";
import plugin from "tailwindcss/plugin";
import {
  LIGHTNESS_LEVELS,
  SCHEME_THRESHOLD_L,
  SCHEME_THRESHOLD_OKL,
  TEXT_CONTRAST_L,
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
  withParentL,
  withParentOkL,
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
     * @param {{ additionalKeys?: string[], colors?: boolean, downLevels?:
     * boolean, levels?: boolean, DEFAULT?: string | null }} [options]
     */
    function getLayerValues({
      additionalKeys = [],
      colors = true,
      levels = true,
      downLevels = levels,
      DEFAULT = levels ? "1" : undefined,
    } = {}) {
      const maxNonBareLevels = 10;
      /** @type {Record<string, string>} */
      const values = {};
      if (DEFAULT) {
        values.DEFAULT = DEFAULT;
      }
      if (levels) {
        if (downLevels) {
          values.down = "down-1";
        }
        // Add non bare level values
        for (let i = 0; i <= maxNonBareLevels; i++) {
          values[i] = `${i}`;
          if (downLevels) {
            values[`down-${i}`] = `down-${i}`;
          }
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
            if (downLevels) {
              values[`${key}-down`] = `${key}-down-1`;
              values[`${key}-down-${i}`] = `${key}-down-${i}`;
            }
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
     * Returns the layer's computed LCH values based on the provided level.
     * @param {string} level
     */
    // @ts-expect-error
    function getLayerLCH(level) {
      const minL = `min(2, ${level})`;
      const lMultiplier = 5;
      const cMultiplier = 0.00055;
      const l = `max(0, max(l, ${minL}) + ${level} * ${lMultiplier})`;
      const c = `max(0, c - ${level} * ${cMultiplier})`;
      const h = "h";
      return { l, c, h };
    }

    /**
     * @param {string} color
     * @param {boolean} isDown
     * @param {"light" | "dark"} [scheme]
     * @param {string} [contrast]
     */
    function getLayerContrastColor(
      color,
      isDown,
      scheme,
      contrast = getContrast(),
    ) {
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
      return css(getEdgeCss(prop(vars.layer), undefined, undefined, true), {
        backgroundColor: prop(vars.layer),
        borderColor: prop(vars.border, prop(vars.layerBorder)),
        color: prop(vars.text),
        "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
        "--tw-shadow-color": prop(vars.shadow),
      });
    }

    /**
     * @param {string | null | undefined} [token]
     * @param {string} [level]
     */
    function getLayerCss(token, level = "0") {
      const baseColor = tv("color", token);
      const { l, c, h } = getLayerOkLCH(level);
      const isDown = level.startsWith("-") && !token;
      const shadowAlpha = `calc(10% + (1 - l) * 2 * 25%)`;

      /** @param {string} color */
      const shadow = (color) => `oklch(from ${color} 0 0 0 / ${shadowAlpha})`;

      const result = css(getCurrentLayerCss(), {
        [vars.layer]: prop(vars._layerIdle),
        [vars.text]: textColor(prop(vars.layer)),
        [vars.shadow]: shadow(prop(vars.layer)),

        [vars._layerAppearance]: textColor(prop(vars.layer)),
        [vars._layerL]: `lch(from ${prop(vars.layer)} round(l, ${100 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
        [vars._layerOkL]: `oklch(from ${prop(vars.layer)} round(l, ${1 / LIGHTNESS_LEVELS}) 0 0 / 100%)`,
      });

      if (token) {
        const colorWithLevel =
          level === "0"
            ? baseColor
            : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
        const colorWithSafeL = `oklch(from ${colorWithLevel} ${prop(vars._safeOkL)} c h / 100%)`;
        const colorWithContrast = getLayerContrastColor(colorWithSafeL, isDown);
        Object.assign(result, {
          [vars._layerIdle]: colorWithContrast,
          [vars._layerBase]: colorWithContrast,
        });
      } else {
        const color = prop(vars._layerBase, prop(vars.layerParent));
        const colorWithLevel =
          level === "0" ? color : `oklch(from ${color} ${l} ${c} ${h} / 100%)`;
        const colorWithSafeL = `oklch(from ${colorWithLevel} ${prop(vars._safeOkL)} c h / 100%)`;
        const colorWithContrast = getLayerContrastColor(colorWithSafeL, isDown);
        Object.assign(result, {
          [vars._layerIdle]: colorWithContrast,
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
            getEdgeCss(
              colorMix(prop(vars.layer), layerParent),
              undefined,
              null,
              true,
            ),
          );
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

    matchUtilities(
      {
        "ak-layer-contrast": (value) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv("color", token, prop(vars.layerParent));
          const { l, c, h } = getLayerOkLCH(level);

          return Object.assign(
            getLayerCss(token, level),
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
              const colorWithContrast = getLayerContrastColor(
                colorWithContrastL,
                false,
                isDark ? "light" : "dark",
              );
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
          const baseColor = tv("color", token, prop(vars.layerParent));
          const { l, c, h } = getLayerOkLCH(level);
          const color = `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
          const percentage = toPercent(modifier, "50%");
          return getLayerCss(
            `color-mix(in oklab, ${prop(vars.layerParent)}, ${color} ${percentage})`,
          );
        },
      },
      { values: getLayerValues(), modifiers: "any" },
    );

    /**
     * @param {string} level
     */
    function getLayerPopOkL(level) {
      const l = `max(l, min(0.13, ${level}))`;
      const la = prop(vars._safeOkLA);
      const lb = prop(vars._safeOkLB);
      const lMultiplier = `(0.06 + c * 0.3)`;
      const popL = `(
        (1 - 2 * clamp(0, (l - (${la} - ${lMultiplier})) * 1e6, 1)) * clamp(0, (${la} - l) * 1e6 + 1, 1) +
        (1 - 2 * clamp(0, (l - (${lb} + ${lMultiplier})) * 1e6, 1)) * clamp(0, (l - ${lb}) * 1e6 + 1, 1)
      )`;
      return `calc(${l} + ${lMultiplier} * ${level} * ${popL})`;
    }

    matchUtilities(
      {
        "ak-layer-pop": (value) => {
          const { token, level } = parseColorLevel(value);
          return {
            ...getLayerCss(token),
            [vars.layer]: `oklch(from ${prop(vars._layerIdle)} ${getLayerPopOkL(level)} c h)`,
          };
        },
        "ak-layer-pop-vivid": (value) => {
          const { token, level } = parseColorLevel(value);
          const c = `clamp(0, c + 0.1 * ${level}, 0.4)`;
          const colorBase = `oklch(from ${prop(vars._layerIdle)} l ${c} h)`;
          const colorWithSafeL = `oklch(from ${colorBase} ${prop(vars._safeOkL)} c h)`;
          return {
            ...getLayerCss(token),
            [vars.layer]: `oklch(from ${colorWithSafeL} ${getLayerPopOkL(level)} c h)`,
          };
        },
        "ak-layer-feature": (level) => {
          const result = getLayerCss(null, level);
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
     * @param {string} color
     * @param {string} [level]
     * @param {string | null} [modifier]
     * @param {boolean} [soft]
     */
    function getEdgeCss(color, level = "0", modifier = null, soft = false) {
      const contrast = getContrast();
      const alphaModifier = modifier || 5;
      const lLight = `min(l - 0.1, ${level} * 0.15 - ${contrast} * 0.15)`;
      const lDark = `max(max(l, 0.13) + 0.13, 1 - ${level} * 0.1 + ${contrast} * 0.1)`;
      const c = `calc(c * 2)`;
      const alphaBase = `((${alphaModifier} + 5) * 1%)`;
      const alphaLAdd = oklchLightDark("(1 - l) * 0.1%", "l * 0.1%");
      const alphaCAdd = `(c * 50%)`;
      const contrastAdd = `(12% * ${contrast})`;
      const alpha = `calc(${alphaBase} + ${alphaLAdd} + ${alphaCAdd} + ${contrastAdd})`;
      const finalColor = `oklch(from ${color} var(--l) ${c} h / ${alpha})`;
      return {
        "--tw-ring-color": prop(vars.ring, prop(vars.layerRing)),
        // TODO: Rename this variable
        "--l": lLight,
        borderColor: prop(vars.border, prop(vars.layerBorder)),
        [soft ? vars.layerRing : vars.ring]: finalColor,
        [soft ? vars.layerBorder : vars.border]: finalColor,
        [IN_DARK]: {
          "--l": lDark,
        },
      };
    }

    matchUtilities(
      {
        "ak-edge": (value, { modifier }) => {
          const { token, level } = parseColorLevel(value);
          const baseColor = tv(
            "color",
            value === "current" ? null : token,
            prop(vars.layer),
          );
          return getEdgeCss(baseColor, level, modifier);
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
              const contrastL = `(${Math.max(parentL, 0.15)} + ${t} * 0.3)`;
              const contrastLString = isDark
                ? `max(l, ${contrastL})`
                : `min(l, ${contrastL})`;
              const colorWithLevel =
                level === "0"
                  ? baseColor
                  : `oklch(from ${baseColor} ${l} ${c} ${h} / 100%)`;
              const colorWithContrastL = `oklch(from ${colorWithLevel} ${contrastLString} c h / 100%)`;
              const colorWithContrast = getLayerContrastColor(
                colorWithContrastL,
                false,
                isDark ? "light" : "dark",
              );
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
              const colorWithContrast = getLayerContrastColor(
                colorWithContrastL,
                false,
                isDark ? "light" : "dark",
              );
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
        "ak-text": (value, { modifier }) => {
          if (value === "current") {
            const percentage = toPercent(modifier, "0%");
            const baseAlpha = lchLightDark(53.6, 53.6);
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
              if (parentL >= threshold - step && parentL <= threshold + step)
                return;
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
