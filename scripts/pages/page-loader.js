// @ts-check
const path = require("path");
const markdownLoader = require("./markdown-loader");
const { writePage } = require("./utils");

/**
 * @typedef {Required<import("./types").Page>} Options
 */

/**
 * Writes a page to the build directory.
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>>}
 */
async function pageLoader(source) {
  const filename = this.resourcePath;

  await writePage({ filename, ...this.getOptions() });

  if (/\.md$/.test(filename)) {
    // If the file is a markdown file, we'll need to convert it to AST.
    return markdownLoader.call(this, source);
  }

  return source;
}

module.exports = pageLoader;
