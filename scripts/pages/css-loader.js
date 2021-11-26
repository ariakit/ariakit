// @ts-check
const fs = require("fs");
const { default: postcss } = require("postcss");
const postcssImport = require("postcss-import");
const parseValue = require("postcss-value-parser");

/**
 * @typedef {object} Options
 * @property {string} options.cssTokensPath
 */

/**
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>>}
 */
async function cssLoader(source) {
  const { cssTokensPath } = this.getOptions();
  this.addDependency(cssTokensPath);
  const result = await postcss([
    postcssImport(),
    postcssVariables({ cssTokensPath }),
  ]).process(source, {
    from: this.resourcePath,
  });
  return `module.exports = \`${result.css}\`;`;
}

/**
 * @param {object} values
 */
function cssVariableToValue(values) {
  /** @type {import('postcss-value-parser').WalkCallback} */
  return (node) => {
    if (node.type !== "function") return;
    if (node.value !== "var") return;
    const variable = node.nodes[0].value;
    const value = values[variable];
    if (!value) return;
    // @ts-ignore
    node.type = "word";
    node.value = value;
    node.sourceIndex = 0;
  };
}

/** @type {import("postcss").PluginCreator<Options>} */
const postcssVariables = (options) => ({
  postcssPlugin: "postcss-variables",
  prepare() {
    const css = fs.readFileSync(options.cssTokensPath, "utf8");
    const values = {};

    postcss.parse(css).walkRules((rule) => {
      rule.walkDecls((decl) => {
        if (!decl.variable) return;
        const parsed = parseValue(decl.value);
        parsed.walk(cssVariableToValue(values));
        values[decl.prop] = parsed.toString();
      });
    });

    return {
      Declaration(decl) {
        if (!/(^|[^\w-])var\([\W\w]+\)/.test(decl.value)) return;
        const parsed = parseValue(decl.value);
        parsed.walk(cssVariableToValue(values));
        decl.value = parsed.toString().replace(/\s+/g, " ");
      },
    };
  },
});

postcssVariables.postcss = true;

module.exports = cssLoader;
