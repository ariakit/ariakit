// @ts-check
// TODO: Refactor
const fs = require("fs");
const postcss = require("postcss");
const valueParser = require("postcss-value-parser");

/**
 * @typedef {object} Options
 * @property {string} options.file
 */

/** @type {import("postcss").PluginCreator<Options>} */
module.exports = (options) => ({
  postcssPlugin: "postcss-custom-properties-fallback",
  prepare() {
    const css = fs.readFileSync(options.file, "utf8");
    const customProperties = {};

    postcss.parse(css).walkRules((rule) => {
      if (Object.keys(customProperties).length) return;
      if (rule.selector === ":root") {
        rule.walkDecls((decl) => {
          customProperties[decl.prop] = decl.value;
        });
      }
    });
    console.log(customProperties["--gray-border"]);

    return {
      async Declaration(node) {
        if (!/(^|[^\w-])var\([\W\w]+\)/.test(node.value)) return;
        const parsed = valueParser(node.value);
        parsed.walk((node) => {
          if (node.type !== "function") return;
          // Only deal with vars without a fallback
          if (node.nodes.length !== 1) return;
          const variable = node.nodes[0].value;
          const fallback = customProperties[variable];
          if (fallback) {
            node.nodes.push(
              {
                type: "div",
                sourceIndex: variable.length,
                value: ",",
                before: "",
                after: " ",
              },
              {
                type: "word",
                value: fallback,
                sourceIndex: variable.length + 2,
              }
            );
          }
        });
        node.value = parsed.toString();
      },
    };
  },
});
