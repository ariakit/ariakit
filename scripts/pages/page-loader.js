// @ts-check
const path = require("path");
const markdownLoader = require("./markdown-loader");
const { writePage } = require("./utils");

/**
 * @typedef {object} Options
 * @property {string} options.name
 * @property {string} options.buildDir
 * @property {string} options.componentPath
 * @property {string} [options.metaPath]
 * @property {(filename: string) => string | null} [options.getGroup]
 */

/**
 * Writes a page to the build directory.
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>>}
 */
async function pageLoader(source) {
  const filename = this.resourcePath;
  const { name, buildDir, componentPath, metaPath, getGroup } =
    this.getOptions();
  const dest = path.join(buildDir, name);

  await writePage({ filename, dest, componentPath, metaPath, getGroup });

  if (/\.md$/.test(filename)) {
    // If the file is a markdown file, we'll need to convert it to AST.
    return markdownLoader.call(this, source);
  }

  return source;
}

module.exports = pageLoader;
