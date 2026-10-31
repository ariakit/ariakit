import { cv } from "clava";
import { controlSlot, getDisabledContentClass } from "./control.ts";
import { isLayerColor } from "./layer.ts";
import { slotFrame, slotFrameText } from "./slot-frame.ts";

/**
 * A compact badge with a rounded edge. In a slot, it fills the slot height, so
 * it grows with the control and keeps its pill shape. The slot then sets its
 * text size and side padding, so `$size` and `$px` apply only outside a slot.
 * Use a `box` slot, which is one line tall and takes the width of the badge.
 */
export const badge = cv({
  extend: [slotFrame],
  class: [
    // Rules that keep controls at their content width or color the border of a
    // floating slot also match this marker.
    "badge font-medium",
    // Letter spacing inherits as a length, so the spacing of a large heading
    // around a badge would crowd its smaller text. The direct property keeps
    // the letter spacing fallback of text-* classes.
    "[:where(&)]:[letter-spacing:normal]",
    // Center short counts in the minimum width, and position floating slots.
    "relative justify-center",
    // Keep badges aligned with surrounding text while allowing flex and grid
    // placement.
    "inline-flex",
    // Keep one-line counts at least square, including padding and borders.
    "min-w-[calc(1lh+(var(--ak-frame-padding,0px)+var(--ak-frame-border,0px))*2)]",
    // In a slot, the slot height sets the size of the badge. The text is a bit
    // smaller than the text around the slot, and short counts stay at least
    // square.
    "[.slot-frame-slot>&]:self-stretch [.slot-frame-slot>&]:items-center",
    "[.slot-frame-slot>&]:py-0 [.slot-frame-slot>&]:text-[0.8125em]",
    "[.slot-frame-slot>&]:min-w-(--slot-height)",
    // The sides keep 0.75 of the space above and below the capitals. Slot
    // padding would sit outside the fill. --slot-height is a registered length
    // that keeps the font of the slot, and 1lh and 1cap follow the badge.
    "[.slot-frame-slot>&]:px-[var(--badge-round-px,max(0px,calc((var(--slot-height)-1lh)/2+(1lh-1cap)*0.75)))]",
    // Concentric rounding can collapse the pill at default control padding.
    "[.slot-frame-slot>&]:ak-frame-force",
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
     * Keeps a short count round in a slot. Longer text gets less side padding.
     * Outside a slot, it has no effect.
     */
    $round: "[--badge-round-px:calc(var(--slot-height)*0.15)]",
  },
  defaultVariants: {
    $kind: "tint",
    $layer(defaultValue, variants) {
      // Replace only frame's transparent default; preserve explicit colors.
      if (defaultValue !== "transparent") return defaultValue;
      return variants.$kind === "solid" ? "brand" : true;
    },
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px(defaultValue, variants) {
      // Replace only the text frame default; explicit padding still wins
      // outside a slot.
      if (defaultValue !== "md") return defaultValue;
      if (variants.$rounded === "full") return "lg";
      return defaultValue;
    },
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
    $mix(defaultValue, variants) {
      if (variants.$kind === "solid") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Blend colored badges into the parent surface for a lighter tint.
      return defaultValue ?? 15;
    },
    $text(defaultValue, variants) {
      if (variants.$kind === "solid") return defaultValue;
      return defaultValue ?? true;
    },
    $textPush(defaultValue, variants) {
      if (variants.$kind === "solid") return defaultValue;
      return defaultValue ?? 60;
    },
    $textWarm(defaultValue, variants) {
      if (variants.$kind === "solid") return defaultValue;
      return defaultValue ?? 20;
    },
    $textChroma(defaultValue, variants) {
      if (variants.$kind === "solid") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? "vivid";
    },
  },
  refine({ variants, addClass }) {
    // A badge in a disabled control fades like the slots of the control.
    addClass(getDisabledContentClass(variants));
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
  class: [
    // Trim browser-dependent font metrics to center the capitals. Padding
    // restores the line height only where text-box is supported; untrimmable
    // elements still gain padding.
    // https://github.com/ariakit/ariakit/issues/7592
    "[text-box:cap_alphabetic] supports-[text-box:cap_alphabetic]:py-[calc((1lh-1cap)/2)]",
    // Compensate for padding rounded down to the browser layout unit.
    "min-h-lh",
  ],
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
