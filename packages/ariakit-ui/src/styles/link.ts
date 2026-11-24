import { cv } from "clava";
import { focus } from "./focus.ts";
import { text } from "./text.ts";

/**
 * An underlined text link with adaptive color and keyboard focus. A link with
 * `target="_blank"` shows a trailing arrow.
 */
export const link = cv({
  // A transparent link needs a focus ring; focusHighlight would paint no
  // indicator.
  extend: [text, focus],
  class: [
    "ui-link font-medium underline decoration-1",
    // Forced colors would replace the background with the canvas color.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "ui-new-window:forced-colors:after:forced-color-adjust-none",
    "ui-new-window:forced-colors:after:bg-[LinkText]",
  ],
  defaultVariants: {
    $text: "brand",
    $textPush(defaultValue, variants) {
      if (!variants.$text) return defaultValue;
      // Increase lightness on dark layers. A computed default lets callers
      // override the value without a competing CSS rule.
      return defaultValue ?? "calc(var(--link-dark, 0) * 20)";
    },
    $focus: true,
    // The padding already separates the ring from the text.
    $focusOffset: 0,
  },
});
