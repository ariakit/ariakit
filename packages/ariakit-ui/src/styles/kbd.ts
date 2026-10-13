import { cv } from "clava";
import { edge } from "./edge.ts";

/** A raised keyboard key that scales with the surrounding text. */
export const kbd = cv({
  extend: [edge],
  class: [
    // Use UI text with a consistent x-height across surrounding fonts.
    "font-sans [font-size-adjust:0.49]",
    // Leave room for the lip and ring, including Firefox's taller font box,
    // without increasing paragraph line spacing.
    "[:where(&)]:text-[0.875em]",
    // Keep key caps compact when flex or grid placement uses their line box.
    "leading-none whitespace-nowrap",
    // Lift the cap to balance its bottom lip around the surrounding text.
    // https://github.com/ariakit/ariakit/pull/7495#discussion_r3998720431
    "align-[0.05em]",
    "px-1 py-0",
    // Browsers round borders down to device pixels. Keep the bottom lip at
    // least 2px so it remains thicker than the top hairline.
    "border-t-0 border-x-0 border-b-[max(2px,0.15em)]",
    // Query the key's own layer for its top edge, including inverted keys,
    // without adding height.
    "relative before:absolute before:inset-0 before:rounded-[inherit]",
    "before:pointer-events-none ak-light:before:border-t-[max(1px,0.067em)]",
    "before:border-t-white",
    // Read the key face, which can differ from the parent scheme. This 0–1 flag
    // contains channel math resolved inside relative colors.
    "[--kbd-light-face:clamp(0,(l-0.65)*100,1)]",
    // Shade the lip from the face, independently of the ring. Light faces need
    // a larger lightness difference.
    "border-b-[oklch(from_var(--ak-layer)_calc(l-0.08-0.09*var(--kbd-light-face))_c_h)]",
    // Keep lower corners concentric with the thicker lip.
    "rounded-t-[0.27em] rounded-b-[0.34em]",
    // Lighten the lower face more on dark keys to show the recessed shape.
    "bg-linear-to-b from-transparent",
    "to-[oklch(from_var(--ak-layer)_calc(l+0.08-0.03*var(--kbd-light-face))_c_h)]",
    // Close the borderless sides with a hairline shadow.
    "shadow-[0_0_0_max(1px,0.034em)_var(--ak-edge)]",
    // Pass scheme-specific opacity through the $edgeWeight default so caller
    // values replace it.
    "[--kbd-edge-alpha:100] ak-dark:[--kbd-edge-alpha:16]",
    // Dark parent surfaces need a deeper lip and lifted ring.
    "ak-dark:border-b-[max(1px,0.2em)]",
    "ak-dark:rounded-b-[0.4em]",
    "ak-dark:shadow-[0_min(-1px,-0.06em)_var(--ak-edge),0_0_0_max(1px,0.06em)_var(--ak-edge)]",
  ],
  defaultVariants: {
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // An offset would repaint a transparent key face.
      if (variants.$layer === "transparent") return false;
      return 2;
    },
    $edgeWeight: "var(--kbd-edge-alpha)",
    $edgeLighten: 60,
    // Push named edge colors before lightening so their rings retain the
    // neutral ring's lightness.
    $edgePush: 100,
  },
});
