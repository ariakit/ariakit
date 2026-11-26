import { cv } from "clava";
import { controlSlot, getDisabledContentClass } from "./control.ts";
import { isLayerColor } from "./layer.ts";
import { slotFrame, slotFrameText } from "./slot-frame.ts";
import { tint } from "./tint.ts";

/**
 * A compact badge with a rounded edge. It keeps its pill shape in any parent
 * frame. With `$forceRounded={false}`, it follows the parent corners, and its
 * radius defaults to `lg`. In a slot, it fills the slot height, so it grows
 * with the control. Use a `box` slot, which is one line tall and takes the
 * width of the badge.
 */
export const badge = cv({
  // The tint supplies the mix and the text colors of each kind.
  extend: [slotFrame, tint],
  class: [
    // Rules that keep controls at their content width or color the border of a
    // floating slot also match this marker.
    "ui-badge",
    "font-medium",
    // Keep badges aligned with surrounding text while allowing flex and grid
    // placement.
    // Stays a class to come after the display of `ui-slot-frame`, which it
    // replaces.
    "inline-flex",
  ],
  variants: {
    /**
     * Sets how the badge is painted. `tint` blends the `$layer` color into the
     * parent surface, with an edge and colored text. `solid` fills the badge
     * with the `$layer` color, which defaults to `brand`. Each one only changes
     * the default of other variants, so these still override it.
     * @default "tint"
     */
    $kind: { tint: "", solid: "" },
    /**
     * Keeps a short count round. Its round ends add no room, and `md` doesn't
     * widen to `lg`, so a single digit stays a circle. In a slot, the side
     * padding also follows the slot height, so longer text gets less of it.
     * There, a raw `$px` length overrides it, and a named `$px` has no effect.
     */
    $round: "ui-badge--round",
  },
  defaultVariants: {
    $kind: "tint",
    // A badge is usually a pill, and the room follows its radius otherwise.
    $roundEnds: true,
    $layer(defaultValue, variants) {
      // Replace only frame's transparent default; preserve explicit colors.
      if (defaultValue !== "transparent") return defaultValue;
      return variants.$kind === "solid" ? "brand" : true;
    },
    // Concentric rounding would collapse the pill in a parent frame with
    // padding up to 0.5rem, such as a control with default padding.
    $forceRounded: true,
    $rounded(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // Without the force, the radius shows only where the badge isn't
      // concentric. A tag shape there reads as intended, unlike a near pill.
      return variants.$forceRounded ? "full" : "lg";
    },
    // A bit smaller than the text around the badge. A number follows the parent
    // font, so the badge scales with it, also in a slot, and can center its
    // capitals on those of the text around it.
    $size: 0.8125,
    // A tinted badge pushes its text further than the shared tint, so a short
    // label stands out on the small fill.
    $textPush(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      return 40;
    },
    // Half a step keeps a badge in running text within a line of leading-tight
    // or taller, so it doesn't make the line taller. In a slot, the slot height
    // sets the padding.
    $p: 0.5,
    $border(defaultValue, variants) {
      if (variants.$kind === "solid") return defaultValue;
      return defaultValue ?? true;
    },
    $borderType(defaultValue, variants) {
      // An inset border draws a ring even without $border, since the ring width
      // inherits.
      if (variants.$kind === "solid") return defaultValue;
      // Replace only frame's auto default; $border={false} and "inherit" clear
      // the ring.
      return defaultValue === "auto" ? "inset" : defaultValue;
    },
    $edgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$kind === "solid") return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      // Colored badges keep a tinted edge; neutral badges show it only at high
      // contrast.
      if (isLayerColor(variants.$layer)) return "medium";
      return "adaptive";
    },
    $edge(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
    $edgeHue(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Copy the layer hue unless the caller chose a different edge color. The
      // computed $edge may not be resolved yet.
      if (variants.$edge != null && variants.$edge !== variants.$layer) {
        return defaultValue;
      }
      return variants.$hue;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$kind === "solid") return defaultValue;
      // Only neutral badges shift away from their parent surface.
      if (variants.$layer === "transparent") return false;
      if (isLayerColor(variants.$layer)) return false;
      return true;
    },
  },
  refine({ variants, addClass }) {
    // In running text, a numeric size centers the capitals of the badge on
    // those of the text around it. The badge text is the parent text times the
    // font scale, so the parent capital height is the badge capital height
    // divided by it. Flex and grid items ignore vertical-align.
    if (typeof variants.$size === "number") {
      addClass("align-[calc(1cap*(1/var(--font-scale)-1)/2)]");
    }
    // A badge in a disabled control fades like the slots of the control.
    addClass(getDisabledContentClass(variants));
    if (variants.$p !== "none") {
      addClass([
        // In a slot, the space above and below the line replaces the frame
        // padding, and $px still sets the extra at the sides. Slot padding
        // would sit outside the fill. --slot-height is a registered length that
        // keeps the font of the slot, and 1lh and 1cap follow the badge.
        "[.ui-slot-frame-slot>&]:[--py:max(0px,calc((var(--slot-height)-1lh)/2))]",
        "[.ui-slot-frame-slot>&]:[--px:max(0px,calc((var(--slot-height)-1lh)/2+(1lh-1cap)*var(--px-scale)+var(--px-pill)))]",
      ]);
    }
    if (variants.$kind === "solid") return;
    if (!isLayerColor(variants.$layer)) return;
    if (variants.$edgeRaw) return;
    if (variants.$edgeLightnessMin != null) return;
    if (variants.$edgeLightnessMax != null) return;
    // Keep low-contrast hues such as yellow distinct from their tinted surface
    // with a minimum 40-point lightness difference.
    addClass("ak-light:ak-edge-max-l-60 ak-dark:ak-edge-min-l-60");
  },
});

/** Badge text with capital-height alignment. */
export const badgeLabel = cv({
  extend: [slotFrameText],
  class: "ui-badge-label",
  variants: {
    /**
     * Truncates the label to one line with an ellipsis. Uses `overflow-x: clip`
     * because Firefox does not trim scroll containers created by `overflow:
     * hidden`.
     */
    $truncate(value?: boolean) {
      if (!value) return;
      // Without a scroll container, the flex item needs an explicit minimum
      // width.
      return "min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap";
    },
  },
});

/**
 * A text-aligned slot for badge icons and other content. In a disabled control,
 * its painted content fades like the badge.
 */
export const badgeSlot = controlSlot;
