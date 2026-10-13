import { cv } from "clava";
import { focus } from "./focus.ts";
import { text } from "./text.ts";

/** An underlined text link with adaptive color and keyboard focus. */
export const link = cv({
  // A transparent link needs a focus ring; focusHighlight would paint no
  // indicator.
  extend: [text, focus],
  class: [
    // Expand the hit target and focus ring without shifting flex or grid
    // layout.
    "-mt-1 -mb-1.5 pt-1 pb-1.5 rounded-sm",
    "font-medium underline decoration-1 underline-offset-[0.25em]",
    "ui-hover:decoration-[3px]",
    // Style queries read the ancestor layer, not the link itself.
    "ak-dark:[--link-dark:1]",
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
