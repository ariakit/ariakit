import { cv } from "clava";
import { text } from "./text.ts";

export const heading = cv({
  extend: [text],
  class: [
    "ak-ink-100 mb-[0.5em] font-medium",
    "not-first:mt-[1em]",
    // Headings stacked directly under another heading sit closer to it than
    // to preceding body content. The extra not-first stack is redundant with
    // the sibling selector but ties the specificity of the mt-[1em] rule
    // above so this stacked (and therefore later-sorted) rule wins.
    "[:where(h1,h2,h3,h4,h5,h6)+&]:not-first:mt-[0.35em]",
    // Inside list items the heading is inline content, so the flow margin
    // must not push the rest of the item away.
    "[li_&]:mb-0",
    // Anchors (heading permalinks) inherit the heading look and only reveal
    // a link underline on hover. The color and hover decoration take ! to
    // beat the Link component's ui-text/ui-hover compound selectors, whose
    // specificity outweighs any plain descendant rule written here.
    "[&_a]:font-[weight:inherit] [&_a]:text-current! [&_a]:no-underline",
    "[&_a]:hover:underline [&_a]:hover:decoration-1!",
    "[&_a]:hover:underline-offset-[0.25em]",
  ],
  variants: {
    /**
     * Sets the heading’s visual size independently of the rendered element.
     * The default `auto` sizes the heading based on its own element (`h1` to
     * `h5`), so a visual override is only needed when the semantic level and
     * the design size disagree.
     */
    $level: {
      auto: [
        "[&:where(h1)]:text-[2.25em]",
        "[&:where(h2)]:text-[1.75em]",
        "[&:where(h3)]:text-[1.4em]",
        "[&:where(h4)]:text-[1.2em]",
        "[&:where(h5)]:text-[1em]",
      ],
      1: "text-[2.25em]",
      2: "text-[1.75em]",
      3: "text-[1.4em]",
      4: "text-[1.2em]",
      5: "text-[1em]",
    },
  },
  defaultVariants: {
    $level: "auto",
  },
});
