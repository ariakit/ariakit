import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import { getIconSlotSize } from "./control.ts";
import { edge } from "./edge.ts";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
import { prose } from "./prose.ts";

/** A shared frame with dividers between disclosures. */
export const disclosureGroup = cv({
  extend: [frame],
  class: [
    "disclosure-group [--disclosure-group:1]",
    "divide-y divide-(--ak-edge)",
  ],
  variants: {
    /**
     * Grows the open disclosure into the height that closed ones leave, so its
     * body reaches the group's end, and scrolls the body when its content needs
     * more height. The group grows in a flex column parent, such as a `Nav`
     * with `$fill`, which must have a height. The group's end edge moves below
     * a closed last disclosure.
     */
    $fill: [
      // Grow in a flex column parent without growing it past its height.
      "grow min-h-0 flex flex-col",
      // The root disables its own transitions, so the growth transition must
      // take precedence. Only the open disclosure may shrink below its content.
      "*:flex *:flex-col *:data-open:grow *:data-open:min-h-0",
      "*:transition-[flex-grow]!",
      "[&>*>.disclosure-content]:grow [&>*>.disclosure-content]:basis-0",
      "[&>*>.disclosure-content]:min-h-0",
      // Open content grows past its own height to fill the disclosure.
      "[&>[data-open]>.disclosure-content]:max-h-full!",
      // The body scrolls, so the content keeps clipping its rounded corners.
      "[&>*>.disclosure-content>*]:h-full [&>*>.disclosure-content>*]:overflow-y-auto",
      "[&>*>.disclosure-content>*]:overscroll-y-contain",
      // An open disclosure reaches the group's end, which needs no edge. While
      // every disclosure is closed, the last one draws it right below itself.
      "border-b-0! *:last:border-(--ak-edge)",
      "[&:not(:has(>[data-open]))>:last-child]:border-b",
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
    // Descendants use the frame padding; the empty root must not apply it
    // again, including through caller utilities.
    "p-0!",
    "max-w-[inherit]",
    // Copy non-inherited --tw-duration into a shared channel. Reduced motion
    // disables descendant animations through the same channel.
    "transition-none duration-300 motion-reduce:duration-0",
    "[--disclosure-duration:var(--tw-duration)]",
    // Capture state and geometry before nested frames change them.
    "[--disclosure-open:0]",
    "[--disclosure-padding:var(--ak-frame-padding)]",
    "[--disclosure-radius:var(--ak-frame-radius)]",
    "[--disclosure-border:calc(var(--ak-frame-border)+var(--ak-frame-ring))]",
    // Group members have no border of their own, so a split line matches the
    // group dividers.
    "ui-disclosure-group:[--disclosure-border:1px]",
    // Match the button's default optical text inset. A button-specific $size or
    // $px changes only its label position.
    "[--disclosure-px:calc(var(--disclosure-padding)+(1lh-1cap)*0.5)]",
    // Clear ancestor indentation before nested disclosures set their own.
    "[--disclosure-ps:initial]",
    // Registered as a length so the body and its guide use the same measured
    // offset.
    "[--disclosure-body-offset:0px]",
    // Share the slot gap with the body to align it under the label.
    "[--disclosure-gap:max(--spacing(2),var(--disclosure-padding)/2)]",
    // Include oversized leading-icon overflow. Registered lengths preserve
    // root-font measurements in descendants; the button must keep the root line
    // height.
    "[--disclosure-lead:calc(var(--disclosure-padding)+1lh+var(--disclosure-gap)+max(0px,(var(--disclosure-icon-size,1em)-1lh)/2)*var(--disclosure-icon,0))]",
    // Only a first slot, or one after a start indicator, indents the body.
    // Reset nested state; :where() lets utility order decide overrides.
    "[--disclosure-icon:0]",
    "[&:has(>:where(.disclosure-button)>:where(.disclosure-button-slot):where(:first-child,[data-disclosure-indicator]:first-child+*))]:[--disclosure-icon:1]",
    "open:[--disclosure-open:1] data-open:[--disclosure-open:1]",
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
      true: "[--disclosure-content-padding:1]",
      false: "[--disclosure-content-padding:0]",
    },
    /**
     * Sets the button icon size and body indentation from the root. Defaults to
     * text size. Numbers multiply the spacing token.
     */
    $iconSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--disclosure-icon-size": getSpacingValue(value) },
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
        style: { "--disclosure-ps": getSpacingValue(value) },
      };
    },
    /**
     * Overrides leading-icon detection and the matching body indentation. Leave
     * unset to detect a slot before the label.
     */
    $leadingIcon(value?: boolean) {
      if (value == null) return;
      // Inline style must override the later-sorted detection rule.
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
    "disclosure-button overflow-clip w-full justify-start text-wrap text-start",
    // Let guide and list indentation override horizontal padding without
    // changing ordinary buttons.
    "ps-(--disclosure-ps,var(--px))",
    "ui-disclosure-group:rounded-[inherit]",
    // Only split layouts need square open corners. The style query sorts after
    // the inherited radius rule.
    "[@container_style(--disclosure-split:_1)]:ui-disclosure-open:rounded-b-none",
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
        "transition-[border-radius,--tw-gradient-from-position,var(--active-transition)]",
        // Corners and hover fade wait for content closing at half duration;
        // press motion stays immediate.
        "duration-[calc(var(--disclosure-duration)*0.5),calc(var(--disclosure-duration)*0.5),var(--active-duration)]",
        "delay-[calc(var(--disclosure-duration)/1.5),calc(var(--disclosure-duration)/1.5),0s]",
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
      // Restore the slot's negative side margin so the label matches the body
      // indent.
      auto: "[--gap:calc(var(--disclosure-gap)+var(--px)-var(--py))] gap-(--gap)",
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
      // Animate the fade on open and close, without animating it on hover.
      "from-[calc(100%-var(--disclosure-hover-fade))]",
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
  class: [
    "min-w-0",
    // A next indicator follows the label text instead of the row end.
    "[&:has(~.disclosure-indicator-next)]:grow-0",
  ],
  defaultVariants: {
    $truncate: false,
    $grow: true,
  },
});

/** A wrapping description with vertically spaced child content. */
export const disclosureButtonDescription = cv({
  extend: [buttonDescription],
  // Inherit the measured gap so smaller description text does not rescale it.
  class: "grid gap-y-[inherit]",
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
  class: "disclosure-button-slot",
  variants: {
    /**
     * Adds `auto`, which follows the root's `$iconSize` or text size. Icons use
     * this by default; other slot kinds keep their normal size. Automatic
     * margins preserve label and body alignment for oversized icons.
     */
    $size: {
      auto: "[--size:var(--disclosure-icon-size,1em)]",
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
    next: "disclosure-indicator-next",
    end: "ms-auto!",
  },
};

/** A direction-aware chevron that rotates when the disclosure opens. */
export const disclosureChevron = cv({
  extend: [buttonSlot],
  class: [
    "transition-[rotate,opacity] duration-(--disclosure-duration)",
    // Enlarge the glyph without changing the slot box used for alignment.
    "[--slot-icon-size:1.1em]",
  ],
  variants: {
    ...disclosureIndicatorVariants,
    /**
     * Sets the closed direction. `right` follows the row direction and opens
     * downward; `down` opens upward.
     */
    $direction: {
      right: ["-rotate-90 rtl:rotate-90", "ui-disclosure-open:rotate-0"],
      down: ["rotate-0", "ui-disclosure-open:rotate-180"],
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
  class: [
    "transition-[rotate,background-size,opacity]",
    "[--plus-line-thickness:2px]",
    "duration-[var(--disclosure-duration),calc(var(--disclosure-duration)/3)]",
    // Collapse one gradient stroke and rotate the other to change plus to
    // minus.
    "bg-[linear-gradient(currentColor_0_0),linear-gradient(currentColor_0_0)]",
    "bg-no-repeat bg-center",
    "bg-size-[60%_var(--plus-line-thickness),var(--plus-line-thickness)_60%]",
    "ui-disclosure-open:rotate-90",
    "ui-disclosure-open:bg-size-[var(--plus-line-thickness)_60%]",
  ],
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
  class: [
    "disclosure-content relative z-1 max-h-0 overflow-clip rounded-b-[inherit]",
    "transition-[content-visibility,height,max-height]",
    // Keep nested disclosures outside the ancestor group.
    "[--disclosure-group:0]",
    // Nested content without a guide must not inherit the outer guide.
    "[--disclosure-guide:initial]",
    "transition-discrete",
    "[interpolate-size:allow-keywords]",
    // Only animate when the browser can interpolate to max-content.
    "supports-[interpolate-size:allow-keywords]:duration-(--disclosure-duration)",
    // Prevent initially open content from animating before user interaction.
    "[html:focus-within_&]:starting:max-h-0",
    // Use a style query so icon-free content can retain explicit root
    // indentation.
    "[@container_style(--disclosure-icon:_1)]:[--disclosure-ps:var(--disclosure-lead)]",
    "[[open]>&]:max-h-max data-open:max-h-max ui-disclosure-open:max-h-max",
  ],
  variants: {
    /**
     * Draws a guide below a leading icon or indicator and aligns content with
     * the label. Set `--disclosure-guide-width` on an ancestor to change the
     * default `1px` width.
     */
    $guide: [
      "[--disclosure-ps:var(--disclosure-lead)]",
      "[--disclosure-guide-center:calc(var(--disclosure-padding)+0.5lh)]",
      // Expose the guide center to navigation bars in the content rows. The
      // compound selector outranks the reset above.
      "[&.disclosure-content]:[--disclosure-guide:var(--disclosure-guide-center)]",
      "before:absolute before:top-(--disclosure-body-offset) before:bottom-0 before:ak-layer",
      "before:border-e-(length:--disclosure-guide-width,1px)",
      // Center any guide width on the leading slot's one-line column.
      "before:inset-s-[calc(var(--disclosure-guide-center)-var(--disclosure-guide-width,1px)/2)]",
    ],
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
    "rounded-b-[inherit]",
    // Reset icon size for nested disclosures. `initial` restores var()
    // fallbacks; `unset` would inherit.
    "[--disclosure-icon-size:initial]",
    "p-(--ak-frame-padding)",
    "[--disclosure-body-ps:var(--disclosure-ps,var(--disclosure-px))]",
    "ps-(--disclosure-body-ps)",
    // Cover children must cross the body's full start inset plus their frame
    // border.
    "[&>.ak-frame-cover]:-ms-[calc(var(--disclosure-body-ps)+var(--ak-frame-border))]",
    // Use padding for the body offset. A margin can collapse through clipped
    // content and keep a closed disclosure tall.
    "pbs-[calc(var(--disclosure-body-offset)+var(--ak-frame-padding)*var(--disclosure-content-padding,0))]",
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
