const fs = require("fs");
const path = require("path");
const { getPageTreeFromContent } = require("./utils");

/**
 * Converts markdown pages into a JavaScript module that exports the page AST.
 * @type {import("webpack").LoaderDefinitionFunction<{},
 * import("webpack").LoaderContext<{}>}
 */
async function markdownLoader(source) {
  const tree = await getPageTreeFromContent(source);
  return `module.exports = ${JSON.stringify(tree)}`;
}

module.exports = markdownLoader;
