export const cwd = process.cwd();
export const dirName = /** @type {string} */ (cwd.split("/").pop());

export const isCore = [
  "ariakit-core",
  "ariakit-store",
  "ariakit-utils",
].includes(dirName);
export const isReact = [
  "ariakit-react",
  "ariakit-react-core",
  "ariakit-react-store",
  "ariakit-react-utils",
].includes(dirName);
export const isSolid = [
  "ariakit-solid",
  "ariakit-solid-core",
  "ariakit-solid-utils",
].includes(dirName);
export const isTest = ["ariakit-test"].includes(dirName);
export const isFramework = [isReact, isSolid].includes(true);
