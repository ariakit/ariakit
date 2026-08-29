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
    // Zeroing it here is also what honours reduced motion for the whole
    // subtree: no disclosure animation carries meaning the end state does not
    // already carry, so every descendant that spends this channel stops.
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
     * areas: the content gets its own top border and padding. The explicit
     * false value keeps nested disclosures from inheriting an ancestor's
     * split flag.
     */
    $split: {
      true: "[--disclosure-split:1]",
      false: "[--disclosure-split:0]",
    },
    /**
     * Keeps the content's own top padding, which is what holds it away from
     * the button. A split layout implies it. Set it on any other layout that
     * spaces the content itself: the button then stops painting a hover ramp
     * across its bottom padding, because there is nothing left to soften.
     */
    $contentPadding: {
      true: "[--disclosure-content-padding:1]",
      false: "[--disclosure-content-padding:0]",
    },
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
    // The map's false key gives this an implicit static default, so `??`
    // never fires and the value has to be tested instead.
    $contentPadding(defaultValue, variants) {
      if (defaultValue) return defaultValue;
      return !!variants.$split;
    },
  },
});

export const disclosureButton = cv({
  extend: [button],
  class: [
    "overflow-clip w-full justify-start text-wrap text-start",
    "transition-[border-radius,--tw-gradient-from-position]",
    // Only a split disclosure moves its corners, but every disclosure moves
    // the hover ramp below. Both run at half speed and wait for the content
    // to finish closing before they come back.
    "duration-[calc(var(--disclosure-duration)*0.5)]",
    "delay-[calc(var(--disclosure-duration)/1.5)]",
    // Guides and icons indent the start padding through --disclosure-ps;
    // the fallback is the control's own resolved padding so this longhand
    // wins over the control px shorthand without changing anything until a
    // guide or icon sets the indent.
    "ps-(--disclosure-ps,var(--control-px))",
    // With an icon, the start padding falls back to the frame padding
    // instead of the control padding, so the content body's indent formula
    // (icon size plus twice the padding) lines up with the label.
    "[@container_style(--disclosure-icon-size)]:ps-(--disclosure-ps,var(--disclosure-padding))",
    "ui-disclosure-group:rounded-[inherit]",
    // An icon slot sets the gap that aligns content with the label.
    "[@container_style(--disclosure-icon-size)]:gap-(--disclosure-padding)",
    "ui-disclosure-open:delay-0",
    // Only a split disclosure draws a rule under the button, so only there do
    // the bottom corners square off. Written out as a style query, it sorts
    // after every named variant and so beats the inherited radius above.
    "[@container_style(--disclosure-split:_1)]:ui-disclosure-open:rounded-b-none",
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
    // The button covers the disclosure surface and paints the same layer, so
    // it is invisible until the control's own hover offset lifts it.
    $lightnessOffset: false,
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
  refine({ variants, addClass }) {
    // The ramp repaints the hover surface, so it runs only where the button
    // paints a flat one of its own: a bevel spends the same gradient
    // channels, and a ghost button has nothing to fade.
    if (variants.$kind === "bevel") return;
    if (variants.$layer === "ghost") return;
    addClass([
      // When the content spaces itself there is nothing to soften, so the
      // ramp collapses to zero and the paint stays a flat fill. Otherwise the
      // button's own bottom padding is all that sits between its label and
      // the first line of the content, and the paint ramps out across twice
      // that, so the fade is already under way before it reaches the gap and
      // the boundary itself carries no step.
      "[--disclosure-hover-fade:calc(var(--py,0px)*2*var(--disclosure-open,0)*(1-var(--disclosure-content-padding,0)))]",
      // The stop sits outside the hover variants so that hovering only
      // switches the paint on, without animating the ramp in with it. Opening
      // and closing move it, on the schedule the corners above already use.
      "from-[calc(100%-var(--disclosure-hover-fade))]",
      // The layer paints an opaque background that the last stop would sit
      // under, so the fill has to be handed over to the gradient entirely.
      "ui-hover:bg-transparent ui-hover:bg-linear-to-b",
      "ui-hover:from-(--ak-layer) ui-hover:to-transparent",
    ]);
  },
});

// The icon slot consumes the size the root's $iconSize publishes.
export const disclosureIcon = cv({
  class: [
    "min-h-lh size-(--disclosure-icon-size) flex-none",
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
    // The line collapses in a third of the time the rotation takes.
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
    "transition-discrete",
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
    "pbs-[calc(var(--ak-frame-padding)*var(--disclosure-content-padding,0))]",
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
    "h-lh relative mt-[-0.1875rem] ms-auto",
    // Extend the hit area so the actions stay clickable without growing the
    // row.
    "before:absolute before:-inset-4 before:inset-s-0",
  ],
});
