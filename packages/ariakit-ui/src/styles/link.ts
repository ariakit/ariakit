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
    // Expand the hit target and focus ring without shifting flex or grid
    // layout.
    "-mt-1 -mb-1.5 pt-1 pb-1.5 rounded-sm",
    "font-medium underline decoration-1 underline-offset-[0.25em]",
    "ui-hover:decoration-[3px]",
    // Style queries read the ancestor layer, not the link itself.
    "ak-dark:[--link-dark:1]",
    // A word joiner in an inline box keeps its padding with the text before it
    // and out of the underline. An inline-block or a nested icon could wrap
    // onto its own line. Without a character in the box, Chromium would not
    // count the padding when it breaks a line, and the icon would pass the
    // column edge. The height and alignment only apply when a flex link
    // blockifies the box.
    "ui-new-window:after:content-(--link-new-window-content)",
    "ui-new-window:after:ps-[1em] ui-new-window:after:h-[1em]",
    "ui-new-window:after:self-center ui-new-window:after:bg-current",
    // WebKit leaves an inline box unmasked outside the mask image, so the image
    // fills the box. The SVG keeps its aspect ratio inside it.
    "ui-new-window:after:mask-(--link-new-window-icon)",
    "ui-new-window:after:mask-size-[100%_100%]",
    // Forced colors would replace the background with the canvas color.
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
