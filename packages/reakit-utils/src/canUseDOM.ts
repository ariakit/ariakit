/**
 * It's `true` if it is running in a browser environment or `false` if it is not (SSR).
 *
 * @example
 * import { canUseDOM } from "reakit-utils";
 *
 * const title = canUseDOM ? document.title : "";
 */
export const canUseDOM: boolean = !!(
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
);
