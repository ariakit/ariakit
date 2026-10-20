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
  disclosureGroup,
} from "./disclosure.ts";
import { frame, frameBase } from "./frame.ts";
import { gliderBase, gliderRadius } from "./glider.ts";
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
      "--glider-frame, --glider-selected, --disclosure-guide-selected, --nav-body-selected",
    "--glider-radius": gliderRadius,
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
      horizontal: [
        "horizontal flex items-start overflow-x-auto overscroll-x-contain [clip-path:inset(-100vmax_0)] [&>.control,&>.nav-list>li>.control]:shrink-0 [&>.control,&>.nav-list>li>.control]:whitespace-nowrap",
        // The wider row gap lines up labels in a column, which a row lacks, so
        // rows use the button gap.
        "[&>.control,&>.nav-list>li>.control]:gap-[calc(var(--px)-var(--sidebearing))]",
      ],
    },
    /**
     * Fits a vertical navigation to the height of a flex column parent, such as
     * a `ShellSidebarBody`, and lets a child with its own `$fill`, such as a
     * `NavDisclosureGroup`, take the height left by the other rows.
     */
    $fill: [
      // A flex column, unlike the grid, gives the free height to one child.
      "nav-fill grow min-h-0 [&.vertical]:flex! [&.vertical]:flex-col",
    ],
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
     * Sets navigation slot and disclosure icon sizes, except shortcuts and
     * thumbnails. Set this on the root or an ancestor: consumers read inherited
     * values and ancestor style queries. Numbers scale the spacing token.
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

/**
 * A navigation group with extra space before it, after other groups or rows.
 */
export const navGroup = cv({
  class: [
    "nav-group grid grid-cols-[minmax(0,1fr)] content-start gap-(--nav-gap) shrink-0",
    // Gliders precede the rows in the DOM, but take no space.
    "[.nav.vertical>:not(.glider)+&]:mt-[calc(var(--nav-group-gap)-var(--nav-gap))]",
    "[.nav.horizontal>:not(.glider)+&]:ms-[calc(var(--nav-group-gap)-var(--nav-gap))]",
  ],
  variants: {
    /**
     * Draws a line in the middle of the space before the group. A group that
     * starts the navigation has no line. The line spans the navigation's
     * padding, so a `Nav` with `$cover` draws it to its container's edges.
     */
    $divider: [
      // The marker class outranks the spacing rules above. The line takes the
      // edge color of the navigation.
      "nav-group-divider border-(--ak-edge)",
      "[.nav.vertical>:not(.glider)+&.nav-group-divider]:border-t",
      "[.nav.vertical>:not(.glider)+&.nav-group-divider]:mt-[calc(var(--nav-group-gap)/2-var(--nav-gap))]",
      "[.nav.vertical>:not(.glider)+&.nav-group-divider]:pt-[calc(var(--nav-group-gap)/2)]",
      // The group reads the navigation's inherited frame padding. Its margins
      // reach past that padding, and its own padding keeps the rows in place.
      "[.nav.vertical>:not(.glider)+&.nav-group-divider]:-mx-(--ak-frame-padding)",
      "[.nav.vertical>:not(.glider)+&.nav-group-divider]:px-(--ak-frame-padding)",
      "[.nav.horizontal>:not(.glider)+&.nav-group-divider]:border-s",
      "[.nav.horizontal>:not(.glider)+&.nav-group-divider]:ms-[calc(var(--nav-group-gap)/2-var(--nav-gap))]",
      "[.nav.horizontal>:not(.glider)+&.nav-group-divider]:ps-[calc(var(--nav-group-gap)/2)]",
      "[.nav.horizontal>:not(.glider)+&.nav-group-divider]:-my-(--ak-frame-padding)",
      "[.nav.horizontal>:not(.glider)+&.nav-group-divider]:py-(--ak-frame-padding)",
    ],
  },
});

/**
 * A group label aligned with navigation row content despite its smaller text.
 */
export const navGroupLabel = cv({
  extend: [textFrame, text],
  class: [
    "font-medium text-start",
    // A label shorter than a row, close to the rows below it, reads as their
    // heading instead of another row.
    "pb-[calc(var(--nav-py)/4)]",
  ],
  variants: {
    /**
     * Shows the label in small uppercase letters with wider spacing, which sets
     * it apart from the rows more than its size and color alone.
     */
    $uppercase: {
      true: "uppercase tracking-wider text-[0.75em]",
      false: "text-[0.8125em]",
    },
  },
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
     * text size; without `$slotSize`, a badge after the label takes the line
     * height instead. Numbers scale the spacing token; other lengths apply
     * directly. Named sizes `xs` to `lg` become `xl` for badges and avatars;
     * `xl` and larger add label spacing.
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
      if (defaultValue !== "auto") return defaultValue;
      if (variants.$kind === "shortcut") return "md";
      // A picture keeps a line of height instead of the icon size.
      if (variants.$kind === "thumbnail") return "xl";
      return defaultValue;
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
  refine({ variants, addClass }) {
    if (variants.$kind !== "badge") return;
    // A floating badge sits on another slot, so it keeps the icon size.
    if (variants.$floating) return;
    // A badge after the label takes the nav's $slotSize, or the line height
    // like a button badge. A badge before it sits in the icon column, where it
    // keeps the icon size and a padding that keeps one digit round. The variant
    // classes sort after the base size and padding classes.
    if (variants.$size === "auto") {
      addClass("[*+&]:[--size:var(--nav-slot-size,1lh)]");
    }
    if (variants.$p === "auto") addClass("first:px-[calc(var(--size)*0.15)]");
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
    // Rows in a horizontal navigation size to their text, so a heavier current
    // row would shift the rows after it. The glider marks it instead.
    "[.nav.horizontal>&,.nav.horizontal>.nav-list>li>&]:font-normal",
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
 * so trailing slots sit at its end. Beside a description, it keeps the ink and
 * weight of a current link, so it stands out from the description.
 */
export const navLinkLabel = cv({
  extend: [buttonLabel],
  class: [
    "group-has-[>.control-description]/control-content:ak-ink-100",
    "group-has-[>.control-description]/control-content:font-[calc(500+var(--contrast))]",
  ],
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
        // `$barLength` shortens the bar by an inset at each end.
        "[.vertical>&]:top-[calc(anchor(top)+var(--glider-bar-inset,0px))]",
        "[.vertical>&]:h-[calc(anchor-size()-var(--glider-bar-inset,0px)*2)]",
        "[.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:inset-e-[calc(anchor(start)+var(--glider-bar-offset))]",
        "[.vertical>&]:[&.glider-bar-end]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-end]:inset-s-[calc(anchor(end)+var(--glider-bar-offset))]",
        // An automatic or centered start bar follows the disclosure guide,
        // with frame padding as fallback.
        "[.vertical>&]:[&:is(.glider-bar-auto,.glider-bar-center):not(.glider-bar-end)]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-auto:not(.glider-bar-end)]:inset-s-[calc(anchor(--disclosure-guide-selected_center,calc(anchor(start)-var(--glider-bar-offset)-var(--glider-bar)/2))-var(--glider-bar)/2)]",
        // Without a guide, a centered bar sits midway between the row and the
        // edge of the split body that holds it, or the frame padding.
        "[.vertical>&]:[&.glider-bar-center:not(.glider-bar-end)]:inset-s-[calc(anchor(--disclosure-guide-selected_center,calc((anchor(--nav-body-selected_start,calc(anchor(start)-var(--glider-padding,0px)))+anchor(start))/2))-var(--glider-bar)/2)]",
        "[.vertical>&]:[&.glider-bar-frame]:inset-e-auto",
        // A frame bar sits on the guide of a current row inside a disclosure,
        // and on the navigation edge otherwise.
        "[.vertical>&]:[&.glider-bar-frame]:inset-s-[calc(anchor(--disclosure-guide-selected_center,calc(var(--glider-bar)/2))-var(--glider-bar)/2)]",
        "[.vertical>&]:[&.glider-bar-frame.glider-bar-end]:inset-s-auto",
        "[.vertical>&]:[&.glider-bar-frame.glider-bar-end]:inset-e-0",
        "[.horizontal>&]:left-[calc(anchor(left)+var(--glider-bar-inset,0px))]",
        "[.horizontal>&]:w-[calc(anchor-size()-var(--glider-bar-inset,0px)*2)]",
        "[.horizontal>&]:h-(--glider-bar)",
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
    // Covers follow row rounding. Bars keep the glider base radius.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return "md";
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
 * Navigation sections in a shared frame with dividers between them. The frame
 * spans the navigation's padding, so the dividers reach its edges.
 */
export const navDisclosureGroup = cv({
  extend: [disclosureGroup],
  class: [
    "nav-disclosure-group",
    // Gliders precede the rows in the DOM, so a group right after them starts
    // the navigation. Its start meets the navigation edge, which needs no line.
    "first:border-t-0 [.glider+&]:border-t-0 [.glider+&]:ak-frame-start",
  ],
  defaultVariants: {
    $cover: true,
  },
  refine({ variants, addClass }) {
    if (!variants.$cover) return;
    // Covering frames take the container radius, which a shell sidebar paints
    // square at its edges. The group and its sections paint square corners too,
    // and keep the frame radius for the corners of their rows.
    addClass(
      "rounded-none! *:rounded-none! [&>*>.disclosure-content>*]:rounded-none!",
    );
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
    $bodyOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // The split body's own padding already separates its rows.
      if (variants.$split) return 0;
      return "var(--nav-gap, calc(var(--spacing) * 1))";
    },
  },
  refine({ variants, addClass }) {
    // Reset the values for nested sections; a split one sets its own.
    if (!variants.$split) {
      addClass("[--nav-body-inset:0px] [--nav-body-row-radius:initial]");
      return;
    }
    addClass([
      // Inset rows on the body surface so their text lines up with the button
      // text at both ends.
      "[--nav-body-inset:max(0px,calc(var(--disclosure-padding)-var(--nav-py,--spacing(2))))]",
      // The body spans the section, so its rows stay concentric with the
      // section corners at the inset distance.
      "[--nav-body-row-radius:calc(var(--disclosure-radius)-var(--nav-body-inset))]",
    ]);
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
    // radius below the frame 1rem cutoff. A split body sets a smaller row
    // radius for its inset rows.
    "[--nav-body-radius:calc(var(--nav-body-row-radius,var(--disclosure-radius))+var(--ak-frame-padding))]",
    // A split body meets its button with a straight edge.
    "[@container_style(--disclosure-split:_1)]:rounded-t-none",
    // Expose a split body with the current row, so a centered bar can sit
    // between the body edge and the row.
    "[@container_style(--disclosure-split:_1)]:ui-has-selected-row:[anchor-name:--nav-body-selected]",
    // Align row text with the body. Move nested disclosures as a whole to keep
    // their guides aligned.
    "[&_li>.control:not(.disclosure-button)]:-ms-(--px)",
    "[&_li:has(>.disclosure-button)]:-ms-(--disclosure-px)",
    // Inset focus rings to prevent disclosure clipping, even when a row sets
    // its own `$focusOffset`.
    "[&_li>.control]:-outline-offset-2",
  ],
  // Without a split, leave the body unpadded so row ends and gliders align with
  // top-level rows. Caller padding preserves the start indent.
  defaultVariants: {
    $layer: "transparent",
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
    $p: "var(--nav-body-inset, 0px)",
  },
});
