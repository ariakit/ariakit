const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { writePage } = require("./utils");

const EXAMPLE_GLOB = path.join(__dirname, `../../packages/**/__examples__/*`);
const PAGES_PATH = path.join(
  __dirname,
  "../../packages/website/pages/examples"
);
const examples = glob.sync(EXAMPLE_GLOB, { ignore: "**/node_modules/**" });
const pages = glob.sync(`${PAGES_PATH}/*`, { ignore: "**/index.{js,ts,tsx}" });

// Clean
pages.forEach(fs.unlinkSync);

async function main() {
  for (const example of examples) {
    const readme = path.join(example, "readme.md");
    const index = path.join(example, "index.tsx");
    if (fs.existsSync(readme)) {
      await writePage(readme, PAGES_PATH);
    } else if (fs.existsSync(index)) {
      await writePage(index, PAGES_PATH);
    }
  }
}

main();

// t.addComment(
//   statement,
//   "leading",
//   " This file is auto-generated. Do not edit.",
//   true
// );

// fs.writeFileSync(IMPORTS_PATH, formattedContent, {
//   encoding: "utf8",
//   flag: "w",
// });
