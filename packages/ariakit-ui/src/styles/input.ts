import { cv } from "clava";
import { focus } from "./focus.ts";
import { frame } from "./frame.ts";
import { text } from "./text.ts";

export const input = cv({
  extend: [frame, text, focus],
  class: [
    "max-w-full cursor-text",
    // Only animate into the hover state; snapping back on hover-out keeps
    // the field from feeling laggy.
    "hover:transition-[background-color]",
    // Plain hover, not ui-hover: fields are not command-like, and ui-hover's
    // nested-interactive exclusion would suppress feedback on a wrapper
    // whose form holds the input next to a submit button. The disabled
    // exclusion it builds in has to be spelled out in exchange, which works
    // here only because ui-disabled-within is a single selector list.
    "not-ui-disabled-within:hover:ak-state-2.5",
    // The row is one tight line plus the frame padding, whether the class
    // sits on the input itself or on a wrapper around it. Six steps of box
    // minus two one-step margins lands the nested input on the same 4-step
    // row as the self case, so a change to one number needs the others.
    "leading-4",
    "[input]:box-content [input]:h-4",
    "[&_input]:-my-1 [&_input]:box-content [&_input]:h-6",
    "[&_input]:outline-none",
    "placeholder:ak-ink-0 [&_input]:placeholder:ak-ink-0",
  ],
  variants: {
    /**
     * Whether to show a focus ring when the field, or the input inside it,
     * takes focus, and how thick the ring should be.
     */
    $focus(value?: 1 | 2 | 3 | boolean) {
      if (!value) return;
      // A function replaces the inherited scale instead of emitting beside
      // it. focus-within, because the class often sits on a wrapper around
      // the real input, and plain focus rather than focus-visible, so a
      // field built from a button or a wrapper rings on a pointer too.
      if (value === 1) return "focus-within:outline";
      if (value === 3) return "focus-within:outline-3";
      return "focus-within:outline-2";
    },
    /**
     * Extends the focus ring offsets with `inset`, which tucks the ring
     * inside the border so the two read as a single edge.
     */
    $focusOffset: {
      inset: "-outline-offset-1",
    },
  },
  defaultVariants: {
    $rounded: "lg",
    $p: 3,
    $border: true,
    // Always a real border rather than a ring, so the field geometry stays
    // the same on light and dark layers.
    $borderType: "border",
    // Inputs want a stronger edge than the named border weights provide
    // (between medium and bold). A variant default, not a base class, so
    // instance weights replace it instead of losing by stylesheet order.
    $edgeWeight: 30,
    // A field sinks into the surrounding surface where a button rises off
    // it, so the offset runs the other way: lighter on light layers, darker
    // on dark ones. Hover then spends ak-state in the button direction,
    // which pulls the field back toward the layer around it.
    $lightnessOffset: -1,
    $focus: true,
    $focusOffset: "inset",
  },
});

/**
 * Placeholder-colored text for fake input fields, like a button styled as an
 * input showing its empty-state label.
 */
export const inputPlaceholder = cv({
  class: "ak-ink-0",
});
