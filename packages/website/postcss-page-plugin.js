// @ts-check
const { basename, dirname } = require("path");
const { pages } = require("./pages.config.js");

/** @type {import("postcss").PluginCreator} */
function plugin(_opts = {}) {
  return {
    postcssPlugin: "postcss-page-plugin",
    prepare(result) {
      const filename = result.root.source?.input.file;
      if (!filename) return {};
      const isPage = pages.some((page) =>
        filename.startsWith(page.sourceContext)
      );
      const pageName = basename(dirname(filename));
      if (!isPage) return {};
      return {
        Rule(rule) {
          rule.selectors = rule.selectors.map((selector) => {
            if (selector.includes(".dark ")) {
              const selectorWithoutDark = selector.replace(".dark ", "");
              return `.dark .page-${pageName} ${selectorWithoutDark}`;
            }
            return `.page-${pageName} ${selector}`;
          });
        },
      };
    },
  };
}

plugin.postcss = true;

module.exports = plugin;
