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
    // A smaller label leaves room for the lip and ring within body lines,
    // including Firefox's taller font box. Keep the cap in the text flow so
    // it cannot increase the paragraph's line spacing.
    "[:where(&)]:text-[0.875em]",
    // In a flex or grid row, the cap takes its height from the line box.
    // Pin the leading so these caps stay compact too.
    "leading-none whitespace-nowrap",
    "px-1 py-0",
    // Light falls from above: a hairline across the top, a thick lip along
    // the bottom, nothing on the sides. Each max() keeps its side from
    // vanishing at small sizes. Browsers round border widths down to whole
    // device pixels, so the lip floor is 2px: at 1px it would be no thicker
    // than the hairline.
    "border-t-0 border-x-0 border-b-[max(2px,0.15em)]",
    // A pseudo-element queries its originating element's layer. The top
    // hairline therefore follows the cap's own face, even when inverted,
    // without adding height to the cap.
    "relative before:absolute before:inset-0 before:rounded-[inherit]",
    "before:pointer-events-none ak-light:before:border-t-[max(1px,0.067em)]",
    "before:border-t-white",
    // The colors below read whether the face is light from the cap's own
    // layer, because an inverted or colored cap can have a face in the other
    // scheme than the surface around it, and ak-dark: only sees that surface.
    // The flag is 1 on a light face and 0 on a dark one. It holds channel
    // math that resolves only inside the oklch(from ...) colors that read it.
    "[--kbd-light-face:clamp(0,(l-0.65)*100,1)]",
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
    // The ring strength follows the supporting surface. The 0-100 alpha feeds
    // the default $edgeWeight, so a caller's weight replaces both scheme
    // defaults without competing with a conditional utility.
    "[--kbd-edge-alpha:100] ak-dark:[--kbd-edge-alpha:16]",
    // A dark supporting surface needs a deeper lip and a lifted ring.
    "ak-dark:border-b-[max(1px,0.2em)]",
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
