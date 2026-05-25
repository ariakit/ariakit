const path = require("node:path");

/** @param {string} value */
function toCssPath(value) {
  return value.split(path.sep).join("/");
}

/**
 * @param {string} from
 * @param {string} to
 */
function getRelativeCssPath(from, to) {
  const relativePath = toCssPath(path.relative(path.dirname(from), to));
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

/**
 * @param {{ tailwindConfig?: string, globalCss?: string }} [options]
 * @returns {import("postcss").Plugin}
 */
module.exports = function tailwindPrelude(options = {}) {
  if (!options.tailwindConfig) {
    throw new Error("Expected tailwindConfig");
  }
  if (!options.globalCss) {
    throw new Error("Expected globalCss");
  }
  const tailwindConfig = path.resolve(options.tailwindConfig);
  const globalCss = path.resolve(options.globalCss);

  /** @type {import("postcss").Plugin} */
  const plugin = {
    postcssPlugin: "ariakit-tailwind-prelude",
    Once(root, { result }) {
      const from = result.opts.from;
      if (!from) return;
      if (path.resolve(from) === globalCss) return;

      let needsTailwind = false;
      let hasConfig = false;
      let hasReference = false;

      root.walkAtRules((rule) => {
        if (rule.name === "apply") needsTailwind = true;
        if (rule.name === "config") hasConfig = true;
        if (rule.name === "reference") hasReference = true;
      });

      if (!needsTailwind) return;

      if (!hasReference) {
        root.prepend({
          name: "reference",
          params: JSON.stringify("tailwindcss"),
        });
      }

      if (!hasConfig) {
        root.prepend({
          name: "config",
          params: JSON.stringify(getRelativeCssPath(from, tailwindConfig)),
        });
      }
    },
  };

  return plugin;
};

module.exports.postcss = true;
