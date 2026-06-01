export const cwd = process.cwd();
export const dirName = /** @type {string} */ (cwd.split("/").pop());

export const isReact = ["ariakit-react", "ariakit-react-components"].includes(
  dirName,
);
export const isSolid = ["ariakit-solid", "ariakit-solid-components"].includes(
  dirName,
);
export const isFramework = [isReact, isSolid].includes(true);
