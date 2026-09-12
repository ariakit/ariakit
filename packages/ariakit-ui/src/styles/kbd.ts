import { cv } from "clava";
import { edge } from "./edge.ts";

// A key cap, drawn in em so it scales with the text it sits in.
export const kbd = cv({
  extend: [edge],
  class: [
    // A kbd element is monospace by default, but a key label is UI text.
    // The adjust pins its x-height, so the label keeps one optical size
    // whatever font the surrounding text uses.
    "font-sans [font-size-adjust:0.49]",
    // Inline, the cap takes its height from the font. Blockified as a flex or
    // grid child it would take the surrounding line height instead and stand
    // half again taller than it is wide, so pin it and let the padding set
    // the space on both axes.
    "leading-none",
    "px-1 py-[0.1em]",
    // Light falls from above: a hairline across the top, a thick lip along
    // the bottom, nothing on the sides. Each max() keeps its side from
    // vanishing at small sizes. Browsers round border widths down to whole
    // device pixels, so the lip floor is 2px: at 1px it would be no thicker
    // than the hairline.
    "border-t-[max(1px,0.067em)] border-x-0 border-b-[max(2px,0.15em)]",
    // The colors below read whether the face is light from the cap's own
    // layer, because an inverted or colored cap can have a face in the other
    // scheme than the surface around it, and ak-dark: only sees that surface.
    // The flag is 1 on a light face and 0 on a dark one. It holds channel
    // math that resolves only inside the oklch(from ...) colors that read it.
    "[--kbd-light-face:clamp(0,(l-0.65)*100,1)]",
    // A light face catches the light: a white hairline across the top. A
    // dark face catches none, so the hairline turns transparent.
    "border-t-[oklch(from_var(--ak-layer)_1_0_0/var(--kbd-light-face))]",
    // The lip is the face in shadow, so it follows the layer rather than the
    // edge. That leaves the edge to the ring alone. A light face takes the
    // deeper cut: the same drop that reads as a shadow on a dark face barely
    // separates from a light one.
    "border-b-[oklch(from_var(--ak-layer)_calc(l-0.08-0.09*var(--kbd-light-face))_c_h)]",
    // The bottom corners round further than the top ones to stay concentric
    // with that thicker lip.
    "rounded-t-[0.27em] rounded-b-[0.34em]",
    // The face lightens toward the bottom, which reads as the dish of a key,
    // and a dark face lightens further to show it.
    "bg-linear-to-b from-transparent",
    "to-[oklch(from_var(--ak-layer)_calc(l+0.08-0.03*var(--kbd-light-face))_c_h)]",
    // The sides carry no border, so a hairline ring closes the shape.
    "shadow-[0_0_0_max(1px,0.034em)_var(--ak-edge)]",
    // Lengths and the ring alpha cannot read the face, so they follow the
    // surface around the cap. The alpha travels as a channel in the 0-100
    // units $edgeWeight takes. The default below spends it, which leaves a
    // caller's own $edgeWeight replacing that default outright rather than
    // competing with a class in one scheme only.
    "[--kbd-edge-alpha:100] ak-dark:[--kbd-edge-alpha:16]",
    // On a dark surface the lip carries the depth on its own, thicker and
    // over a ring lifted clear of the cap.
    "ak-dark:border-t-0 ak-dark:border-b-[max(1px,0.2em)]",
    "ak-dark:rounded-b-[0.4em]",
    "ak-dark:shadow-[0_min(-1px,-0.06em)_var(--ak-edge),0_0_0_max(1px,0.06em)_var(--ak-edge)]",
  ],
  defaultVariants: {
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A transparent cap keeps its outline and paints no face. An offset would
      // mark the layer as modified and paint the face again.
      if (variants.$layer === "transparent") return false;
      return 2;
    },
    // The lip and the ring are opaque and lightened so the cap reads as a
    // raised object rather than an outlined box.
    $edgeWeight: "var(--kbd-edge-alpha)",
    $edgeLighten: 60,
    // The lightening above starts from the fully pushed edge. A named edge
    // color would otherwise drop the push and keep its own lightness, and the
    // lightening would then turn its ring white. With the push, the ring lands
    // where the neutral ring does and only the hue changes.
    $edgePush: 100,
  },
});
