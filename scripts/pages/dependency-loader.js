const fs = require("fs");
const path = require("path");
const { writePage } = require("./utils");

/**
 * @typedef {object} Options
 * @property {string} options.importerFilePath
 */

/**
 * Makes sure all the dependant files are loaded when a dependency updates. This
 * means page-loader will be called and new imports will be added to the
 * generated page.
 * @type {import("webpack").LoaderDefinitionFunction<Options,
 * import("webpack").LoaderContext<Options>}
 */
async function dependencyLoader(source) {
  const { importerFilePath } = this.getOptions();
  const timestamp = Date.now();
  fs.utimesSync(importerFilePath, timestamp, timestamp);
  return source;
}

module.exports = dependencyLoader;
