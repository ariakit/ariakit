const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { writePage, cleanPages } = require("./utils");

const examplesPath = path.join(__dirname, `../../packages/**/__examples__/*`);
const pagesPath = path.join(__dirname, "../../packages/website/pages/examples");
const examples = glob.sync(examplesPath, { ignore: "**/node_modules/**" });
const pages = glob.sync(`${pagesPath}/*`, { ignore: "**/index.{js,ts,tsx}" });

cleanPages(pages);

const componentPath = path.join(
  __dirname,
  "../../packages/website/components/markdown-page"
);

async function main() {
  for (const example of examples) {
    const readme = path.join(example, "readme.md");
    const index = path.join(example, "index.tsx");
    if (fs.existsSync(readme)) {
      await writePage(readme, pagesPath, componentPath);
    } else if (fs.existsSync(index)) {
      await writePage(index, pagesPath, componentPath);
    }
  }
}

main();
