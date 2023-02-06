import { readdirSync } from "fs";
import { join } from "path";
import { getPageName } from "./get-page-name";
import { pathToPosix } from "./path-to-posix";

/**
 * Reads a directory recursively and returns a list of files that match the
 * given pattern.
 */
export function getPageFiles(
  dir: string,
  pattern: RegExp,
  files: string[] = []
) {
  const items = readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = join(dir, item.name);
    const posixPath = pathToPosix(itemPath);
    if (/node_modules/.test(itemPath)) continue;
    if (item.isDirectory()) {
      getPageFiles(itemPath, pattern, files);
    } else if (pattern.test(posixPath)) {
      const pageName = getPageName(posixPath);
      const index = files.findIndex((file) => getPageName(file) === pageName);
      if (index !== -1) {
        files.splice(index, 1, posixPath);
      } else {
        files.push(posixPath);
      }
    }
  }
  return files;
}
