import { readFile } from "fs/promises";
import { join } from "path";
import postcss from "postcss";
import combineDuplicatedSelectors from "postcss-combine-duplicated-selectors";
import postcssImport from "postcss-import";
// @ts-expect-error
import mergeSelectors from "postcss-merge-selectors";
// @ts-expect-error
import prettify from "postcss-prettify";
import tailwindcss from "tailwindcss";

const processor = postcss([
  postcssImport(),
  tailwindcss({ config: join(process.cwd(), "../../tailwind.config.js") }),
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

export async function parseCSSFile(filename: string) {
  const content = await readFile(filename, "utf8");
  const result = await processor.process(content, { from: filename });
  return result.css;
}
