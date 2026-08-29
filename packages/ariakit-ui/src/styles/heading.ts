import { cv } from "clava";
import { text } from "./text.ts";

export const heading = cv({
  extend: [text],
  class: [
    "ak-ink-100 font-medium",
    // The one place the size scale is written down, so the element rules
    // below and the $level variant cannot drift apart.
    "[--heading-size-1:2.25em] [--heading-size-2:1.75em]",
    "[--heading-size-3:1.4em] [--heading-size-4:1.2em] [--heading-size-5:1em]",
    // Each heading element takes its own step. An element with no step of
    // its own, an h6 or a div given the heading look, declares no size at
    // all and so keeps whatever the caller or the surrounding text sets.
    "[&:where(h1)]:text-(length:--heading-size-1)",
    "[&:where(h2)]:text-(length:--heading-size-2)",
    "[&:where(h3)]:text-(length:--heading-size-3)",
    "[&:where(h4)]:text-(length:--heading-size-4)",
    "[&:where(h5)]:text-(length:--heading-size-5)",
    // The flow margins are spent from channels rather than written into the
    // utilities directly. A channel utility sorts before every literal one,
    // so a caller's own mt-* or mb-* wins without an important flag.
    "mt-(--heading-mt) mb-(--heading-mb)",
    "[--heading-mt:1em] [--heading-mb:0.5em]",
    // A heading with nothing before it has nothing to sit away from.
    "first:[--heading-mt:0px]",
    // A heading directly under another sits closer to it than to body text.
    "[:is(h1,h2,h3,h4,h5,h6)+&]:[--heading-mt:0.35em]",
    // Inside a list item the heading shares the item's own flow, so its
    // closing margin must not push the rest of the item down.
    "in-[li]:[--heading-mb:0px]",
    // Permalink anchors take the heading's own look and stay undecorated
    // until hover. The color and the decoration width need the important
    // flag to beat the Link component's compound state selectors, whose
    // specificity outranks any plain descendant rule written here.
    "[&_a]:font-[weight:inherit] [&_a]:text-current! [&_a]:no-underline",
    "[&_a]:hover:underline [&_a]:hover:decoration-1!",
    "[&_a]:hover:underline-offset-[0.25em]",
  ],
  variants: {
    /**
     * Sets the heading’s visual size independently of the rendered element.
     * Left unset, the heading sizes itself from its own element, `h1` to
     * `h5`, so a value is only needed when the semantic level and the design
     * size disagree.
     */
    $level(value?: "auto" | 1 | 2 | 3 | 4 | 5) {
      if (!value) return;
      if (value === "auto") return;
      // A font size in the style attribute, so the chosen step wins over the
      // element rule whatever order the two end up in.
      return { style: { fontSize: `var(--heading-size-${value})` } };
    },
  },
});
