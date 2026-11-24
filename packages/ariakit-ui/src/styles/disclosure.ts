import { cv } from "clava";
import { getContextSpacingValue, getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import { edge } from "./edge.ts";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
import { prose } from "./prose.ts";
import { getIconSlotSize } from "./slot-frame.ts";

/** A shared frame with dividers between disclosures. */
export const disclosureGroup = cv({
  extend: [frame],
  class: "ui-disclosure-group",
  variants: {
    /**
     * Grows the open disclosure into the height that closed ones leave, so its
     * body reaches the group's end, and scrolls the body when its content needs
     * more height. The group grows in a flex column parent, such as a `Nav`
     * with `$fill`, which must have a height. The group's end edge moves below
     * a closed last disclosure.
     */
    $fill: [
      "ui-disclosure-group--fill flex-col",
      // The root disables its own transitions, so the growth transition must
      // take precedence.
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      "*:transition-[flex-grow]! *:flex *:flex-col",
    ],
  },
  defaultVariants: {
    // Members cover this frame and use its padding.
    $rounded: "none",
    $p: 4,
  },
  refine({ variants, addClass }) {
    // Avoid doubling a frame border and offsetting its concentric corners.
    if (variants.$border) return;
    addClass("border-y");
  },
});

/**
 * A disclosure frame that shares geometry and state with its button and
 * content.
 */
export const disclosure = cv({
  extend: [frame],
  class: [
    "ui-disclosure",
    // Stays a class to come after the classes of a caller, so that the reduced
    // motion rule still applies.
    "motion-reduce:duration-0",
    // Cover the group frame; this utility sorts after the member's radius and
    // padding.
    "ui-disclosure-group:ak-frame-cover",
  ],
  variants: {
    /**
     * Separates the button and content with a border and content padding.
     * `false` clears inherited split state.
     */
    $split: {
      true: "[--disclosure-split:1]",
      false: "[--disclosure-split:0]",
    },
    /**
     * Keeps top padding on the content and removes the button's hover fade
     * across that gap. A split layout enables this automatically.
     */
    $contentPadding: {
      true: "ui-disclosure--content-padding-true",
      false: "ui-disclosure--content-padding-false",
    },
    /**
     * Sets the button icon size and body indentation from the root. Defaults to
     * text size. Numbers multiply the spacing token.
     */
    $iconSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--disclosure-icon-size": getContextSpacingValue(value) },
      };
    },
    /**
     * Sets the slot-to-label gap and matching body indentation. Defaults to
     * half the frame padding, at least one base spacing step. Numbers multiply
     * the spacing token.
     */
    $slotGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--disclosure-gap": getSpacingValue(value) },
      };
    },
    /**
     * Sets the body and guide offset below the button. Defaults to zero.
     * Numbers multiply the spacing token.
     */
    $bodyOffset(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--disclosure-body-offset": getSpacingValue(value) },
      };
    },
    /**
     * Sets the label and body start indentation. A leading icon or guide aligns
     * the body with the label instead. Numbers multiply the spacing token.
     */
    $indent(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--disclosure-ps": getContextSpacingValue(value) },
      };
    },
    /**
     * Overrides leading-icon detection and the matching body indentation. Leave
     * unset to detect a slot before the label.
     */
    $leadingIcon(value?: boolean) {
      if (value == null) return;
      // The inline style overrides the detection rule of the root.
      return {
        style: { "--disclosure-icon": value ? "1" : "0" },
      };
    },
  },
  defaultVariants: {
    $rounded: "lg",
    $p: 2,
    // The map has an implicit false default, so nullish fallback cannot detect
    // it.
    $contentPadding(defaultValue, variants) {
      if (defaultValue) return defaultValue;
      return !!variants.$split;
    },
  },
});

/**
 * A disclosure trigger with frame-aligned padding and open-state transitions.
 */
export const disclosureButton = cv({
  extend: [button],
  class: [
    "ui-disclosure-button",
    // Let guide and list indentation override horizontal padding without
    // changing ordinary buttons.
    // Stays a class to come after the padding of `textFrame`, which it
    // replaces.
    "ps-(--disclosure-ps,var(--px))",
  ],
  variants: {
    /**
     * Animates the button corners, hover fade, and press. Disable this when the
     * row supplies its own transitions.
     */
    $transition(value?: boolean) {
      // A function replaces active's transition list instead of adding a second
      // one.
      if (!value) return;
      return [
        "transition-[border-radius,--tw-gradient-from-position,--tw-gradient-to-position,var(--active-transition)]",
        // Corners and hover fade wait for content closing at half duration;
        // press motion stays immediate.
        "duration-[calc(var(--disclosure-duration)*0.5),calc(var(--disclosure-duration)*0.5),calc(var(--disclosure-duration)*0.5),var(--active-duration)]",
        "delay-[calc(var(--disclosure-duration)/1.5),calc(var(--disclosure-duration)/1.5),calc(var(--disclosure-duration)/1.5),0s]",
        "ui-disclosure-open:delay-0",
      ];
    },
    /**
     * Sets the button radius from a named step, CSS length, or expression.
     * `auto` follows the disclosure radius minus its border.
     */
    $rounded(value?: FrameRoundedValue | "auto" | (string & {})) {
      if (value !== "auto") return getFrameRoundedClass(value);
      return [
        "[--disclosure-button-radius:calc(var(--disclosure-radius)-var(--disclosure-border))]",
        "ak-frame-(--disclosure-button-radius)",
      ];
    },
    /**
     * Adds `auto` spacing from the disclosure frame: half its padding, at least
     * one base spacing step. Keep `auto` to align body text with the label.
     */
    $gap: {
      auto: "ui-disclosure-button--gap-auto",
    },
    /**
     * Sets the vertical label-to-description gap to half the frame padding,
     * capped at one base spacing step.
     */
    $gapY(value?: "none" | "auto") {
      // Replace the inherited gap variant instead of adding a competing
      // --gap-y.
      if (value !== "auto") return;
      return "[--gap-y:min(var(--py)/2,--spacing(2))] gap-y-(--gap-y)";
    },
    /**
     * Extends the focus ring offsets with `inset`, which draws the ring inside
     * the button rather than over the disclosure edge it covers.
     */
    $focusOffset: {
      inset: "-outline-offset-2",
    },
  },
  defaultVariants: {
    $transition: true,
    $gapY: "auto",
    // Use frame padding plus the control's optical side inset.
    $p: "var(--disclosure-padding)",
    $gap: "auto",
    $rounded: "auto",
    $forceRounded: true,
    $focusOffset: "inset",
    $activeDepthX: 3,
  },
  refine({ variants, addClass }) {
    // Bevels already use the gradient channels needed by the hover fade.
    if (variants.$kind === "bevel") return;
    addClass([
      // Fade across twice the button's bottom padding unless the content
      // supplies its own gap.
      "[--disclosure-hover-fade:calc(var(--py,0px)*2*var(--disclosure-open,0)*(1-var(--disclosure-content-padding,0)))]",
      // End the fade where the rounded bottom corners start, so their curve
      // doesn't show. A split layout squares the open corners. A pill rounds
      // half its height at most, and the radius can be much larger.
      "[--disclosure-hover-end:calc(min(var(--ak-frame-radius,0px),50%)*var(--disclosure-open,0)*(1-var(--disclosure-content-padding,0))*(1-var(--disclosure-split,0)))]",
      // A group squares the bottom corners of each member but the last one
      // that shows, or one with $frameEnd, as ak-frame-cover does.
      "[.ui-disclosure-group>:not(.ak-frame-end):has(~:not([hidden],template))>&]:[--disclosure-hover-end:0px]",
      // Animate the fade on open and close, without animating it on hover.
      "from-[calc(100%-var(--disclosure-hover-fade)-var(--disclosure-hover-end))]",
      "to-[calc(100%-var(--disclosure-hover-end))]",
      // Replace the opaque layer background so the gradient can fade to
      // transparency.
      "ui-hover:bg-transparent ui-hover:bg-linear-to-b",
      "ui-hover:from-(--ak-layer) ui-hover:to-transparent",
    ]);
  },
});

/** A flexible wrapper for a disclosure button's label and description. */
export const disclosureButtonContent = buttonContent;

/**
 * A wrapping disclosure label that can shrink with its row and fills it, so
 * trailing slots and an end indicator sit at its end.
 */
export const disclosureButtonLabel = cv({
  extend: [buttonLabel],
  class: "ui-disclosure-button-label",
  defaultVariants: {
    $truncate: false,
    $grow: true,
  },
});

/** A wrapping description with vertically spaced child content. */
export const disclosureButtonDescription = cv({
  extend: [buttonDescription],
  // Inherit the measured gap so smaller description text does not rescale it.
  class: [
    "gap-y-[inherit]",
    // Stays a class to come after the display of `controlDescription`, which it
    // replaces.
    "grid",
  ],
  defaultVariants: {
    $truncate: false,
  },
});

/**
 * A disclosure slot whose icon follows the root's `$iconSize`. Only an icon can
 * lead the label while preserving body alignment.
 */
export const disclosureButtonSlot = cv({
  extend: [buttonSlot],
  class: "ui-disclosure-button-slot",
  variants: {
    /**
     * Adds `auto`, which follows the root's `$iconSize` or text size. Icons use
     * this by default; other slot kinds keep their normal size. Automatic
     * margins preserve label and body alignment for oversized icons.
     */
    $size: {
      auto: "ui-disclosure-button-slot--size-auto",
    },
  },
  defaultVariants: {
    $size: getIconSlotSize,
  },
});

const disclosureIndicatorVariants = {
  /**
   * Places the indicator in the row. `next` follows the label text, or the
   * row's content when a description wraps the label, which fills the row.
   * `end` sits at the far edge, even when no label fills the row.
   */
  $position: {
    start: "",
    next: "ui-disclosure-indicator--position-next",
    end: "ms-auto!",
  },
};

/** A direction-aware chevron that rotates when the disclosure opens. */
export const disclosureChevron = cv({
  extend: [buttonSlot],
  class: "ui-disclosure-chevron",
  variants: {
    ...disclosureIndicatorVariants,
    /**
     * Sets the closed direction. `right` follows the row direction and opens
     * downward; `down` opens upward.
     */
    $direction: {
      right: "ui-disclosure-chevron--direction-right",
      down: "ui-disclosure-chevron--direction-down",
    },
  },
  defaultVariants: {
    $direction: "right",
    $size: "lg",
  },
});

/** A plus indicator that changes to a minus when the disclosure opens. */
export const disclosurePlus = cv({
  extend: [buttonSlot],
  class: "ui-disclosure-plus",
  variants: disclosureIndicatorVariants,
  defaultVariants: {
    $size: "xl",
    $rounded: "full",
    // The cross fills only part of its box, so extra sibling margins would
    // misalign the body.
    $mx: "unset",
  },
});

/** An animated disclosure region with an optional guide line. */
export const disclosureContent = cv({
  class: "ui-disclosure-content",
  variants: {
    /**
     * Draws a guide below a leading icon or indicator and aligns content with
     * the label. Set `--disclosure-guide-width` on an ancestor to change the
     * default `1px` width.
     */
    $guide: "ui-disclosure-content--guide",
  },
});

/** Prose spacing capped by the disclosure's frame padding. */
const disclosureProse = cv({
  extend: [prose],
  defaultVariants: {
    $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
  },
});

/** Disclosure body spacing, borders, and optional prose styles. */
export const disclosureContentBody = cv({
  extend: [edge],
  class: [
    "ui-disclosure-content-body",
    // Stays a class, so that the padding of `listDisclosureContentBody` still
    // comes after it and replaces it.
    "p-(--ak-frame-padding)",
    // Stays a class to come after another class here that sets the padding,
    // which it replaces.
    "ps-(--disclosure-body-ps)",
    // Use padding for the body offset. A margin can collapse through clipped
    // content and keep a closed disclosure tall.
    // Stays a class, so that the padding of `listDisclosureContentBody` still
    // comes after it and replaces it.
    "pbs-[calc(var(--disclosure-body-offset)+var(--ak-frame-padding)*var(--disclosure-content-padding,0))]",
    // Stays a class, so that the border-style of `frameBase` still comes after
    // it and replaces it.
    "border-bs-[calc(var(--disclosure-border)*var(--disclosure-split,0))]",
  ],
  variants: {
    /**
     * Applies prose typography and spacing with the frame-capped rhythm gap.
     */
    $prose(value?: boolean) {
      if (!value) return;
      return disclosureProse({});
    },
  },
});
