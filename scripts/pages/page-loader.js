const fs = require("fs");
const path = require("path");
const { getPageTreeFromContent, writePage } = require("./utils");

async function pageLoader(source) {
  const filePath = this.resourcePath;

  console.log(this.resourcePath);

  if (/index\.[tj]sx?$/.test(filePath)) {
    const readmePath = path.join(path.dirname(filePath), "readme.md");
    if (fs.existsSync(readmePath)) return source;
  }

  const { name, buildDir } = this.getOptions();
  const pagesPath = path.join(buildDir, name);

  const componentPath = path.join(
    __dirname,
    "../../packages/website/components/markdown-page"
  );

  await writePage(filePath, pagesPath, componentPath);

  if (/\.md$/.test(filePath)) {
    const tree = await getPageTreeFromContent(source);
    return `module.exports = ${JSON.stringify(tree)}`;
  }

  return source;
}

module.exports = pageLoader;
