// @ts-check
import { readFileSync } from "fs";
import { basename, dirname } from "path";
import _postcss from "postcss";
import combineDuplicatedSelectors from "postcss-combine-duplicated-selectors";
import postcssImport from "postcss-import";
// @ts-expect-error
import mergeSelectors from "postcss-merge-selectors";
// @ts-expect-error
import prettify from "postcss-prettify";
import _tailwindcss from "tailwindcss";

/** @type {import("postcss")["default"]} */
// @ts-expect-error
const postcss = _postcss;

/** @type {import("tailwindcss")["default"]} */
// @ts-expect-error
const tailwindcss = _tailwindcss;

/** @type {import("postcss").PluginCreator<{ className?: string }>} */
const plugin = (opts = {}) => {
  return {
    postcssPlugin: "postcss-page-plugin",
    prepare(result) {
      const filename = result.root.source?.input.file;
      if (!filename) return {};
      const className = opts.className || basename(dirname(filename));
      /** @type {Set<import("postcss").Rule>} */
      const rulesSeen = new Set();
      return {
        Rule(rule) {
          if (rulesSeen.has(rule)) return;
          rulesSeen.add(rule);
          rule.selectors = rule.selectors.map((selector) => {
            if (selector.includes(".dark ")) {
              const selectorWithoutDark = selector.replace(".dark ", "");
              return `.dark .${className} ${selectorWithoutDark}`;
            }
            return `.${className} ${selector}`;
          });
        },
      };
    },
  };
};

plugin.postcss = true;

/**
 * @param {string} filename
 * @param {object} options
 * @param {string} [options.pageClassName]
 * @param {string} options.tailwindConfig
 */
export async function parseCSSFile(filename, options) {
  const processor = postcss([
    options.pageClassName && plugin({ className: options.pageClassName }),
    postcssImport(),
    tailwindcss({ config: options.tailwindConfig }),
    combineDuplicatedSelectors({ removeDuplicatedProperties: true }),
    mergeSelectors({
      matchers: {
        active: {
          selectorFilter: /(:active|\[data-active\])/,
          promote: true,
        },
        focusVisible: {
          selectorFilter: /(:focus-visible|\[data-focus-visible\])/,
          promote: true,
        },
      },
    }),
    prettify(),
  ]);

  const content = readFileSync(filename, "utf8");
  const result = await processor.process(content, { from: filename });
  return result.css;
}
