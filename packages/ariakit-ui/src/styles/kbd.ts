import { cv } from "clava";
import { edge } from "./edge.ts";

// A key cap, drawn in em so it scales with the text it sits in. The prose
// style in prose.ts mirrors this recipe as descendant styles for plain kbd
// markup, where the variants below can only be spelled as classes:
// $lightnessOffset is `ak-layer-10`, $edgeWeight is `ak-edge-100` and
// $edgeLighten is `ak-edge-lighten-60`. Keep the two in sync.
export const kbd = cv({
  extend: [edge],
  class: [
    // A kbd element is monospace by default, but a key label is UI text.
    // The adjust pins its x-height, so the label keeps one optical size
    // whatever font the surrounding text uses.
    "font-sans [font-size-adjust:0.49]",
    "px-[0.25em] py-[0.1em]",
    // Light falls from above: a white hairline across the top, a thick lip
    // along the bottom, nothing on the sides. Each max() keeps its side
    // visible once the em value drops below a pixel.
    "border-t-[max(1px,0.067em)] border-x-0 border-b-[max(1px,0.15em)]",
    "border-t-white border-b-(--ak-edge)",
    // The bottom corners round further than the top ones to stay concentric
    // with that thicker lip.
    "rounded-t-[0.27em] rounded-b-[0.34em]",
    // The face lightens toward the bottom, which reads as the dish of a key.
    "bg-linear-to-b from-transparent",
    "to-[oklch(from_var(--ak-layer)_calc(l+0.05)_c_h)]",
    // The sides carry no border, so a hairline ring closes the shape.
    "shadow-[0_0_0_max(1px,0.034em)_var(--ak-edge)]",
    // The edge alpha differs between the two schemes, so it travels as a
    // channel in the 0-100 units $edgeWeight takes. The default below spends
    // it, which leaves a caller's own $edgeWeight replacing that default
    // outright rather than competing with a class in one scheme only.
    "[--kbd-edge-alpha:100] ak-dark:[--kbd-edge-alpha:16]",
    // A dark cap catches no light on top, so the highlight goes and the lip
    // carries the depth on its own: thicker, darker than the face instead of
    // edge-colored, over a fainter ring lifted clear of the cap.
    "ak-dark:border-t-0 ak-dark:border-b-[max(1px,0.2em)]",
    "ak-dark:border-b-[oklch(from_var(--ak-layer)_calc(l-0.08)_c_h)]",
    "ak-dark:rounded-b-[0.4em]",
    "ak-dark:to-[oklch(from_var(--ak-layer)_calc(l+0.08)_c_h)]",
    "ak-dark:shadow-[0_min(-1px,-0.06em)_var(--ak-edge),0_0_0_max(1px,0.06em)_var(--ak-edge)]",
  ],
  defaultVariants: {
    $lightnessOffset: 2,
    // The lip and the ring are opaque and lightened so the cap reads as a
    // raised object rather than an outlined box.
    $edgeWeight: "var(--kbd-edge-alpha)",
    $edgeLighten: 60,
  },
});
