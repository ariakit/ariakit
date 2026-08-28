import { cv } from "clava";
import { edge } from "./edge.ts";

// An inline code chip, drawn in em so it scales with the text it sits in.
export const code = cv({
  extend: [edge],
  class: [
    // A code element is monospace by default, but the chip sits inside body
    // text. The adjust pins its x-height, so the chip keeps one optical size
    // whatever font surrounds it.
    "font-mono [font-size-adjust:0.48]",
    "px-[0.25em] py-[0.18em] rounded ring",
    // The layer sets a text color on the element it paints. Inheriting it
    // back keeps the chip text on the surrounding ink rather than the chip
    // layer's own.
    "text-inherit",
  ],
  defaultVariants: {
    $lightnessOffset: true,
    $edgeWeight: 15,
  },
});
