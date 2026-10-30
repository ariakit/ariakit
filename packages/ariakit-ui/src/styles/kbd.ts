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
    // Monospace fonts draw ⌘ much smaller than letters.
    "font-sans",
    // Keep key chords left-to-right in right-to-left text.
    "[direction:ltr] [unicode-bidi:isolate]",
    // Keep keys compact when flex or grid placement uses their line box.
    "leading-none whitespace-nowrap",
    // Size icon keys like the letters beside them.
    "[&>svg]:size-[1em] [&>svg]:flex-none",
  ],
  variants: {
    /**
     * Sets how the key is drawn. Only `flat` uses the `$p`, `$px`, and
     * `$rounded` frame variants.
     * @default "plain"
     */
    $kind: {
      keycap: [
        // Size the cap by the x-height of the font that renders, so it does not
        // jump when a web font swaps in for a fallback. The em-based geometry
        // follows, which shrinks Inter caps to about 0.79em.
        "[font-size-adjust:0.49]",
        // Leave room for the lip and ring, including Firefox's taller font
        // box, without increasing paragraph line spacing.
        "[:where(&)]:text-[0.875em]",
        // Lift the cap so its face and label center on the surrounding
        // capitals, and the lip hangs below like a shadow. Centering the whole
        // box with the lip reads low in large text.
        // https://github.com/ariakit/ariakit/pull/7495#discussion_r3998720431
        "align-[0.08em]",
        "px-1 py-0",
        // Browsers round borders down to device pixels. Keep the bottom lip at
        // least 2px so it remains thicker than the top hairline.
        "border-t-0 border-x-0 border-b-[max(2px,0.15em)]",
        // Query the key's own layer for its top edge, including inverted keys,
        // without adding height.
        "relative before:absolute before:inset-0 before:rounded-[inherit]",
        "before:pointer-events-none ak-light:before:border-t-[max(1px,0.067em)]",
        "before:border-t-white",
        // Read the key face, which can differ from the parent scheme. This 0–1
        // flag contains channel math resolved inside relative colors.
        "[--kbd-light-face:clamp(0,(l-0.65)*100,1)]",
        // Shade the lip from the face, independently of the ring. Light faces
        // need a larger lightness difference.
        "border-b-[oklch(from_var(--ak-layer)_calc(l-0.08-0.09*var(--kbd-light-face))_c_h)]",
        // Keep lower corners concentric with the thicker lip.
        "rounded-t-[0.27em] rounded-b-[0.34em]",
        // Lighten the lower face more on dark keys to show the recessed shape.
        "bg-linear-to-b from-transparent",
        "to-[oklch(from_var(--ak-layer)_calc(l+0.08-0.03*var(--kbd-light-face))_c_h)]",
        // Close the borderless sides with a hairline shadow.
        "shadow-[0_0_0_max(1px,0.034em)_var(--ak-edge)]",
        // Pass scheme-specific opacity through the $edgeWeight default so
        // caller values replace it.
        "[--kbd-edge-alpha:100] ak-dark:[--kbd-edge-alpha:16]",
        // Dark parent surfaces need a deeper lip and lifted ring.
        "ak-dark:border-b-[max(1px,0.2em)]",
        "ak-dark:rounded-b-[0.4em]",
        "ak-dark:shadow-[0_min(-1px,-0.06em)_var(--ak-edge),0_0_0_max(1px,0.06em)_var(--ak-edge)]",
        // In a slot, fill its height, so the slot size sets the cap size. The
        // text grows with the slot up to the surrounding size, and the sides
        // keep the space above and below the capitals on the face, above the
        // lip. The corners stay concentric with the control through the radius
        // the slot frame resolves.
        "[.slot-frame-slot>&]:self-stretch [.slot-frame-slot>&]:content-center",
        "[.slot-frame-slot>&]:text-[min(1em,max(0.875em,var(--slot-height)-max(2px,0.15em)))]",
        "[.slot-frame-slot>&]:px-[calc((var(--slot-height)-max(2px,0.15em)-1cap)/2-0.06em)]",
        "[.slot-frame-slot>&]:rounded-[max(0.125em,var(--ak-frame-radius))]",
      ],
      flat: [
        // With 0.15em padding around the capitals, the chip is 1.3 times its
        // text size. This size makes it as tall as the surrounding em box, so
        // it fills a slot like an icon and never pushes lines apart.
        "[:where(&)]:text-[calc(1em/1.3)]",
        // Trim the line box to the capitals, so they center in the chip.
        // Rounded font metrics otherwise lift them by up to a pixel. Padding
        // restores the height where trimming is supported.
        // https://github.com/ariakit/ariakit/issues/7592
        "inline-block [text-box:cap_alphabetic]",
        "supports-[text-box:cap_alphabetic]:py-[calc(var(--py)+(1lh-1cap)/2)]",
        // Size icon keys like the capitals and center them on the text.
        "[&>svg]:inline-block [&>svg]:align-[calc((1cap-1em)/2)]",
        // Center the capitals on the surrounding ones, which are 1.3 times
        // taller: half the difference is 0.15 of the key's capital height.
        "align-[calc(1cap*0.15)]",
        // In a slot, fill its height like an icon, so the slot size sets the
        // chip size. The text grows with the slot up to the keycap size, and
        // the sides keep the space above and below the capitals.
        "[.slot-frame-slot>&]:self-stretch [.slot-frame-slot>&]:content-center",
        "[.slot-frame-slot>&]:text-[min(0.875em,var(--slot-height)/1.3)]",
        // Outside a slot, a key sits inside text, not along the edges of its
        // parent frame, so its corners do not follow the parent's. In a slot,
        // the frame keeps them concentric with the control.
        "[&:not(.slot-frame-slot>*)]:ak-frame-force",
        // The default $px reads this side padding, which fits the slot height.
        "[.slot-frame-slot>&]:[--kbd-slot-px:calc((var(--slot-height)-1cap)/2-0.06em)]",
      ],
      plain: "inline-flex items-center",
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
