// @ts-check
const path = require("path");
const { uniq } = require("lodash");
const {
  resetBuildDir,
  getBuildDir,
  getPagesDir,
  writeEntryFile,
  getEntryPath,
  writeSymlinks,
  writePage,
  getFiles,
  getPageName,
  getReadmePathFromIndex,
} = require("./utils");

/**
 * @typedef Page
 * @property {string} name
 * @property {string} sourceContext
 * @property {RegExp} sourceRegExp
 * @property {string} componentPath
 * @property {string} [buildDir]
 * @property {string} [pagesDir]
 */

/** @type {Page[]} */
const pages = require(path.join(process.cwd(), "pages.config.js"));

/**
 * @param {any[]} items
 */
function getDuplicates(items) {
  const duplicates = items.filter(
    (item, i, array) => array.indexOf(item) !== i
  );
  return uniq(duplicates);
}

/**
 * @param {string} file
 * @param {number} index
 * @param {string[]} array
 */
function filterOutIndexFilesWithReadme(file, index, array) {
  return !getReadmePathFromIndex(
    file,
    (f) => array.indexOf(f) > 0 && array.indexOf(f) !== index
  );
}

pages.forEach(async (page) => {
  const buildDir = getBuildDir(page.buildDir);
  const pagesDir = getPagesDir(page.pagesDir);
  const entryPath = getEntryPath(page.name, buildDir);

  resetBuildDir(page.name, buildDir, entryPath);

  const files = getFiles(page.sourceContext, page.sourceRegExp).filter(
    filterOutIndexFilesWithReadme
  );

  const duplicates = getDuplicates(files.map(getPageName));

  if (duplicates.length) {
    const names = duplicates.join(", ");
    throw new Error(
      `Duplicate page names found: ${names}. Please make sure that all page names are unique.`
    );
  }

  for await (const filename of files) {
    const dest = path.join(buildDir, page.name);
    await writePage({
      filename,
      dest,
      componentPath: page.componentPath,
    });
  }

  writeEntryFile(page.sourceContext, page.sourceRegExp, entryPath);
  writeSymlinks(page.name, buildDir, pagesDir);
});
