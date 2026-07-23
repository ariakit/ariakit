import { cv } from "clava";
import { focus } from "./focus.ts";
import { text } from "./text.ts";

export const link = cv({
  extend: [text, focus],
  class: [
    // Grow the hit target and focus outline past the text line without
    // affecting layout.
    "-mt-1 -mb-1.5 pt-1 pb-1.5 rounded-sm",
    "font-medium underline decoration-1 underline-offset-[0.25em]",
    "ui-hover:decoration-[3px]",
    // Push the lightness past the readability floor on dark layers so the
    // link color reads as a tint rather than a saturated block of brand color.
    // The ui-text scoping matches $textPush: descendant svg/.text elements
    // recompute their own text color (the push property doesn't inherit), so
    // they need the push too or they render darker than the link text.
    "ui-text:ak-dark:ak-text-push-20",
  ],
  defaultVariants: {
    $text: "brand",
    $focus: true,
    // The built-in top and bottom padding already keeps the outline away
    // from the text, like the legacy ak-link.
    $focusOffset: "none",
  },
});
