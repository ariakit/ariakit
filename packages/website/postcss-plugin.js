const { dirname, basename } = require("path");
var postcss = require("postcss");

/** @type {import("postcss").PluginCreator} */
const plugin = (opts = {}) => {
  console.log("aaaaa22222", opts);
  return {
    postcssPlugin: "postcss-plugin",
    Once(root) {
      // console.log("aaaaa", root.source.input.file);
    },
    Rule(rule) {
      const filename = rule.root().source.input.file;
      const page = basename(dirname(filename));
      const includes = filename.includes("/examples/");
      rule.selectors = rule.selectors.map((selector) => {
        if (includes) {
          if (selector.includes(".dark ")) {
            return `.dark .${page}1 ${selector.replace(".dark ", "")}`;
          }
          return `.${page}1 ${selector}`;
        }
        return selector;
      });
    },
  };
};

plugin.postcss = true;

module.exports = plugin;
