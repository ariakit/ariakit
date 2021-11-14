const fs = require("fs");
const path = require("path");
const markdownLoader = require("./markdown-loader");
const { writePage } = require("./utils");

/**
 * @typedef {object} Options
 * @property {string} options.name
 * @property {string} options.buildDir
 * @property {string} options.componentPath
 */

/**
 * Writes a page to the build directory.
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>}
 */
async function pageLoader(source) {
  const filePath = this.resourcePath;
  const { name, buildDir, componentPath } = this.getOptions();
  const dest = path.join(buildDir, name);

  await writePage(filePath, dest, componentPath);

  if (/\.md$/.test(filePath)) {
    // If the file is a markdown file, we'll need to convert it to AST.
    return markdownLoader.call(this, source);
  }

  return source;
}

module.exports = pageLoader;
