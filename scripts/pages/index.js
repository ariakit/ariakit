// @ts-check
const path = require("path");
const {
  resetBuildDir,
  getBuildDir,
  getPagesDir,
  writeEntryFile,
  getEntryPath,
  writeSymlinks,
  writePage,
  getFiles,
} = require("./utils");

/**
 * @typedef Page
 * @property {string} name
 * @property {string} sourceContext
 * @property {RegExp} sourceRegExp
 * @property {string} componentPath
 * @property {string} [cssTokensPath]
 * @property {string} [buildDir]
 * @property {string} [pagesDir]
 */

/** @type {Page[]} */
const pages = require(path.join(process.cwd(), "pages.config.js"));

pages.forEach(async (page) => {
  const buildDir = getBuildDir(page.buildDir);
  const pagesDir = getPagesDir(page.pagesDir);
  const entryPath = getEntryPath(page.name, buildDir);

  resetBuildDir(page.name, buildDir, entryPath);

  const files = getFiles(page.sourceContext, page.sourceRegExp);

  for await (const filename of files) {
    const dest = path.join(buildDir, page.name);
    await writePage({
      filename,
      dest,
      componentPath: page.componentPath,
      cssTokensPath: page.cssTokensPath,
    });
  }

  writeEntryFile(page.sourceContext, page.sourceRegExp, entryPath);
  writeSymlinks(page.name, buildDir, pagesDir);
});
