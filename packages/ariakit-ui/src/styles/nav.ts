import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import type { SlotSize } from "./control.ts";
import { getSlotSizeClass, isSlotSize } from "./control.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
} from "./disclosure.ts";
import { frame, frameBase } from "./frame.ts";
import { gliderBase } from "./glider.ts";
import { selected } from "./selected.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/**
 * A navigation region with shared row spacing, groups, and moving indicators.
 */
export const nav = cv({
  extend: [frame],
  class: [
    // Keep rows at the start when the navigation region stretches.
    "nav content-start gap-(--nav-gap) min-w-0",
    "[--nav-gap:--spacing(1)]",
    "[--nav-group-gap:--spacing(4)]",
    "[--nav-row-gap:--spacing(3)]",
    // Registered lengths resolve in the navigation font, keeping smaller group
    // labels aligned with rows.
    "[--nav-py:--spacing(2)]",
    "[--nav-px:calc(var(--nav-py)+(1lh-1cap)*0.5)]",
    "relative isolate [--glider-padding:var(--ak-frame-padding)]",
  ],
  style: {
    anchorName: "--glider-frame",
    // Keep row and guide anchors within this navigation region.
    anchorScope:
      "--glider-frame, --glider-selected, --disclosure-guide-selected",
  },
  variants: {
    /**
     * Arranges top-level links in a column or one scrolling row. Groups and
     * disclosures keep their own vertical layout. Defaults to `vertical`.
     */
    $layout: {
      // A shrinkable track lets long rows truncate or wrap instead of widening
      // the navigation region.
      vertical: "vertical grid grid-cols-[minmax(0,1fr)]",
      horizontal:
        "horizontal flex items-start overflow-x-auto overscroll-x-contain [clip-path:inset(-100vmax_0)] [&>.control,&>.nav-list>li>.control]:shrink-0 [&>.control,&>.nav-list>li>.control]:whitespace-nowrap",
    },
    /** Sets the space between rows. Numbers scale the spacing token. */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-gap": getSpacingValue(value) },
      };
    },
    /** Sets the space between groups. Numbers scale the spacing token. */
    $groupGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-group-gap": getSpacingValue(value) },
      };
    },
    /**
     * Sets navigation slot and disclosure icon sizes, except shortcuts. Set
     * this on the root or an ancestor: consumers read inherited values and
     * ancestor style queries. Numbers scale the spacing token.
     */
    $slotSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-slot-size": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $layout: "vertical",
    $layer: "transparent",
    $rounded: "md",
  },
});

/** A list whose rows participate directly in the navigation layout. */
export const navList = cv({
  // Disclosures need their own layout box for indentation and vertical spacing.
  class: "nav-list contents [&>li:not(.nav-disclosure)]:contents",
});

/** A navigation group with extra space between adjacent groups. */
export const navGroup = cv({
  class:
    "nav-group grid grid-cols-[minmax(0,1fr)] content-start gap-(--nav-gap) shrink-0 [.nav.vertical>&+&]:mt-[calc(var(--nav-group-gap)-var(--nav-gap))] [.nav.horizontal>&+&]:ms-[calc(var(--nav-group-gap)-var(--nav-gap))]",
});

/**
 * A group label aligned with navigation row content despite its smaller text.
 */
export const navGroupLabel = cv({
  extend: [textFrame, text],
  class: ["font-medium text-[0.875em] text-start"],
  defaultVariants: {
    // Use lengths resolved by the navigation root, not the smaller label font.
    $p: "var(--nav-py)",
    $px: "var(--nav-px)",
    $rounded: "md",
    $ink: 60,
  },
});

/** Shared slot sizing and margins for navigation icons, badges, and avatars. */
const navSlotBase = cv({
  extend: [buttonSlot],
  variants: {
    /**
     * Sets the slot size. `auto` follows the navigation `$slotSize`, or the
     * text size. Numbers scale the spacing token; other lengths apply directly.
     * Named sizes `xs` to `lg` become `xl` for badges and avatars; `xl` and
     * larger add label spacing.
     */
    $size(value?: SlotSize | "auto" | number | (string & {})) {
      if (value == null) return;
      if (value === "auto") return "[--size:var(--nav-slot-size,1em)]";
      const named = getSlotSizeClass(value);
      if (named != null) return named;
      return { style: { "--size": getSpacingValue(value) } };
    },
    /**
     * Sets horizontal slot margins. `auto` keeps the row gap before trailing
     * slots and the row padding after them; leading slots use the control
     * margin.
     */
    $mx: {
      auto: [
        "[*+&]:[--mx:calc((var(--py)-var(--px)+max(0px,var(--my)))*var(--control-inline,1))]",
        "[*+&]:me-(--mx)",
      ],
    },
  },
  defaultVariants: {
    // Resolve before controlSlot refinement converts named badge/avatar sizes.
    $size: "auto",
  },
});

/** An icon, badge, avatar, or shortcut slot aligned with navigation labels. */
export const navSlot = cv({
  extend: [navSlotBase],
  defaultVariants: {
    $size(defaultValue, variants) {
      if (variants.$kind !== "shortcut") return defaultValue;
      if (defaultValue !== "auto") return defaultValue;
      return "md";
    },
    $p(defaultValue, variants) {
      // Keep single-digit badges round and aligned with the icon column.
      if (variants.$kind !== "badge") return defaultValue;
      if (defaultValue !== "auto") return defaultValue;
      return "md";
    },
    $mx(defaultValue, variants) {
      // Custom sizes need the auto margin; the inherited default would copy the
      // size into the margin.
      if (variants.$size == null) return defaultValue;
      if (variants.$size === "auto") return defaultValue;
      if (isSlotSize(variants.$size)) return defaultValue;
      if (defaultValue != null && defaultValue !== variants.$size) {
        return defaultValue;
      }
      return "auto";
    },
  },
});

/** A navigation link with wrapping text and a distinct current-page state. */
export const navLink = cv({
  extend: [button, selected],
  class: [
    "justify-start text-wrap",
    // Idle ink inherits into slots; hover and selection restore full strength.
    "ak-dark:ak-ink-70",
    "not-ui-selected:font-normal",
    // Include optical padding so icon rows align with disclosures. Disable the
    // inherited gap variant below.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    $lightnessOffset: false,
    $selectedPush: true,
    $selectedInk: 100,
    $gap: "none",
  },
});

/** A navigation link label and description with shared control spacing. */
export const navLinkContent = cv({
  extend: [buttonContent],
  class: [
    // Restore the content gaps because navLink disables the control gap
    // variant.
    "[--gap:calc(var(--px)-var(--sidebearing))]",
    "[--gap-y:min(var(--py)/2,--spacing(2))]",
  ],
});

/**
 * A navigation link label that wraps instead of truncating and fills the row,
 * so trailing slots sit at its end.
 */
export const navLinkLabel = cv({
  extend: [buttonLabel],
  defaultVariants: {
    $truncate: false,
    $grow: true,
  },
});

/** A navigation link description that wraps instead of truncating. */
export const navLinkDescription = cv({
  extend: [buttonDescription],
  defaultVariants: {
    $truncate: false,
  },
});

/**
 * A full-width navigation action that also works outside a navigation region.
 */
export const navButton = cv({
  extend: [button],
  class: [
    // Fill the row so trailing slots reach its end.
    "w-full justify-start overflow-clip whitespace-normal text-start",
    // Include optical padding so icon rows align with disclosures. Disable the
    // inherited gap variant below.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    $rounded: "lg",
    $lightnessOffset: false,
    $gap: "none",
  },
});

/** A navigation button content box that clips overflowing content. */
export const navButtonContent = cv({
  class: "block overflow-hidden",
});

// Position covers from the top; a moving bottom edge would add false motion
// when disclosures open.
const navGliderCover = cx(
  "inset-s-[anchor(start)] top-[anchor(top)]",
  "w-[anchor-size()] h-[anchor-size()]",
);

/**
 * A moving indicator for the current navigation row. Place it before all rows.
 */
export const navGlider = cv({
  extend: [gliderBase],
  class: [
    // Select current rows directly after the glider or inside descendant list
    // items.
    "[&~.control,&~*_li>.control]:ui-selected:[anchor-name:--glider-selected]",
    // Hide when no current row is visible, including as its disclosure starts
    // to close.
    "not-ui-nav-glider-selected:hidden",
    // Paint below rows but above the surrounding surface. Transparent
    // disclosure bodies let the cover show through.
    "z-0",
    // Firefox doubles absolute anchor offsets in scrolling RTL containers.
    // Fixed positioning uses the visible anchor box.
    "[.horizontal>&]:fixed!",
    // Hide the glider while its anchor is fully clipped by disclosure content.
    "[position-visibility:anchors-visible]",
    // Follow disclosure layout changes without a second easing animation.
    "[.nav[data-settling]>&]:transition-none",
  ],
  variants: {
    /**
     * Sets how the glider is drawn. `flat` and `bevel` cover the row they
     * follow, while `bar` is a thin rule beside it, on the side `$side` picks.
     */
    $kind(value?: "flat" | "bevel" | "bar") {
      if (value === "flat") return navGliderCover;
      if (value === "bevel") return ["ui-bevel", navGliderCover];
      if (value !== "bar") return;
      return [
        "glider-bar",
        "z-10",
        // A fixed width keeps the bar the same at every text size. Normalize
        // the 0–100 contrast scale so high contrast adds only 20%.
        "[--glider-bar:calc(var(--glider-bar-width,2px)*(1+0.2*var(--contrast)/100))]",
        "[.vertical>&]:top-[anchor(top)] [.vertical>&]:h-[anchor-size()] [.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:inset-e-[calc(anchor(start)+var(--glider-bar-offset))]",
        "[.vertical>&]:[&.glider-bar-end]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-end]:inset-s-[calc(anchor(end)+var(--glider-bar-offset))]",
        // An automatic start bar follows the disclosure guide, with frame
        // padding as fallback.
        "[.vertical>&]:[&.glider-bar-auto:not(.glider-bar-end)]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-auto:not(.glider-bar-end)]:inset-s-[calc(anchor(--disclosure-guide-selected_center,calc(anchor(start)-var(--glider-bar-offset)-var(--glider-bar)/2))-var(--glider-bar)/2)]",
        "[.vertical>&]:[&.glider-bar-frame]:inset-e-auto",
        // A frame bar sits on the guide of a current row inside a disclosure,
        // and on the navigation edge otherwise.
        "[.vertical>&]:[&.glider-bar-frame]:inset-s-[calc(anchor(--disclosure-guide-selected_center,calc(var(--glider-bar)/2))-var(--glider-bar)/2)]",
        "[.vertical>&]:[&.glider-bar-frame.glider-bar-end]:inset-s-auto",
        "[.vertical>&]:[&.glider-bar-frame.glider-bar-end]:inset-e-0",
        "[.horizontal>&]:left-[anchor(left)] [.horizontal>&]:w-[anchor-size()] [.horizontal>&]:h-(--glider-bar)",
        "[.horizontal>&]:top-[calc(anchor(bottom)+var(--glider-bar-offset))]",
        "[.horizontal>&]:[&.glider-bar-start]:top-auto",
        "[.horizontal>&]:[&.glider-bar-start]:bottom-[calc(anchor(top)+var(--glider-bar-offset))]",
        "[.horizontal>&]:[&.glider-bar-frame]:top-auto",
        "[.horizontal>&]:[&.glider-bar-frame]:bottom-[anchor(--glider-frame_bottom)]",
        "[.horizontal>&]:[&.glider-bar-frame.glider-bar-start]:bottom-auto",
        "[.horizontal>&]:[&.glider-bar-frame.glider-bar-start]:top-[anchor(--glider-frame_top)]",
        // Other engines use the navigation frame directly, avoiding a second
        // fixed anchor during document scrolling.
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame]:absolute!",
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame]:bottom-0",
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame.glider-bar-start]:bottom-auto",
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame.glider-bar-start]:top-0",
      ];
    },
    /** Animates the glider as it travels between rows. */
    $animated(value?: boolean) {
      if (!value) return;
      return "duration-100";
    },
  },
  defaultVariants: {
    // Bars meet the navigation region's edge. Use `$cover` on the region to
    // reach its container's edge; shell sidebars do this by default.
    $barOffset(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      // Replace only the glider base's automatic offset.
      if (defaultValue != null && defaultValue !== "auto") return defaultValue;
      return "frame";
    },
    // Covers follow row rounding. Bars stay square even inside nested frames.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return "md";
    },
    $forceRounded(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return false;
    },
    $lightnessPush(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $border(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return defaultValue ?? false;
    },
  },
  refine({ variants, addClass }) {
    if (variants.$animated) {
      // WebKit requires inset longhands in transition lists. Omit display so
      // closing disclosures hide the glider at once.
      addClass(
        "transition-[top,left,inset-inline-start,inset-inline-end,height,width]",
      );
    }
    if (variants.$kind === "bar") return;
    // The cover supplies the selected surface; bars leave the row surface
    // intact.
    addClass([
      "supports-anchor:[&~.control,&~*_li>.control]:ui-selected:bg-transparent",
      "supports-anchor:[&~.control,&~*_li>.control]:ui-selected:ring-0",
      "supports-anchor:[&~.control,&~*_li>.control]:ui-selected:befter:hidden",
    ]);
  },
});

/**
 * A collapsible navigation section with aligned icons, labels, and nested rows.
 */
export const navDisclosure = cv({
  extend: [disclosure],
  class: [
    "nav-disclosure",
    "[@container_style(--nav-slot-size)]:[--disclosure-icon-size:var(--nav-slot-size)]",
  ],
  variants: {
    /**
     * Sets icon and nested slot sizes for this section, including its content
     * indent. Overrides `$iconSize`. Numbers scale the spacing token.
     */
    $slotSize(value?: string | number) {
      if (value == null) return;
      const size = getSpacingValue(value);
      return {
        style: { "--disclosure-icon-size": size, "--nav-slot-size": size },
      };
    },
  },
  defaultVariants: {
    // Separate row and content spacing removes the need for a hover ramp.
    $contentPadding: true,
    $rounded: "lg",
    $p: 2,
    // Keep nested gliders visible through the disclosure root.
    $layer: "transparent",
    $slotGap: "var(--nav-row-gap, calc(var(--spacing) * 3))",
    $bodyOffset: "var(--nav-gap, calc(var(--spacing) * 1))",
  },
});

/** A disclosure button whose label aligns with other navigation rows. */
export const navDisclosureButton = cv({
  extend: [disclosureButton],
  class: "whitespace-normal",
});

/**
 * A transparent disclosure body with aligned, evenly spaced navigation rows.
 */
export const navDisclosureContentBody = cv({
  // Add frame geometry; the disclosure body already supplies edge and layer
  // colors.
  extend: [disclosureContentBody, frameBase],
  class: [
    "grid grid-cols-[minmax(0,1fr)] content-start gap-(--nav-gap)",
    // Compensate for body padding so nested row corners match the disclosure
    // radius below the frame 1rem cutoff.
    "[--nav-body-radius:calc(var(--disclosure-radius)+var(--ak-frame-padding))]",
    // Align row text with the body. Move nested disclosures as a whole to keep
    // their guides aligned.
    "[&_li>.control:not(.disclosure-button)]:-ms-(--px)",
    "[&_li:has(>.disclosure-button)]:-ms-(--disclosure-px)",
    // Inset focus rings to prevent disclosure clipping, even when a row sets
    // its own `$focusOffset`.
    "[&_li>.control]:-outline-offset-2",
  ],
  // Leave default body padding unset so row ends and gliders align with
  // top-level rows. Caller padding preserves the start indent.
  defaultVariants: {
    $layer: "transparent",
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
  },
});
