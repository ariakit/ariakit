// @ts-check
const fs = require("fs");
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
  getPageIndexPath,
  getPageContentsPath,
} = require("./utils");

/** @type {import("./types").Pages} */
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

// Reset index/contents paths
for (const page of pages) {
  const buildDir = getBuildDir(page.buildDir);
  const indexPath = getPageIndexPath(buildDir);
  const contentsPath = getPageContentsPath(buildDir);
  if (fs.existsSync(indexPath)) {
    fs.rmSync(indexPath);
  }
  if (fs.existsSync(contentsPath)) {
    fs.rmSync(contentsPath);
  }
}

async function run() {
  for (const page of pages) {
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

    for (const filename of files) {
      await writePage({
        filename,
        buildDir,
        name: page.name,
        pageComponentPath: page.pageComponentPath,
        playgroundComponentPath: page.playgroundComponentPath,
        getGroup: page.getGroup,
      });
    }

    writeEntryFile(page.sourceContext, page.sourceRegExp, entryPath);
    // writeSymlinks(page.name, buildDir, pagesDir);
  }
}

run();
