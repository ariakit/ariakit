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
 * @typedef {{[key: string]: string | string[] | CssInJs | CssInJs[]}} CssInJs
 * @param {CssInJs} object
 */
function css(object) {
  return object;
}

/**
 * @typedef {"even" | "odd"} Parity
 * @typedef {(prop: string) => string} Key
 * @typedef {(prop: string, defaultValue?: string) => string} Inherit
 * @typedef {(prop: string, value?: string) => string} Provide
 * @typedef {{ key: Key, inherit: Inherit }} FromParentFnParams
 * @typedef {(params: FromParentFnParams) => CssInJs} FromParentFn
 * @param {string} namespace
 * @param {boolean} reset
 * @param {FromParentFn} fn
 */
function fromParent(namespace, reset, fn) {
  const getParityKey = () => `--_${namespace}-parity`;

  /** @param {Parity} parity */
  const getParity = (parity) => (parity === "even" && !reset ? "odd" : "even");

  /**
   * @param {Parity} parity
   * @returns {Inherit}
   */
  const createInherit = (parity) => (prop, defaultValue) => {
    return `var(${prop}-${parity}${defaultValue ? `, ${defaultValue}` : ""})`;
  };

  /**
   * @param {Parity} parity
   * @returns {Key}
   */
  const createKey = (parity) => (prop) => {
    return `${prop}-${getParity(parity)}`;
  };

  /**
   * @param {Parity} parity
   * @returns {CssInJs}
   */
  const getCss = (parity) => ({
    [getParityKey()]: getParity(parity),
    ...fn({
      key: createKey(parity),
      inherit: createInherit(parity),
    }),
  });

  if (reset) {
    return getCss("even");
  }

  /** @type {CssInJs} */
  const css = {};

  for (const parity of /** @type {Parity[]} */ (["even", "odd"])) {
    css[`@container style(${getParityKey()}: ${parity})`] = getCss(parity);
  }

  return css;
}

/** @type {ReturnType<typeof plugin>} */
const AriakitTailwind = plugin(({ matchUtilities, theme }) => {
  /**
   * @param {string} namespace
   * @param {string} token
   * @param {string} [defaultValue]
   */
  function t(namespace, token, defaultValue) {
    const options = theme(namespace)?.__CSS_VALUES__?.[token];
    const key = `--${namespace}-${token}`;
    if (isInlineThemeReference(options)) {
      return theme(key, defaultValue);
    }
    return `var(${key})`;
  }

  /** @param {string} [value] */
  function parseLayerValue(value) {
    if (!value) {
      return { token: undefined, level: "1" };
    }
    const matches = value.match(/\d+$/);
    if (!matches) {
      return { token: value, level: "0" };
    }
    const [level] = matches;
    if (!level || theme("colors")[value]) {
      return { token: value, level: "0" };
    }
    return { token: value.slice(0, -level.length - 1), level };
  }

  matchUtilities(
    {
      "ak-layer": (value) => {
        const { token, level } = parseLayerValue(value);
        const result = css({
          "--_layer-level": level,
          "--_layer-bg-l": `calc(max(l, 0.11) + var(--_layer-level) * 0.01 * var(--layer-contrast))`,
          "--_layer-bg-c": `calc(c - max(0, var(--_layer-level)) * 0.0004 * var(--layer-contrast))`,

          backgroundColor: `var(--ak-layer)`,

          ...(token
            ? {
                "--_layer-base-bg": `oklch(from ${t("color", token)} var(--_layer-bg-l) var(--_layer-bg-c) h)`,
                "--ak-layer": `var(--_layer-base-bg)`,
              }
            : {
                "--ak-layer":
                  "oklch(from var(--_layer-base-bg) var(--_layer-bg-l) var(--_layer-bg-c) h)",
              }),

          ...fromParent("layer", !!token, ({ key, inherit }) => ({
            [key("--_layer-level")]: token
              ? level
              : `calc(${inherit("--_layer-level")} + ${level})`,
            "--_layer-level": `var(${key("--_layer-level")})`,
          })),
        });

        console.log(value, result);

        return result;
      },
    },
    {
      values: {
        even: "even",
        accent: "accent",
        "accent-1": "accent-1",
        1: "1",
      },
    },
  );

  // matchUtilities(
  //   {
  //     a: (value) => {
  //       if (value === "lol") {
  //         return {
  //           backgroundColor: "red",
  //         };
  //       }
  //       return {
  //         color: value,
  //       };
  //     },
  //   },
  //   {
  //     values: {
  //       lol: "lol",
  //       tre: "tre",
  //     },
  //   },
  // );

  // matchUtilities(
  //   {
  //     "text-alpha": (color, { modifier }) => ({
  //       color: `${color} ${modifier}`,
  //     }),
  //   },
  //   {
  //     values: {
  //       __BARE_VALUE__: (value) => value.value,
  //       1: "1",
  //       2: "2",
  //     },
  //     type: "number",
  //   },
  // );
});

export default AriakitTailwind;
