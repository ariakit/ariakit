import { cv } from "clava";
import { button } from "./button.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";

export const disclosureGroup = cv({
  extend: [frame],
  class: ["[--disclosure-group:1]", "border-y divide-y divide-(--ak-edge)"],
  defaultVariants: {
    // Legacy ak-frame-none/card: square corners with card padding driving
    // the nested disclosures' cover geometry.
    $rounded: "none",
    $p: 4,
  },
});

// TODO: Consider extending frame so the root exposes $p/$rounded directly
// instead of relying on consumer-applied ak-frame classes.
export const disclosure = cv({
  extend: [layer],
  class: [
    "p-0! max-w-[inherit] transition-none duration-300 motion-reduce:duration-0",
    // State flags read by descendants through container style queries, and
    // frame-derived values captured before nested frames change them.
    "[--disclosure-open:0]",
    "[--disclosure-padding:var(--ak-frame-padding)]",
    "[--disclosure-radius:var(--ak-frame-radius)]",
    "[--disclosure-border:calc(var(--ak-frame-border)+var(--ak-frame-ring))]",
    "[--disclosure-duration:var(--tw-duration)]",
    // Open is signalled by native details or by the wrapper's data-open.
    "open:[--disclosure-open:1] data-open:[--disclosure-open:1]",
    // Inside a group the disclosure covers the group frame.
    "ui-disclosure-group:ak-frame ui-disclosure-group:ak-frame-cover",
  ],
  variants: {
    /**
     * Applies a split layout that visually separates the button and content
     * areas: the content gets its own top border and padding, and hover
     * feedback moves from the whole disclosure to the button. The explicit
     * false value keeps nested disclosures from inheriting an ancestor's
     * split flag.
     */
    $split: {
      true: "[--disclosure-split:1]",
      false: "[--disclosure-split:0]",
    },
    /**
     * Highlights the whole disclosure while its button is hovered. Split
     * layouts turn this off and highlight the button instead.
     */
    $hoverHighlight:
      "ui-disclosure-hover:ak-layer ui-disclosure-hover:ak-state-6",
    /**
     * Sets the size of the button's icon slot and publishes it so the
     * button gap and the content indentation align with it. It must live on
     * the root: the consumers are container style queries, which read the
     * nearest ancestor container, never the element that sets the property.
     * Numbers scale the spacing token.
     */
    $iconSize(value?: (string & {}) | number) {
      if (value == null) return;
      const size =
        typeof value === "number" ? `calc(var(--spacing) * (${value}))` : value;
      return {
        style: { "--disclosure-icon-size": size },
      };
    },
  },
  defaultVariants: {
    // A JS default rather than CSS: the root can't gate on its own split
    // flag with a container style query (those read ancestors only), and
    // the legacy ak-state-0-over-ak-state-6 cascade trick doesn't port
    // since Tailwind sorts state-0 before state-6.
    $hoverHighlight(defaultValue, variants) {
      if (variants.$split) return false;
      return defaultValue ?? true;
    },
  },
});

export const disclosureButton = cv({
  extend: [button],
  class: [
    "overflow-clip w-full justify-start text-wrap text-start",
    "-outline-offset-2 transition-[border-radius]",
    // The button radius stays concentric with the disclosure frame minus
    // its border.
    "[--disclosure-button-radius:calc(var(--disclosure-radius)-var(--disclosure-border))]",
    "ak-frame-(--disclosure-button-radius)",
    // Guides and icons indent the start padding through --disclosure-ps;
    // the fallback is the control's own resolved padding so this longhand
    // wins over the control px shorthand without changing anything until a
    // guide or icon sets the indent.
    "ps-(--disclosure-ps,var(--control-px))",
    // With an icon, the start padding falls back to the frame padding
    // instead of the control padding, so the content body's indent formula
    // (icon size plus twice the padding) lines up with the label exactly
    // like the legacy geometry.
    "[@container_style(--disclosure-icon-size)]:ps-(--disclosure-ps,var(--disclosure-padding))",
    // The corner transition runs at half speed and waits for the content to
    // collapse before restoring the bottom corners.
    "[transition-duration:calc(var(--disclosure-duration)*0.5)]",
    "[transition-delay:calc(var(--disclosure-duration)/1.5)]",
    "ui-disclosure-group:rounded-[inherit]",
    // An icon slot sets the gap that aligns content with the label.
    "[@container_style(--disclosure-icon-size)]:gap-(--disclosure-padding)",
    "ui-disclosure-open:rounded-b-none ui-disclosure-open:delay-0",
    // The stacked form must repeat the corner reset: the single-variant
    // rounded-[inherit] above would otherwise win over rounded-b-none by
    // stylesheet order in rounded groups.
    "ui-disclosure-group:ui-disclosure-open:rounded-b-none",
    // Split moves hover feedback onto the button; the ghost layer's
    // bg-transparent must be restored for the state paint to show.
    "ui-disclosure-split:ui-hover:bg-(--ak-layer)",
    "ui-disclosure-split:ui-hover:ak-state-6",
  ],
  variants: {
    /**
     * Extends the control's gap values with `auto`, which follows the
     * disclosure frame: half the padding, never tighter than the base
     * spacing step, like the legacy ak-button gap.
     */
    $gap: {
      auto: [
        "[--gap:max(--spacing(2),var(--disclosure-padding)/2)]",
        "gap-(--gap)",
      ],
    },
  },
  defaultVariants: {
    // The button is a transparent region of the disclosure surface; hover
    // paints the root (or the button itself when split) via the classes
    // above.
    $layer: "ghost",
    $hoverOffset: false,
    // The button padding follows the disclosure frame it covers.
    $p: "var(--disclosure-padding)",
    // The auto gap keeps the indicator close to the label; the control's
    // padding-derived default is nearly twice the legacy gap.
    $gap: "auto",
    $rounded: "unset",
    $forceRounded: true,
    // Wide press target: scale less horizontally, like the legacy
    // ak-command-depth-x-3.
    $activeDepthX: 3,
  },
});

// The icon slot consumes the size the root's $iconSize publishes.
export const disclosureIcon = cv({
  class: [
    "min-h-[1lh] size-(--disclosure-icon-size) flex-none",
    "self-start [&>svg]:size-full",
  ],
});

const indicatorBase = [
  "flex-none self-start",
  "[block-size:max(1lh,var(--disclosure-icon-size,0px))]",
];

export const disclosureChevron = cv({
  class: [
    ...indicatorBase,
    "transition-[rotate,opacity]",
    "[transition-duration:var(--disclosure-duration)]",
    "[--disclosure-chevron-size:1.1em]",
    "w-(--disclosure-chevron-size) [&>svg]:size-(--disclosure-chevron-size)",
    "[&>svg]:block [&>svg]:h-full",
  ],
  variants: {
    /**
     * Selects the closed-state direction the chevron points to. Both rotate
     * to point down when open.
     */
    $direction: {
      right: ["-rotate-90", "ui-disclosure-open:rotate-0"],
      down: ["rotate-0", "ui-disclosure-open:rotate-180"],
    },
  },
  defaultVariants: {
    $direction: "right",
  },
});

export const disclosurePlus = cv({
  class: [
    ...indicatorBase,
    "w-[1lh] rounded-full",
    "transition-[rotate,background-size,opacity]",
    "[--plus-line-thickness:2px]",
    "[transition-duration:var(--disclosure-duration),calc(var(--disclosure-duration)/3)]",
    // The crosshair is two currentColor gradient lines; open collapses the
    // horizontal one and rotates the remaining line for a plus → minus feel.
    "bg-[linear-gradient(currentColor_0_0),linear-gradient(currentColor_0_0)]",
    "bg-no-repeat bg-position-[50%_50%]",
    "bg-size-[60%_var(--plus-line-thickness),var(--plus-line-thickness)_60%]",
    "ui-disclosure-open:rotate-90",
    "ui-disclosure-open:bg-size-[var(--plus-line-thickness)_60%]",
  ],
});

export const disclosureContent = cv({
  class: [
    "relative z-1 max-h-0 overflow-clip rounded-b-[inherit] p-0",
    "transition-[content-visibility,height,max-height]",
    "[--disclosure-group:0]",
    "[transition-behavior:allow-discrete]",
    "[interpolate-size:allow-keywords]",
    // Only animate when the browser can interpolate to max-content.
    "supports-[interpolate-size:allow-keywords]:[transition-duration:var(--disclosure-duration)]",
    // Entering the page open must not animate unless the user is already
    // interacting with it.
    "[html:focus-within_&]:starting:max-h-0",
    "[@container_style(--disclosure-icon-size)]:[--disclosure-ps:calc(var(--disclosure-icon-size)+var(--disclosure-padding)*2)]",
    // Open channels: native details, Ariakit data attribute, or the root
    // flag.
    "[[open]>&]:max-h-max data-open:max-h-max ui-disclosure-open:max-h-max",
  ],
  variants: {
    /**
     * Draws a vertical guide line under the indicator and indents the
     * content to align with the label.
     */
    $guide: [
      "[--disclosure-guide-shift:var(--disclosure-icon-size,--spacing(4))]",
      "[--disclosure-ps:calc(var(--disclosure-guide-shift)+var(--disclosure-padding)*2)]",
      "before:content-[''] before:absolute before:border-e before:ak-layer",
      "before:[inset-block:0]",
      "before:[inset-inline-start:calc(var(--disclosure-padding)+var(--disclosure-guide-shift)*0.5)]",
    ],
  },
});

export const disclosureContentBody = cv({
  extend: [layer],
  class: [
    "rounded-b-[inherit]",
    // Nested disclosures inside the body measure their own icons: initial
    // restores the guaranteed-invalid state so presence queries and var()
    // fallbacks reset (the legacy unset was a no-op — unset means inherit
    // for inherited custom properties).
    "[--disclosure-icon-size:initial]",
    "p-(--ak-frame-padding)",
    "[padding-inline-start:var(--disclosure-ps,var(--ak-frame-padding))]",
    // Split adds the separating padding and border between button and body.
    "[padding-block-start:calc(var(--ak-frame-padding)*var(--disclosure-split,0))]",
    "[border-block-start-width:calc(var(--disclosure-border)*var(--disclosure-split,0))]",
  ],
});

export const disclosureActions = cv({
  class: [
    "h-[1lh] relative -mt-[0.1875rem] ms-auto",
    // Extend the hit area so the actions stay clickable without growing the
    // row.
    "before:content-[''] before:absolute before:-inset-4 before:start-0",
  ],
});
