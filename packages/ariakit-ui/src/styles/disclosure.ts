import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { edge } from "./edge.ts";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
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
    // Where the label starts with nothing before it: the button is a
    // control and spends the frame padding plus the control's extra side
    // padding (see --px in control.ts, at its default scale). The body
    // starts here too. A button given a $size or $px of its own moves its
    // label alone.
    "[--disclosure-px:calc(var(--disclosure-padding)+(1lh-1cap)*0.5)]",
    // A start indent set by a content or a list root inherits, so a nested
    // disclosure clears it before its own content sets one. A list root
    // sets its own through the style attribute, which wins over this.
    "[--disclosure-ps:initial]",
    // The gap between a slot and the label, before the button adds the
    // extra side padding back (see $gap below). The body spends it too, so
    // a body under an icon lands on the label.
    "[--disclosure-gap:max(--spacing(2),var(--disclosure-padding)/2)]",
    // Where the label starts when a slot leads it. A slot starts one padding
    // in and, with the gap above, ends the label one line plus the gap past
    // it whatever the icon size (see disclosureIcon); an icon wider than the
    // line pushes the label over by its far-side overflow. These three are
    // registered as lengths (see ariakit.css), so they are measured in the
    // root's own line box and font once, and a body with a line height of
    // its own, such as prose, still lands on the label. The button is
    // expected to keep the root's line height.
    "[--disclosure-lead:calc(var(--disclosure-padding)+1lh+var(--disclosure-gap)+max(0px,(var(--disclosure-icon-size,1em)-1lh)/2))]",
    // Whether an icon leads the label; the content reads it through a style
    // query to indent past the icon. Custom properties inherit, so a nested
    // disclosure clears it before it tests its own button. :where() keeps
    // the rule at utility weight, so it wins by order alone.
    "[--disclosure-icon:0]",
    "[&:has(>:where(.disclosure-button)>:where(.disclosure-icon))]:[--disclosure-icon:1]",
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
     * Sets the size of the button's icon slot, which otherwise takes the
     * text size. It must live on the root: the slot and the content read it
     * as an inherited property, and the content's indent is computed here.
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
    // The map's false key gives this an implicit constant default, so `??`
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
    "disclosure-button overflow-clip w-full justify-start text-wrap text-start",
    // Guides and lists indent the start padding through --disclosure-ps; the
    // fallback is the control's own resolved padding so this longhand wins
    // over the control px shorthand without changing anything until a guide
    // or a list sets the indent.
    "ps-(--disclosure-ps,var(--px))",
    "ui-disclosure-group:rounded-[inherit]",
    // Only a split disclosure draws a rule under the button, so only there do
    // the bottom corners square off. Written out as a style query, it sorts
    // after every named variant and so beats the inherited radius above.
    "[@container_style(--disclosure-split:_1)]:ui-disclosure-open:rounded-b-none",
  ],
  variants: {
    /**
     * Whether the button animates its own corners and hover ramp. Set it to
     * `false` on a row that runs timings of its own, such as a nav row in a
     * collapsing sidebar, so the two do not have to fight over the cascade.
     */
    $transition: [
      "transition-[border-radius,--tw-gradient-from-position]",
      // Only a split disclosure moves its corners, but every disclosure moves
      // the hover ramp below. Both run at half speed and wait for the content
      // to finish closing before they come back.
      "duration-[calc(var(--disclosure-duration)*0.5)]",
      "delay-[calc(var(--disclosure-duration)/1.5)]",
      "ui-disclosure-open:delay-0",
    ],
    /**
     * Sets the button's border radius. Takes a named step from `none` to
     * `4xl`, `full`, any length or expression such as `var(--my-radius)`, or
     * `auto`, which stays concentric with the disclosure frame minus its
     * border.
     */
    $rounded(value?: FrameRoundedValue | "auto" | (string & {})) {
      if (value !== "auto") return getFrameRoundedClass(value);
      return [
        "[--disclosure-button-radius:calc(var(--disclosure-radius)-var(--disclosure-border))]",
        "ak-frame-(--disclosure-button-radius)",
      ];
    },
    /**
     * Extends the control's gap values with `auto`, which follows the
     * disclosure frame: half the padding, never tighter than the base
     * spacing step, measured from the slot's icon. The content body indents
     * by the same gap, so keep `auto` where a body has to line up with the
     * label.
     */
    $gap: {
      // A slot pulls its box in by the control's extra side padding (its
      // margin is py - px plus its own centring), so the gap adds that extra
      // back: the label then sits one line plus the root's gap past the
      // padding, where the body expects it, whatever the padding scale.
      auto: "[--gap:calc(var(--disclosure-gap)+var(--px)-var(--py))] gap-(--gap)",
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
    $transition: true,
    // The button padding follows the disclosure frame it covers, plus the
    // control's own extra side padding, which the root publishes as
    // --disclosure-px for the body.
    $p: "var(--disclosure-padding)",
    $gap: "auto",
    $rounded: "auto",
    $forceRounded: true,
    $focusOffset: "inset",
    // Wide press target: scales less horizontally than it does vertically.
    $activeDepthX: 3,
  },
  refine({ variants, addClass }) {
    // The ramp repaints the hover surface, so it runs only where the button
    // paints a flat one: a bevel spends the same gradient channels.
    if (variants.$kind === "bevel") return;
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

// The icon is a control slot, so it takes the size and the first-line
// alignment every other control icon gets. A slot starts one padding in,
// and its margins take the control's extra side padding off its box, which
// the button's gap adds back (see $gap there): the label after it lands
// where --disclosure-lead says, whatever the icon size is.
export const disclosureIcon = cv({
  extend: [buttonSlot],
  class: [
    "disclosure-icon",
    // The root's $iconSize sizes the slot; otherwise the text size does.
    "[--size:var(--disclosure-icon-size,1em)]",
    // An icon wider than the line overflows its box on both sides. The end
    // margin grows by the far-side overflow so the gap to the label holds,
    // and --disclosure-lead adds the same amount for the body.
    "me-[calc(var(--mx)+max(0px,(var(--size)-1lh)/2))]",
  ],
  defaultVariants: {
    // The size comes from the class above, not from a named step.
    $size: "unset",
  },
});

export const disclosureChevron = cv({
  extend: [buttonSlot],
  class: [
    "transition-[rotate,opacity] duration-(--disclosure-duration)",
    // The glyph runs a little past the text size; the slot box stays a named
    // step, which only decides where the glyph centres.
    "[--slot-icon-size:1.1em]",
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
    $size: "lg",
  },
});

export const disclosurePlus = cv({
  extend: [buttonSlot],
  class: [
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
  defaultVariants: {
    // A full line box, so the cross drawn across it keeps its size beside
    // the text.
    $size: "xl",
    $rounded: "full",
    // A line-sized slot normally spaces its label out by a side bearing. The
    // cross fills only part of the box, so the box's own margin is enough,
    // and the label stays where --disclosure-lead puts it.
    $mx: "unset",
  },
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
    // An icon leads the label, so the body indents to the label. The flag is
    // read through a style query so that, without an icon, --disclosure-ps
    // stays free for an indent set on the root, such as a list's.
    "[@container_style(--disclosure-icon:_1)]:[--disclosure-ps:var(--disclosure-lead)]",
    // Open channels: native details, Ariakit data attribute, or the root
    // flag.
    "[[open]>&]:max-h-max data-open:max-h-max ui-disclosure-open:max-h-max",
  ],
  variants: {
    /**
     * Draws a vertical guide line under the indicator and indents the
     * content to align with the label. It counts on a slot leading the
     * label: a start indicator or an icon.
     */
    $guide: [
      "[--disclosure-ps:var(--disclosure-lead)]",
      "before:absolute before:border-e before:ak-layer",
      "before:inset-y-0",
      // Down the middle of the leading slot's column, which is one line wide.
      "before:inset-s-[calc(var(--disclosure-padding)+0.5lh)]",
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
    // The body starts on the label: the start indent a content or a list
    // root set, or else the button's own text inset.
    "[--disclosure-body-ps:var(--disclosure-ps,var(--disclosure-px))]",
    "ps-(--disclosure-body-ps)",
    // A child that covers the frame only reaches back over the frame
    // padding. It has to cross this start padding instead, plus its own
    // border like the frame system adds, to run edge to edge.
    "[&>.ak-frame-cover]:-ms-[calc(var(--disclosure-body-ps)+var(--ak-frame-border))]",
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
