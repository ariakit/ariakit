import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import type { BarOffset, SlotSize } from "./control.ts";
import {
  barBase,
  getBarOffset,
  getNamedBarOffsetClass,
  getSlotSizeClass,
  isNamedBarOffset,
  isSlotSize,
} from "./control.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
  disclosureGroup,
} from "./disclosure.ts";
import { frame, frameBase } from "./frame.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/**
 * A navigation region with shared row spacing, groups, and current-row bars.
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
    "relative isolate",
    // Bars in top-level rows reach the navigation padding edge.
    "[--nav-bar-gap:var(--ak-frame-padding)]",
  ],
  variants: {
    /**
     * Arranges top-level links in a column or one scrolling row. Groups and
     * disclosures keep their own vertical layout. Defaults to `vertical`.
     */
    $layout: {
      // A shrinkable track lets long rows truncate or wrap instead of widening
      // the navigation region.
      vertical: [
        "vertical grid grid-cols-[minmax(0,1fr)]",
        // Disclosure content clips only its height animation, so end bars of
        // nested rows can reach the navigation padding.
        "[&_.disclosure-content]:overflow-x-visible",
      ],
      horizontal: [
        "horizontal flex items-start overflow-x-auto overscroll-x-contain [clip-path:inset(-100vmax_0)] [&>.control,&>.nav-list>li>.control]:shrink-0 [&>.control,&>.nav-list>li>.control]:whitespace-nowrap",
        // A bar outside the padding must not let the row scroll vertically.
        "overflow-y-hidden",
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
     * Sets navigation slot and disclosure icon sizes, except shortcuts,
     * thumbnails, and text. Set this on the root or an ancestor: consumers read
     * inherited values and ancestor style queries. Numbers scale the spacing
     * token.
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
    "[.nav.vertical>*+&]:mt-[calc(var(--nav-group-gap)-var(--nav-gap))]",
    "[.nav.horizontal>*+&]:ms-[calc(var(--nav-group-gap)-var(--nav-gap))]",
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
      "[.nav.vertical>*+&.nav-group-divider]:border-t",
      "[.nav.vertical>*+&.nav-group-divider]:mt-[calc(var(--nav-group-gap)/2-var(--nav-gap))]",
      "[.nav.vertical>*+&.nav-group-divider]:pt-[calc(var(--nav-group-gap)/2)]",
      // The group reads the navigation's inherited frame padding. Its margins
      // reach past that padding, and its own padding keeps the rows in place.
      "[.nav.vertical>*+&.nav-group-divider]:-mx-(--ak-frame-padding)",
      "[.nav.vertical>*+&.nav-group-divider]:px-(--ak-frame-padding)",
      "[.nav.horizontal>*+&.nav-group-divider]:border-s",
      "[.nav.horizontal>*+&.nav-group-divider]:ms-[calc(var(--nav-group-gap)/2-var(--nav-gap))]",
      "[.nav.horizontal>*+&.nav-group-divider]:ps-[calc(var(--nav-group-gap)/2)]",
      "[.nav.horizontal>*+&.nav-group-divider]:-my-(--ak-frame-padding)",
      "[.nav.horizontal>*+&.nav-group-divider]:py-(--ak-frame-padding)",
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
        "[*+&]:[--mx:calc(((var(--py)-var(--px))*var(--slot-pull,1)+max(0px,var(--my)))*var(--control-inline,1))]",
        "[*+&]:me-(--mx)",
      ],
    },
  },
  defaultVariants: {
    // Resolve before controlSlot refinement converts named badge/avatar sizes.
    $size: "auto",
  },
});

/**
 * An icon, badge, avatar, shortcut, or text slot aligned with navigation
 * labels.
 */
export const navSlot = cv({
  extend: [navSlotBase],
  defaultVariants: {
    $size(defaultValue, variants) {
      if (defaultValue !== "auto") return defaultValue;
      if (variants.$kind === "shortcut") return "md";
      // A picture keeps a line of height instead of the icon size.
      if (variants.$kind === "thumbnail") return "xl";
      if (variants.$kind === "text") return "xl";
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
  extend: [button],
  class: [
    "justify-start text-wrap",
    // Idle ink inherits into slots; hover and selection restore full strength.
    "ak-dark:ak-ink-70",
    "not-ui-selected:font-normal",
    // Rows in a horizontal navigation size to their text, so a heavier current
    // row would shift the rows after it. Its surface or bar marks it instead,
    // unless navLinkLabel reserves the heavier width from data-text.
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
 *
 * Set `data-text` to the label text to keep the heavier weight of a current
 * link in a horizontal navigation, where rows otherwise use the normal weight.
 */
export const navLinkLabel = cv({
  extend: [buttonLabel],
  class: [
    "group-has-[>.control-description]/control-content:ak-ink-100",
    "group-has-[>.control-description]/control-content:font-[calc(500+var(--contrast))]",
    // A zero-height copy of data-text at the current weight sets the label
    // width, so the row keeps its size when the link becomes current.
    "data-text:group-ui-selected/control:font-[calc(500+var(--contrast))]",
    "data-text:before:block data-text:before:h-0 data-text:before:overflow-hidden",
    "data-text:before:invisible data-text:before:content-[attr(data-text)]",
    "data-text:before:font-[calc(500+var(--contrast))]",
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

/**
 * A thin bar inside a navigation link that marks it while current. Render it as
 * the link's last child. Vertical navigations draw it at the row's inline start
 * by default, and horizontal ones below the row.
 */
export const navLinkBar = cv({
  extend: [barBase],
  class: [
    // Measure from the row to the edge of the region that holds it.
    "[--bar-gap:var(--nav-bar-gap,0px)]",
    "[.nav.vertical_&]:top-(--bar-inset) [.nav.vertical_&]:bottom-(--bar-inset)",
    "[.nav.vertical_&]:w-(--bar) [.nav.vertical_&]:inset-e-auto",
    "[.nav.vertical_&]:inset-s-[calc(var(--nav-bar-guide,calc(-1*(var(--bar-offset)+var(--bar))))-var(--control-border,0px))]",
    // Start bars of nested rows meet the disclosure content's start edge. Body
    // padding minus the row's own shift gives that distance.
    "[.nav.vertical_.disclosure-content_&]:[--bar-gap:calc(var(--disclosure-body-ps,0px)-var(--px,0px))]",
    // Named start offsets in guided content sit on the guide line. List
    // disclosure content exposes the list guide along its markers.
    "[.nav.vertical_.disclosure-content_&]:[&.nav-bar-guide:not(.nav-bar-end)]:[--nav-bar-guide:calc(var(--disclosure-guide)-var(--bar-gap)-var(--bar)/2)]",
    "[.nav.vertical_&]:[&.nav-bar-end]:inset-s-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
    // End bars of nested rows measure from the navigation padding, so the bar
    // follows a row that a padded body insets.
    "[.nav.vertical_.disclosure-content_&]:[&.nav-bar-end]:[--bar-gap:var(--nav-bar-gap,0px)]",
    "[.nav.horizontal_&]:inset-s-(--bar-inset) [.nav.horizontal_&]:inset-e-(--bar-inset)",
    "[.nav.horizontal_&]:h-(--bar)",
    // Rows can sit centered in a taller region, such as a shell bar that sets
    // --nav-block-size. A row taller than that region grows it, so the row and
    // the nav padding set the minimum. Percentages resolve against the row's
    // height.
    "[.nav.horizontal_&]:[--bar-gap:calc(max(var(--nav-block-size,0px),100%+var(--control-border,0px)*2+var(--nav-bar-gap,0px)*2)/2-50%-var(--control-border,0px))]",
    "[.nav.horizontal_&]:top-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
    "[.nav.horizontal_&]:[&.nav-bar-start]:top-auto",
    "[.nav.horizontal_&]:[&.nav-bar-start]:bottom-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
  ],
  variants: {
    /**
     * Places the bar at the row's start or end. In a horizontal navigation,
     * `start` draws it above the row and `end` below it. Defaults to the start
     * side in vertical navigations and the bottom in horizontal ones.
     */
    $side: {
      start: "nav-bar-start",
      end: "nav-bar-end",
    },
    /**
     * Sets the gap from the row to the bar. `edge` puts the bar on the
     * navigation padding edge, and `halfway` centers it between the row and
     * that edge. Numbers scale the spacing token, so `0` puts the bar against
     * the row; other strings are CSS lengths and can be negative for overlap.
     * Defaults to `edge`.
     *
     * The start bar of a nested row measures to the edge of its disclosure
     * content, and the end bar measures from the navigation padding, so it
     * follows a row that a padded body insets. In disclosure content with a
     * guide line, named offsets at the start side put the bar on the guide.
     * This includes the guide of a list along its markers, in list disclosure
     * content. A horizontal navigation scrolls, so it clips a bar outside its
     * padding. Its rows measure from their own height, so an `edge` bar under a
     * row shorter than the others stops short of the edge.
     */
    $offset(value?: BarOffset) {
      if (!isNamedBarOffset(value)) return getBarOffset(value);
      return [getNamedBarOffsetClass(value), "nav-bar-guide"];
    },
  },
  defaultVariants: {
    $offset: "edge",
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
    // A group that starts the navigation meets its edge, which needs no line.
    "first:border-t-0",
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
    // Keep the navigation surface visible through the disclosure root.
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
    // Align row text with the body. Move nested disclosures as a whole to keep
    // their guides aligned.
    "[&_li>.control:not(.disclosure-button)]:-ms-(--px)",
    "[&_li:has(>.disclosure-button)]:-ms-(--disclosure-px)",
    // Inset focus rings to prevent disclosure clipping, even when a row sets
    // its own `$focusOffset`.
    "[&_li>.control]:-outline-offset-2",
  ],
  // Without a split, leave the body unpadded so row ends and bars align with
  // top-level rows. Caller padding preserves the start indent.
  defaultVariants: {
    $layer: "transparent",
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
    $p: "var(--nav-body-inset, 0px)",
  },
});
