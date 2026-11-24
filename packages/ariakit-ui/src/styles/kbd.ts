import { cv } from "clava";
import { hasLayerBackground } from "./layer.ts";
import { textFrame } from "./text-frame.ts";

/**
 * A keyboard key that scales with the surrounding text. `plain` draws only the
 * key text, muted, as in shortcut slots. `keycap` draws a raised key for prose,
 * and `flat` a filled chip with the optical padding of a text frame. A flat key
 * or a keycap in a control slot fills the slot, so the slot `$size` sets its
 * size, and its corners stay concentric with the control.
 */
export const kbd = cv({
  extend: [textFrame],
  class: [
    "ui-kbd",
    // Monospace fonts draw ⌘ much smaller than letters.
    "font-sans",
  ],
  variants: {
    /**
     * Sets how the key is drawn. Only `flat` uses the `$p`, `$px`, and
     * `$rounded` frame variants.
     * @default "plain"
     */
    $kind: {
      keycap: [
        "ui-kbd--kind-keycap",
        // Stays a class to come after the padding of `textFrame`, which it
        // replaces.
        "px-1 py-0",
        // Browsers round borders down to device pixels. Keep the bottom lip at
        // least 2px so it remains thicker than the top hairline.
        // Stays a class, so that the border-style of `frameBase` still comes
        // after it and replaces it.
        "border-t-0 border-x-0 border-b-[max(2px,0.15em)]",
        // Dark parent surfaces need a deeper lip and lifted ring.
        // Stays a class to come after the border-style of `frameBase`, which it
        // replaces.
        "ak-dark:border-b-[max(1px,0.2em)]",
      ],
      flat: [
        "ui-kbd--kind-flat",
        // Stays a class to come after the padding of `textFrame`, which it
        // replaces.
        "supports-[text-box:cap_alphabetic]:py-[calc(var(--py)+(1lh-1cap)/2)]",
      ],
      plain: "ui-kbd--kind-plain",
    },
  },
  defaultVariants: {
    $kind: "plain",
    // The keycap draws its own padding, corners, and border with the lip.
    $frame(defaultValue, variants) {
      if (variants.$kind === "keycap") return false;
      return defaultValue;
    },
    $p(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // Scale the chip padding with the key text, like the keycap geometry. The
      // flat text size depends on this value.
      if (variants.$kind === "flat") return "0.15em";
      // Plain text lines up with the text around it.
      return "none";
    },
    $px(defaultValue, variants) {
      if (variants.$kind !== "flat") return defaultValue;
      // Replace only the text frame default; explicit padding still wins.
      if (defaultValue !== "md") return defaultValue;
      // Match the space above and below the capitals. Glyph side bearings
      // already add about 0.06em on each side. In a slot, the slot height sets
      // that space.
      return "var(--kbd-slot-px, calc(var(--ak-frame-padding) + (1lh - 1cap) / 2 - 0.06em))";
    },
    $rounded(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$kind !== "flat") return defaultValue;
      return "0.3em";
    },
    $layer(defaultValue, variants) {
      // Replace only frame's transparent default; preserve explicit colors.
      if (defaultValue !== "transparent") return defaultValue;
      if (variants.$kind === "plain") return defaultValue;
      return true;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$kind === "plain") return defaultValue;
      // An offset would repaint a transparent key face.
      if (variants.$layer === "transparent") return false;
      if (variants.$kind === "flat") return true;
      return 2;
    },
    $ink(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // Without a surface, muted text tells the keys apart from the label.
      if (variants.$kind === "plain") return 60;
      return defaultValue;
    },
    // Raw edges keep the edge style recipe's cleared defaults.
    $edgeWeight(defaultValue, variants) {
      if (variants.$kind !== "keycap") return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? "var(--kbd-edge-alpha)";
    },
    $edgeLighten(defaultValue, variants) {
      if (variants.$kind !== "keycap") return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? 60;
    },
    $edgePush(defaultValue, variants) {
      if (variants.$kind !== "keycap") return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      // Push named edge colors before lightening so their rings retain the
      // neutral ring's lightness. This replaces the edge's zero push for them.
      return 100;
    },
  },
  refine({ variants, addClass }) {
    // Forced colors remove the fill, which is a flat key's only boundary.
    if (variants.$kind !== "flat") return;
    if (variants.$border != null) return;
    if (!hasLayerBackground(variants)) return;
    addClass("forced-colors:ak-frame-border");
  },
});
