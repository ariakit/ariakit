// @ts-check
const path = require("path");
const { Project } = require("ts-morph");
const markdownLoader = require("./markdown-loader");
const { writePage, writeAPIPage } = require("./utils");

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
  const { name, buildDir, componentPath, getGroup, type } = this.getOptions();

  const args = {
    filename,
    name,
    buildDir,
    componentPath,
    getGroup,
    refresh: true,
  };

  if (type === "api") {
    await writeAPIPage(args);
  } else {
    await writePage(args);
  }

  if (/\.md$/.test(filename)) {
    // If the file is a markdown file, we'll need to convert it to AST.
    return markdownLoader.call(this, source);
  }

  return source;
}

module.exports = pageLoader;
