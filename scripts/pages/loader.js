const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");
const { getMarkdownTree } = require("./utils");

// const PAGES_PATH = path.join(__dirname, "pages/examples");

async function loader(source) {
  // console.log(getOptions(this));
  const tree = await getMarkdownTree(this.resourcePath);
  // const readme = path.join(path.dirname(this.resourcePath), "README.md");
  // writePageFile(fs.existsSync(readme) ? readme : this.resourcePath, PAGES_PATH);
  return `module.exports = ${JSON.stringify(tree)}`;
}

module.exports = loader;
