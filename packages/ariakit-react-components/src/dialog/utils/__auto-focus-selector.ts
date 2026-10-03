/**
 * Matches the elements that a dialog focuses when it opens without an
 * `initialFocus` element. Ariakit components that consume the `autoFocus` prop
 * render the `data-autofocus` attribute instead of the native one.
 */
export const autoFocusSelector = "[data-autofocus=true],[autofocus]";
