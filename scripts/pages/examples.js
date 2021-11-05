const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { getPageContents } = require("./utils");

const EXAMPLE_GLOB = path.join(__dirname, `../../packages/**/__examples__/*`);
const PAGES_PATH = path.join(
  __dirname,
  "../../packages/website/pages/docs/examples"
);
const examples = glob.sync(EXAMPLE_GLOB, { ignore: "**/node_modules/**" });
const pages = glob.sync(`${PAGES_PATH}/*`, { ignore: "**/index.{js,ts,tsx}" });

console.log(pages);
// Clean
pages.forEach(fs.unlinkSync);

// async function main() {
//   for (const filename of files) {
//     const readme = path.join(path.dirname(filename), "README.md");
//     await writePageFile(fs.existsSync(readme) ? readme : filename, PAGES_PATH);
//   }
// }

// main();

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
