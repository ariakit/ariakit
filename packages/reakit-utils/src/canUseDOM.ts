// Thanks to Fluent UI for doing the [research on IE11 memery leak](https://github.com/microsoft/fluentui/pull/9010#issuecomment-490768427)
// and for creating this [utils](https://github.com/microsoft/fluentui/blob/f6af0479a54f17fd16b9616a62d6be38686a5c1e/packages/utilities/src/dom/getWindow.ts)

let _window: Window | undefined;

// Note: Accessing "window" in IE11 is somewhat expensive, and calling "typeof window"
// hits a memory leak, whereas aliasing it and calling "typeof _window" does not.
// Caching the window value at the file scope lets us minimize the impact.
try {
  _window = window;
} catch (e) {
  /* no-op */
}

// Check if we can use the DOM. Useful for SSR purposes
function checkIsBrowser() {
  return Boolean(
    typeof _window !== "undefined" &&
      _window.document &&
      _window.document.createElement
  );
}

/**
 * It's `true` if it is running in a browser environment or `false` if it is not (SSR).
 *
 * @example
 * import { canUseDOM } from "reakit-utils";
 *
 * const title = canUseDOM ? document.title : "";
 */
export const canUseDOM = checkIsBrowser();
