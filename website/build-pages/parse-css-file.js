import { readFileSync } from "fs";
import { basename, dirname, extname } from "path";
import postcss from "postcss";
import combineDuplicatedSelectors from "postcss-combine-duplicated-selectors";
import postcssImport from "postcss-import";
// @ts-expect-error
import mergeSelectors from "postcss-merge-selectors";
// @ts-expect-error
import prettify from "postcss-prettify";
import { format } from "prettier";
import { PurgeCSS } from "purgecss";
import _tailwindcss from "tailwindcss";

/** @type {import("tailwindcss")["default"]} */
// @ts-expect-error
const tailwindcss = _tailwindcss;

/** @type {import("postcss").PluginCreator<{ id?: string }>} */
const plugin = (opts = {}) => {
  return {
    postcssPlugin: "postcss-page-plugin",
    prepare(result) {
      const filename = result.root.source?.input.file;
      if (!filename) return {};
      const className = opts.id || basename(dirname(filename));
      /** @type {Set<import("postcss").Rule>} */
      const rulesSeen = new Set();
      return {
        Rule(rule) {
          // @ts-expect-error
          if (rule.parent?.name === "keyframes") return;
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
 * @param {string} [options.id]
 * @param {string} [options.tailwindConfig]
 * @param {boolean} [options.format]
 * @param {Record<string, string>} [options.contents]
 */
export async function parseCSSFile(filename, options) {
  const processor = postcss();

  if (options.id) {
    processor.use(plugin({ id: options.id }));
  }

  processor.use(postcssImport());

  if (options.tailwindConfig) {
    try {
      processor.use(tailwindcss({ config: options.tailwindConfig }));
    } catch (error) {
      console.error(error);
    }
  }

  if (options.format) {
    processor.use(
      combineDuplicatedSelectors({ removeDuplicatedProperties: true })
    );
    processor.use(
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
      })
    );
    processor.use(prettify());
  }

  const raw = readFileSync(filename, "utf8");
  const result = await processor.process(raw, { from: filename });

  let css = result.css;

  if (options.contents) {
    // TODO: https://github.com/FullHuman/purgecss/issues/1104
    const originalWarn = console.warn;
    console.warn = () => {};
    const safelist = [/^aria\-/, /^data-/, ":is", "dark"];

    const content = Object.entries(options.contents).map(([filename, raw]) => ({
      raw,
      extension: extname(filename),
    }));

    const [purged] = await new PurgeCSS().purge({
      css: [{ raw: css }],
      safelist: options.id ? [...safelist, options.id] : safelist,
      content,
    });

    if (purged?.css) {
      css = purged.css;
    }

    console.warn = originalWarn;
  }

  if (options.format) {
    css = format(css, { parser: "css" });
  }

  return css;
}
