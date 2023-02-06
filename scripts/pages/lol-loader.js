// @ts-check
const fs = require("fs");
const path = require("path");

/**
 * @typedef {object} Options
 * @property {string} options.importerFilePath
 */

/**
 * Makes sure all the dependant files are loaded when a dependency updates. This
 * means page-loader will be called and new imports will be added to the
 * generated page.
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>>}
 */
async function lolLoader(source) {
  const loaderSpan = this.currentTraceSpan.traceChild("lol-loader");
  this.addDependency(this.resourcePath);
  const callback = this.async();

  loaderSpan.traceAsyncFn(async () => {
    console.log(this.resourcePath);

    const json = JSON.stringify(source)
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");

    callback(null, `export default ${json}`);
  });
}

module.exports = lolLoader;
