import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button } from "./button.ts";
import { edge } from "./edge.ts";
import { frame } from "./frame.ts";
import { prose } from "./prose.ts";

export const disclosureGroup = cv({
  extend: [frame],
  class: ["[--disclosure-group:1]", "border-y divide-y divide-(--ak-edge)"],
  defaultVariants: {
    // The group runs edge to edge, so it takes no corners of its own. Its
    // padding is the one every member spends, because each of them covers
    // this frame.
    $rounded: "none",
    $p: 4,
  },
});

export const disclosure = cv({
  extend: [frame],
  class: [
    // The frame publishes the padding, radius and border channels that the
    // button and the body spend. The root holds no content of its own, so it
    // must not spend the padding itself, and the important flag keeps a
    // caller's padding utility from putting it back.
    "p-0!",
    "max-w-[inherit]",
    // The root itself never animates. The duration is published for the
    // descendants that do: --tw-duration does not inherit, so it has to be
    // copied into a plain custom property to reach them, and a caller can
    // retime the whole disclosure by passing another duration-* utility.
    "transition-none duration-300 motion-reduce:duration-0",
    "[--disclosure-duration:var(--tw-duration)]",
    // State flags read by descendants through container style queries, and
    // frame-derived values captured before nested frames change them.
    "[--disclosure-open:0]",
    "[--disclosure-padding:var(--ak-frame-padding)]",
    "[--disclosure-radius:var(--ak-frame-radius)]",
    "[--disclosure-border:calc(var(--ak-frame-border)+var(--ak-frame-ring))]",
    // Open is signalled by native details or by the wrapper's data-open.
    "open:[--disclosure-open:1] data-open:[--disclosure-open:1]",
    // Inside a group the disclosure covers the group frame, which is where
    // its radius and padding then come from. Leave $rounded and $p unset on
    // a group member: both sort after this line and would win over it.
    "ui-disclosure-group:ak-frame-cover",
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
    $iconSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--disclosure-icon-size": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    // A computed default rather than a CSS rule: a style query matches the
    // nearest ancestor container, never the element that sets the property,
    // so the root cannot gate this on its own split flag.
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
    "transition-[border-radius]",
    // Guides and icons indent the start padding through --disclosure-ps;
    // the fallback is the control's own resolved padding so this longhand
    // wins over the control px shorthand without changing anything until a
    // guide or icon sets the indent.
    "ps-(--disclosure-ps,var(--control-px))",
    // With an icon, the start padding falls back to the frame padding
    // instead of the control padding, so the content body's indent formula
    // (icon size plus twice the padding) lines up with the label.
    "[@container_style(--disclosure-icon-size)]:ps-(--disclosure-ps,var(--disclosure-padding))",
    // The corner transition runs at half speed and waits for the content to
    // collapse before restoring the bottom corners.
    "duration-[calc(var(--disclosure-duration)*0.5)]",
    "delay-[calc(var(--disclosure-duration)/1.5)]",
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
     * Extends the control's radius values with `auto`, which stays
     * concentric with the disclosure frame minus its border.
     */
    $rounded: {
      auto: [
        "[--disclosure-button-radius:calc(var(--disclosure-radius)-var(--disclosure-border))]",
        "ak-frame-(--disclosure-button-radius)",
      ],
    },
    /**
     * Extends the control's gap values with `auto`, which follows the
     * disclosure frame: half the padding, never tighter than the base
     * spacing step.
     */
    $gap: {
      auto: [
        "[--gap:max(--spacing(2),var(--disclosure-padding)/2)]",
        "gap-(--gap)",
      ],
    },
    /**
     * Extends the focus ring offsets with `inset`, which draws the ring
     * inside the button rather than over the disclosure edge it covers.
     */
    $focusOffset: {
      inset: "-outline-offset-2",
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
    // padding-derived default is nearly twice as wide.
    $gap: "auto",
    $rounded: "auto",
    $forceRounded: true,
    $focusOffset: "inset",
    // Wide press target: scales less horizontally than it does vertically.
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

const indicatorBase = cx(
  "flex-none self-start",
  "h-[max(1lh,var(--disclosure-icon-size,0px))]",
);

export const disclosureChevron = cv({
  class: [
    indicatorBase,
    "transition-[rotate,opacity] duration-(--disclosure-duration)",
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
    indicatorBase,
    "w-[1lh] rounded-full",
    "transition-[rotate,background-size,opacity]",
    "[--plus-line-thickness:2px]",
    "duration-[var(--disclosure-duration),calc(var(--disclosure-duration)/3)]",
    // The crosshair is two currentColor gradient lines; open collapses the
    // horizontal one and rotates the remaining line for a plus → minus feel.
    "bg-[linear-gradient(currentColor_0_0),linear-gradient(currentColor_0_0)]",
    "bg-no-repeat bg-center",
    "bg-size-[60%_var(--plus-line-thickness),var(--plus-line-thickness)_60%]",
    "ui-disclosure-open:rotate-90",
    "ui-disclosure-open:bg-size-[var(--plus-line-thickness)_60%]",
  ],
});

export const disclosureContent = cv({
  class: [
    "relative z-1 max-h-0 overflow-clip rounded-b-[inherit]",
    "transition-[content-visibility,height,max-height]",
    // A disclosure nested in the content is not a member of the group around
    // it, so the flag stops here.
    "[--disclosure-group:0]",
    "[transition-behavior:allow-discrete]",
    "[interpolate-size:allow-keywords]",
    // Only animate when the browser can interpolate to max-content.
    "supports-[interpolate-size:allow-keywords]:duration-(--disclosure-duration)",
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
      "before:absolute before:border-e before:ak-layer",
      "before:inset-y-0",
      "before:inset-s-[calc(var(--disclosure-padding)+var(--disclosure-guide-shift)*0.5)]",
    ],
  },
});

// The content body doubling as a prose column, with the rhythm gap capped by
// the frame padding so a tight disclosure does not open into loose text.
const disclosureProse = cv({
  extend: [prose],
  defaultVariants: {
    $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
  },
});

export const disclosureContentBody = cv({
  extend: [edge],
  class: [
    "rounded-b-[inherit]",
    // Nested disclosures inside the body measure their own icons: initial
    // restores the guaranteed-invalid state so presence queries and var()
    // fallbacks reset. `unset` cannot do this, because for a custom property
    // it means inherit.
    "[--disclosure-icon-size:initial]",
    "p-(--ak-frame-padding)",
    "ps-(--disclosure-ps,var(--ak-frame-padding))",
    // Split adds the separating padding and border between button and body.
    "pbs-[calc(var(--ak-frame-padding)*var(--disclosure-split,0))]",
    "border-bs-[calc(var(--disclosure-border)*var(--disclosure-split,0))]",
  ],
  variants: {
    /**
     * Applies prose typography and spacing with the frame-capped rhythm
     * gap.
     */
    $prose(value?: boolean) {
      if (!value) return;
      return disclosureProse({});
    },
  },
});

export const disclosureActions = cv({
  class: [
    "h-[1lh] relative -mt-[0.1875rem] ms-auto",
    // Extend the hit area so the actions stay clickable without growing the
    // row.
    "before:absolute before:-inset-4 before:start-0",
  ],
});
