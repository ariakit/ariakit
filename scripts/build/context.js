export const cwd = process.cwd();
export const dirName = /** @type {string} */ (cwd.split("/").pop());

export const isCore = ["ariakit-core"].includes(dirName);
export const isReact = ["ariakit-react", "ariakit-react-core"].includes(
  dirName,
);
export const isSolid = ["ariakit-solid", "ariakit-solid-core"].includes(
  dirName,
);
export const isTest = ["ariakit-test"].includes(dirName);
