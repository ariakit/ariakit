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

/**
 * Helper to get the window object. The helper will make sure to use a cached variable
 * of "window", to avoid overhead and memory leaks in IE11. Note that in popup scenarios the
 * window object won't match the "global" window object, and for these scenarios, you should
 * pass in an element hosted within the popup.
 *
 * @public
 */
export function getWindow(element?: Element | null): Window | undefined {
  if (typeof _window === "undefined") {
    return undefined;
  }

  return element?.ownerDocument?.defaultView ?? _window;
}
