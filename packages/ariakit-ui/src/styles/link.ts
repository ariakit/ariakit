import { cv } from "clava";
import { focus } from "./focus.ts";
import { text } from "./text.ts";

export const link = cv({
  extend: [text, focus],
  class: [
    // The padding grows the hit target and the focus indicator past the text
    // line; the matching negative margins keep that growth out of layout once
    // a caller lays the link out as a grid or flex child.
    "-mt-1 -mb-1.5 pt-1 pb-1.5 rounded-sm",
    "font-medium underline decoration-1 underline-offset-[0.25em]",
    "ui-hover:decoration-[3px]",
    // The dark-layer flag the text push below reads. ak-dark is a style
    // query, so it asks about the nearest ancestor that owns a layer, never
    // about the link itself.
    "ak-dark:[--link-dark:1]",
  ],
  defaultVariants: {
    $text: "brand",
    $textPush(defaultValue, variants) {
      if (!variants.$text) return defaultValue;
      // Dark layers push the lightness past the readability floor so the
      // link reads as a tint, not a slab of saturated brand color. Through
      // the variant rather than a dark-gated utility, which would sort last
      // and quietly beat a caller's own $textPush.
      return defaultValue ?? "calc(var(--link-dark, 0) * 20)";
    },
    $focus: true,
    // The padding above already holds the focus indicator off the text, and
    // an offset would push it into the lines above and below.
    $focusOffset: "none",
  },
});
