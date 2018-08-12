const { mkdirSync, copyFileSync } = require("fs");
const { basename } = require("path");
// const pkg = require("../package.json");
const publicFiles = require("./publicFiles");

// const directories = [pkg.main, pkg.module].map(dir =>
//   dir.replace(/^(?:\.?\/?)([^/]+)\/?.*$/, "$1")
// );

// directories.forEach(dir => {
mkdirSync("build");
Object.keys(publicFiles).forEach(file => {
  const filename = basename(file);
  copyFileSync(file, `build/${filename}`);
});
// });
