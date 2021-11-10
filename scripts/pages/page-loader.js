const fs = require("fs");
const path = require("path");
const mdLoader = require("./md-loader");
const { writePage } = require("./utils");

/**
 * @typedef {object} Options
 * @property {string} options.name
 * @property {string} options.buildDir
 * @property {string} options.componentPath
 */

/**
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>}
 */
async function pageLoader(source) {
  const filePath = this.resourcePath;

  if (/index\.[tj]sx?$/.test(filePath)) {
    const readmePath = path.join(path.dirname(filePath), "readme.md");
    if (fs.existsSync(readmePath)) return source;
  }

  const { name, buildDir, componentPath } = this.getOptions();
  const pagesPath = path.join(buildDir, name);

  await writePage(filePath, pagesPath, componentPath);

  if (/\.md$/.test(filePath)) {
    return mdLoader.call(this, source);
  }

  return source;
}

module.exports = pageLoader;
