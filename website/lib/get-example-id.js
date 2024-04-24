import { dirname, relative, resolve } from "path";
import { kebabCase } from "lodash-es";

/**
 * @param {string} path
 */
export function getExampleId(path) {
  const pathFromRoot = relative(resolve(process.cwd(), ".."), dirname(path));
  return kebabCase(pathFromRoot);
}
