const fs = require("fs");
const path = require("path");
const { getPageTreeFromContent } = require("./utils");

async function mdLoader(source) {
  const tree = await getPageTreeFromContent(source);
  return `module.exports = ${JSON.stringify(tree)}`;
}

module.exports = mdLoader;
