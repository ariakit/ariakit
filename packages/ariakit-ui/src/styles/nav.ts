import { cv, cx } from "clava";
import {
  getEmPaddingValue,
  getContextSpacingValue,
  getEmSpacingValue,
} from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import type { BarOffset } from "./control.ts";
import {
  controlBarBase,
  getBarOffset,
  getNamedBarOffsetClass,
  isNamedBarOffset,
} from "./control.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
  disclosureGroup,
} from "./disclosure.ts";
import { hasEdgeColor } from "./edge.ts";
import { frame, frameBase } from "./frame.ts";
import { list, listGuide, listItemMarker, listMarkerClasses } from "./list.ts";
import {
  carouselFrameClass,
  isSegmentedKind,
  segmentGroup,
} from "./segment.ts";
import type { SlotSize } from "./slot-frame.ts";
import { getSlotSizeClass, isSlotSize } from "./slot-frame.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/**
 * A navigation region: a list whose rows are links, with groups and current-row
 * bars. Like a list, `$itemPadding` sets the padding of its rows, `$gap` sets
 * the space between them, and `$layout` sets their direction. A small default
 * padding keeps bars at named offsets outside their rows. With `$cover`, it
 * takes the parent's padding instead, such as in a shell sidebar.
 *
 * The links can have the markers and the guide of a list. `$marker` sets the
 * marker of the top-level links: `counter` for numbers, which `$ordered` also
 * sets, or `bullet` for dots. It defaults to `none`. `$markerSize` sets the
 * size of the numbers, and `$bulletSize` the size of the dots. `$guide` joins
 * the links with a guide that bends into nested lists, and `$indent` sets how
 * far the links of a nested list move in, which is also the width of a bend.
 * The indent and the bends stop at the third level. The markers and the guide
 * sit in a gutter before the links, so the surface of a link doesn't cover
 * them. They need a vertical navigation, and they don't join the rows of a
 * disclosure.
 *
 * With a guide, the bar of a link draws over the guide, and CSS shows it along
 * each current link. A style component can also measure the links and set one
 * range on all of them: `--nav-bar-start` and `--nav-bar-end` on each bar and
 * marker, in pixels from the top of this element. `Nav` covers the current link
 * in this way, so the bar glides along the guide to the next current link. The
 * table of contents covers the links of the sections on screen.
 */
export const nav = cv({
  extend: [list, frame, segmentGroup],
  class: [
    "ui-nav ui-nav-bar-size",
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:[--nav-guide-color:GrayText]",
    "forced-colors:[--nav-surface-color:Canvas]",
    "forced-colors:[--nav-bar-color:CanvasText]",
  ],
  variants: {
    /**
     * Sets the look of the guide along the links: `smooth` bends into nested
     * lists with curves, `diagonal` with slanted lines, `rail` keeps one
     * straight line for all levels, and `false` shows no guide. Defaults to
     * `false`.
     */
    $guide(value?: "smooth" | "diagonal" | "rail" | false) {
      // The guide of a navigation always has a shape, so the type leaves out
      // the `true` and `auto` values of a list guide. Guide pieces inherit
      // these flags: whether rows bend between levels, and whether a bend
      // curves or runs straight. The list flag centers dots on the guide.
      if (value === "smooth") {
        return "[--list-guide:1] [--nav-guide-bends:1] [--guide-curve:1]";
      }
      if (value === "diagonal") {
        return "[--list-guide:1] [--nav-guide-bends:1] [--guide-curve:0]";
      }
      if (value !== "rail") return "[--list-guide:0]";
      return cx(
        "[--list-guide:1] [--nav-guide-bends:0] [--guide-curve:1]",
        // Numbers of a nested list stay on the guide of the outermost list, so
        // that list needs the gutter of an ordered navigation.
        "[&:has(.ui-nav-list--marker-counter)]:[--nav-gutter:calc(var(--nav-guide-offset)+var(--nav-number-reach))]",
      );
    },
    /**
     * Arranges top-level links in a column (`vertical`) or one scrolling row
     * (`horizontal`). Groups and disclosures keep their own vertical layout. A
     * row hides its scrollbar, and as the viewport of a `carousel`, it fades
     * the links at each end while more links lie that way. Defaults to
     * `vertical`.
     */
    $layout: {
      vertical: "ui-vertical ui-nav--layout-vertical",
      horizontal: [
        "ui-nav--layout-horizontal",
        // A bar outside the padding must not let the row scroll vertically.
        // Stays a class to come after the overflow of
        // `ui-segment-group-scroll`, which it replaces.
        "overflow-y-hidden",
        carouselFrameClass,
      ],
    },
    /**
     * Fits a vertical navigation to the height of a flex column parent, such as
     * a `ShellSidebarBody`, and lets a child with its own `$fill`, such as a
     * `NavDisclosureGroup`, take the height left by the other rows.
     */
    $fill: "ui-nav--fill",
    /** Sets the space between groups. Numbers scale the spacing token. */
    $groupGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-group-gap": getEmSpacingValue(value) },
      };
    },
    /**
     * Sets navigation slot and disclosure icon sizes, except thumbnails and
     * text. Set this on the root or an ancestor: consumers read inherited
     * values and ancestor style queries. Numbers scale the spacing token.
     */
    $slotSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-slot-size": getEmSpacingValue(value) },
      };
    },
    // A link draws only numbers and dots, so the type leaves out the icons and
    // the dashes of a list. The default of a list resolves through `auto`, so
    // that value stays.
    $marker: {
      icon: null,
      dash: null,
    },
    /**
     * Sets the thickness of the bars of the links, and of the rings that
     * `$markerHighlight` draws. Numbers are pixels; other values are CSS
     * lengths. High contrast adds 20%, and a bar on the guide rounds to whole
     * pixels. The `$width` of a bar replaces it for that bar. Defaults to 2px,
     * or 3px on a light layer.
     */
    $barWidth(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--bar-width": width } };
    },
    /**
     * Sets how a marker shows that the bar on the guide covers it. `fill` fills
     * the marker with the bar color. `ring` draws a ring in the bar color
     * outside the marker, so the bar runs through it. `false` leaves it as it
     * is. Needs markers, a guide, and a bar. Defaults to `fill`.
     */
    $markerHighlight: {
      fill: "ui-nav--marker-highlight-fill",
      ring: "ui-nav--marker-highlight-ring",
      false: "",
    },
  },
  defaultVariants: {
    $layer: "transparent",
    $rounded: "xl",
    $markerHighlight: "fill",
    $marker(defaultValue) {
      // Links draw no marker. Replace only the automatic marker of a list, and
      // keep the numbers that `$ordered` picks.
      if (defaultValue !== "auto") return defaultValue;
      return "none";
    },
    $itemPadding: 2,
    // The list computes its own default, which this one replaces.
    $guide: () => false as const,
    $p(defaultValue, variants) {
      // A covering frame takes its padding from the parent.
      if (variants.$cover) return defaultValue;
      // Wider than a bar at every width that the style recipes set, so named
      // bar offsets keep the bar outside its row.
      return defaultValue ?? 1;
    },
    // A navigation always sets the space between its rows, which have their own
    // surfaces, so it derives none from a base gap. Segments keep the same
    // space between them as around them, as in a control group.
    $gap(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$kind !== "segmented") return 1;
      // A navigation has no joined corners, so its cells can't touch.
      if (variants.$p === "none") return 1;
      return "var(--ak-frame-padding)";
    },
  },
  refine({ variants, addClass }) {
    // Segments rarely draw bars, and a selected segment's shadow would paint
    // over an edge that the navigation reached over, so it stays inside.
    if (variants.$kind === "segmented") {
      addClass("[--nav-edge-start:0px]! [--nav-edge-end:0px]!");
    }
    const numbered = variants.$marker === "counter";
    if (variants.$guide === false && !numbered) {
      // Always set both, so a navigation in another one starts without a
      // gutter.
      addClass("[--nav-guide-offset:0px] [--nav-gutter:0px]");
      return;
    }
    // The guide and the markers sit in a gutter before the top-level rows.
    // Number markers need a wider gutter to stay inside the navigation. A
    // number overlaps the start of its row, which keeps the rows at the same
    // distance from the markers with and without a guide. The class tells the
    // navigation that its links have numbers.
    if (numbered) {
      addClass("ui-nav--numbers ui-nav-numbers-gutter");
      return;
    }
    addClass([
      "[--nav-guide-offset:calc(var(--spacing-em)*2)] [--nav-gutter:calc(var(--nav-guide-offset)+var(--spacing-em))]",
      // One guide runs along all groups, so an outermost list with numbers
      // widens the gutter of every list.
      "[&:has(>.ui-nav-list--marker-counter,>.ui-nav-group>.ui-nav-list--marker-counter)]:[--nav-gutter:calc(var(--nav-guide-offset)+var(--nav-number-reach))]",
    ]);
  },
});

/**
 * The grid that holds the rows of a part of a navigation, such as a group or a
 * nested list, with the gap of the navigation between them. A shrinkable track
 * lets long rows truncate or wrap instead of widening the grid.
 */
export const navRowsClass = cx(
  "ui-nav-rows",
  // Stays a class to come after the display of `proseColumn`, which it
  // replaces.
  "grid",
);

/**
 * A list whose rows participate directly in the navigation layout. In a
 * `navItem`, it is a nested list, which indents its rows. The indent and the
 * bends of the guide stop at the third level, so deeper rows line up with it.
 */
export const navList = cv({
  class: "ui-nav-list",
  variants: {
    /**
     * Gives the outermost list its own box with room for the guide and the
     * markers before its rows. The style component sets it in a navigation with
     * a guide or markers, and on an outermost list with numbers. A nested list
     * keeps its indent.
     */
    $gutter: {
      true: [navRowsClass, "ps-(--nav-gutter,0px)"],
      false: "contents",
    },
    /**
     * Sets the marker on the guide at the rows of a nested list, with the names
     * of the list markers. The list flags inherit to the marker of each link,
     * so only the rows of this list show one, and a list inside it sets its
     * own. `counter` numbers the rows, and the `ordered` prop of the style
     * component also sets it and renders an ordered list. The rows stay in
     * place, so a number overlaps the start of the surface of a current row.
     * Without a guide, a nested list also makes room for its numbers. `bullet`
     * draws a dot, which needs a guide. Defaults to `none`, which shows no
     * marker in a nested list and keeps the marker of the navigation in the
     * outermost list.
     */
    $marker: {
      counter: ["ui-nav-list--marker-counter", listMarkerClasses.counter],
      bullet: listMarkerClasses.bullet,
      // A navigation with a marker shows it only at the rows of its outermost
      // list.
      none: "ui-nav-list--marker-none",
    },
  },
  defaultVariants: {
    $marker: "none",
  },
  refine({ variants, addClass }) {
    // An outermost list with numbers makes room for them, like an ordered
    // navigation, such as in a group of a navigation without markers.
    if (!variants.$gutter) return;
    if (variants.$marker !== "counter") return;
    addClass("ui-nav-numbers-gutter");
  },
});

/** A list item that holds a link and the nested list of its rows. */
export const navItem = cv({
  class: ["ui-nav-item", navRowsClass],
});

/**
 * A navigation group with extra space before it, after other groups or rows, at
 * the top level of the navigation or in the body of a disclosure.
 */
export const navGroup = cv({
  class: ["ui-nav-group", navRowsClass],
  variants: {
    /**
     * Draws a line in the middle of the space before the group. A group that
     * starts the navigation has no line. The line spans the navigation's
     * padding, so a `Nav` with `$cover` draws it to its container's edges. In
     * the body of a disclosure, the line spans the body padding and reaches the
     * body edges.
     */
    $divider: "ui-nav-group--divider",
    /** Sets the line style of the `$divider` line. */
    $dividerLine: {
      solid: "border-solid",
      dashed: "border-dashed",
      dotted: "border-dotted",
    },
    /**
     * Keeps the `$divider` line within the rows, so it starts and ends with the
     * row backgrounds instead of reaching the container edges.
     */
    $dividerInset: "ui-nav-group--divider-inset",
  },
});

/**
 * A group label aligned with navigation row content despite its smaller text.
 */
export const navGroupLabel = cv({
  extend: [textFrame, text],
  class: [
    // The label takes the vertical padding of a row, so the space between the
    // label and the first row matches the space between rows. Its smaller text
    // and the group gap above it set it apart as a heading.
    "ui-nav-group-label",
    "font-medium",
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
    /** Disables the inherited variant; `$uppercase` sets the label size. */
    $size: null,
  },
  defaultVariants: {
    // Use lengths resolved by the navigation root, not the smaller label font.
    $p: "var(--nav-py)",
    $px: "var(--nav-px)",
    $rounded: "md",
    $ink: 60,
  },
});

/** Shared slot sizing and margins for navigation icons and boxes. */
const navSlotBase = cv({
  extend: [buttonSlot],
  variants: {
    /**
     * Sets the slot size. `auto` follows the navigation `$slotSize`, or the
     * text size; without `$slotSize`, a box after the label takes the line
     * height instead. Numbers scale the spacing token; other lengths apply
     * directly. `xl` and larger add label spacing, except for thumbnails and
     * text.
     */
    $size(value?: SlotSize | "auto" | number | (string & {})) {
      if (value == null) return;
      if (value === "auto") return "[--size:var(--nav-slot-size,1em)]";
      const named = getSlotSizeClass(value);
      if (named != null) return named;
      return { style: { "--size": getEmSpacingValue(value) } };
    },
    /**
     * Sets horizontal slot margins. `auto` keeps the row gap before trailing
     * slots and the row padding after them; leading slots use the control
     * margin.
     */
    $mx: {
      auto: [
        "ui-nav-slot-base--mx-auto",
        // Stays a class to come after the margin of `slotFrameSlot`, which it
        // replaces.
        "[*+&]:me-(--mx)",
      ],
    },
  },
  defaultVariants: {
    $size: "auto",
  },
});

/**
 * An icon, box, or text slot aligned with navigation labels. A box can hold a
 * badge, an avatar, or a keyboard key.
 */
export const navSlot = cv({
  extend: [navSlotBase],
  defaultVariants: {
    $size(defaultValue, variants) {
      if (defaultValue !== "auto") return defaultValue;
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
    if (variants.$kind !== "box") return;
    // A floating box sits on another slot, so it keeps the icon size.
    if (variants.$floating) return;
    // A box after the label takes the nav's $slotSize, or the line height like
    // a button box. A box before it sits in the icon column, where it keeps the
    // icon size. The variant class sorts after the base size class.
    if (variants.$size === "auto") {
      addClass("[*+&]:[--size:var(--nav-slot-size,1lh)]");
    }
  },
});

/** A navigation link with wrapping text and a distinct current-page state. */
export const navLink = cv({
  extend: [button],
  class: [
    "ui-nav-link",
    // Include optical padding so icon rows align with disclosures. Disable the
    // inherited gap variant below.
    // Stays a class to come after the gap of `slotFrame`, which it replaces.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    $lightnessOffset: false,
    $selectedPush: true,
    // Idle links dim their text, which inherits into slots. Hover and the
    // current link restore full ink.
    $ink: 80,
    $selectedInk: 100,
    $gap: "none",
    // The item padding of the navigation, like a list row, or the padding of a
    // control outside a navigation.
    $p: `var(--list-item-padding, ${getEmPaddingValue(2)})`,
  },
  refine({ variants, addClass }) {
    // Segments take their weight from the segmented kinds, like the segments of
    // other components.
    if (isSegmentedKind(variants.$kind)) return;
    addClass([
      "not-ui-selected:font-normal",
      // Rows in a horizontal navigation size to their text, so a heavier current
      // row would shift the rows after it. Its surface or bar marks it instead,
      // unless navLinkLabel reserves the heavier width from data-text.
      "[.ui-nav.ui-nav--layout-horizontal>&,.ui-nav.ui-nav--layout-horizontal>.ui-nav-list>li>&]:font-normal",
    ]);
  },
});

/** A navigation link label and description with shared control spacing. */
export const navLinkContent = cv({
  extend: [buttonContent],
  class: "ui-nav-link-content",
});

/**
 * A navigation link label that wraps instead of truncating and fills the row,
 * so trailing slots sit at its end. Beside a description, it keeps the ink and
 * weight of a current link, so it stands out from the description.
 *
 * Set `data-text` to the label text to keep the heavier weight of a current
 * link in a horizontal navigation, where rows otherwise use the normal weight.
 * There, the label keeps the width of that heavier text and centers its text
 * instead of filling the row.
 */
export const navLinkLabel = cv({
  extend: [buttonLabel],
  class: "ui-nav-link-label",
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
    "ui-nav-button",
    // Include optical padding so icon rows align with disclosures. Disable the
    // inherited gap variant below.
    // Stays a class to come after the gap of `slotFrame`, which it replaces.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    $rounded: "lg",
    $lightnessOffset: false,
    $gap: "none",
    // The item padding of the navigation, or the padding of a control outside a
    // navigation.
    $p: `var(--list-item-padding, ${getEmPaddingValue(2)})`,
  },
});

/** A navigation button content box that clips overflowing content. */
export const navButtonContent = cv({
  class: "ui-nav-button-content",
});

/**
 * A thin bar inside a navigation link that marks it while current. Render it as
 * the link's last child. Vertical navigations draw it at the row's inline start
 * by default, and horizontal ones below the row. When the current link changes
 * without a page load, the `Nav` style component moves a copy of the bar from
 * the old link to the new one, which the navigation draws. In a navigation with
 * a guide, `navLinkGuideBar` draws the bar on the guide instead.
 */
export const navLinkBar = cv({
  extend: [controlBarBase],
  class: "ui-nav-link-bar",
  variants: {
    /**
     * Places the bar at the row's start or end. In a horizontal navigation,
     * `start` draws it above the row and `end` below it. Defaults to the start
     * side in vertical navigations and the bottom in horizontal ones.
     */
    $side: {
      start: "ui-nav-link-bar--side-start",
      end: "ui-nav-link-bar--side-end",
    },
    /**
     * Sets the gap from the row to the bar. `edge` puts the bar on the
     * navigation padding edge, and `halfway` centers it between the row and
     * that edge. Numbers scale the spacing token, so `0` puts the bar against
     * the row; other strings are CSS lengths. Defaults to `edge`.
     *
     * A bar outside the row contrasts with the surface around it. A negative
     * number or a length that starts with `-`, such as `-0.5` or `-3px`, puts
     * the bar over the row and makes it contrast with the row instead. Other
     * offsets keep the outside contrast even when they put the bar over the
     * row, which can hide the bar in high contrast mode. This includes named
     * offsets with navigation padding thinner than the bar, such as with
     * `$p="none"`, and `calc()` or `var()` values that resolve to a negative
     * length. Use a negative number or a length that starts with `-` there.
     *
     * The start bar of a nested row measures to the edge of its disclosure
     * content, and the end bar measures from the navigation padding, so it
     * follows a row that a padded body insets. In disclosure content with a
     * guide line, named offsets at the start side put the bar on the guide.
     * This includes the guide of a list along its markers, in list disclosure
     * content. In a vertical navigation, `edge` bars cover its border, and the
     * facing edge of a shell sidebar when the navigation covers the sidebar
     * body. A horizontal navigation scrolls, so it clips a bar outside its
     * padding. It reaches over the border of its carousel root, and over the
     * facing edge of a shell header around it, so `edge` bars cover those
     * edges. In both layouts, `halfway` bars stay centered inside these edges,
     * and a ring lies outside the border, so `edge` bars stop inside it. The
     * rows of a horizontal navigation measure from their own height, so an
     * `edge` bar under a row shorter than the others stops short of the edge.
     */
    $offset(value?: BarOffset) {
      if (!isNamedBarOffset(value)) return getBarOffset(value);
      return [getNamedBarOffsetClass(value), "ui-nav-link-bar--guide"];
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
    "ui-nav-disclosure-group",
    // A group that starts the navigation meets its edge, which needs no line.
    "first:border-t-0",
  ],
  variants: {
    /**
     * Fills the parent frame's content box, collapses shared borders, and
     * matches its corners. The parent's `$orientation` controls rounding. Use
     * `$frameStart` and `$frameEnd` when DOM order does not identify the outer
     * corners.
     */
    $cover: [
      "ui-nav-disclosure-group--cover",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      "*:rounded-none!",
    ],
  },
  defaultVariants: {
    $cover: true,
  },
});

/**
 * A collapsible navigation section with aligned icons, labels, and nested rows.
 */
export const navDisclosure = cv({
  extend: [disclosure],
  class: "ui-nav-disclosure",
  variants: {
    /**
     * Separates the button and content with a border and content padding.
     * `false` clears inherited split state.
     */
    $split: {
      true: "ui-nav-disclosure--split-true",
      // Reset the values for nested sections; a split one sets its own.
      false: "ui-nav-disclosure--split-false",
    },
    /**
     * Sets icon and nested slot sizes for this section, including its content
     * indent. Overrides `$iconSize`. Numbers scale the spacing token.
     */
    $slotSize(value?: string | number) {
      if (value == null) return;
      // The button and the body indent read the icon size of this section, so
      // it resolves on the root. Nested rows read the slot size against their
      // own text size.
      return {
        style: {
          "--disclosure-icon-size": getContextSpacingValue(value),
          "--nav-slot-size": getEmSpacingValue(value),
        },
      };
    },
  },
  defaultVariants: {
    // Separate row and content spacing removes the need for a hover ramp.
    $contentPadding: true,
    $rounded: "lg",
    // The item padding of the navigation, like its other rows.
    $p: "var(--list-item-padding)",
    // Keep the navigation surface visible through the disclosure root.
    $layer: "transparent",
    $slotGap: "var(--nav-row-gap, calc(var(--spacing) * 3))",
    $bodyOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // The split body's own padding already separates its rows.
      if (variants.$split) return 0;
      return "var(--list-gap, calc(var(--spacing) * 1))";
    },
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
    "ui-nav-disclosure-content-body",
    navRowsClass,
    listMarkerClasses.none,
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

/**
 * Shared geometry of the pieces that draw along the guide of a link, such as
 * the guide itself. Each piece draws the bend from the previous row and the
 * line along its own row, so the pieces of all rows join into one guide. List
 * selectors decide the bends, so the guide renders before any script runs.
 */
export const navLinkPiece = cv({
  extend: [listGuide],
  class: "ui-nav-link-piece",
  defaultVariants: {
    // A piece takes its color from the navigation, which also sets system
    // colors in forced colors, so it needs no layer to resolve an edge.
    $layer: false,
    // The navigation sets the shape of the bends for all pieces.
    $bend: false,
  },
});

/**
 * A hidden piece of a link that draws its part of the guide. The edge variants
 * give it a color of its own, `$line` sets the line style, and `$radius` sets
 * the radius of the curves.
 */
export const navLinkGuide = cv({
  extend: [navLinkPiece],
  class: "ui-nav-link-guide",
  defaultVariants: {
    // An edge color resolves on the piece, against the surface around it.
    $layer(defaultValue, variants) {
      if (!hasEdgeColor(variants.$edge)) return defaultValue;
      return "transparent";
    },
  },
  refine({ variants, addClass }) {
    // Without an edge color of its own, the piece takes the color that the
    // navigation resolves. A class can't clear that color for a piece that has
    // one.
    if (hasEdgeColor(variants.$edge)) return;
    addClass("[--guide-color:var(--nav-guide-color)]");
  },
});

/**
 * The bar of a link in a navigation with a guide: a hidden piece that draws its
 * part of the bar over the guide, with the bends of the guide. Every piece
 * shows only its part between `--nav-bar-start` and `--nav-bar-end`, measured
 * from `--nav-bar-top`, its own top relative to the same origin, so the pieces
 * of adjacent links join into one bar.
 *
 * By default, CSS sets these values in a current link, so the bar covers the
 * line along that link, or stops at its marker. A style component can measure
 * the pieces and set one range on every piece instead, as `Nav` and the table
 * of contents do, and `$glide` animates that range. `$radius` sets the radius
 * of the curves, which must match the guide piece of the link.
 */
export const navLinkGuideBar = cv({
  extend: [navLinkPiece],
  class: [
    // A bar on the guide is a bar of its control too.
    "ui-bar",
    "ui-nav-link-guide-bar ui-nav-bar-size",
  ],
  variants: {
    /**
     * Sets the bar thickness. Numbers are pixels; other values are CSS lengths.
     * High contrast adds 20%, and the result rounds to whole pixels. Defaults
     * to the `$barWidth` of the navigation.
     */
    $width(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--bar-width": width } };
    },
    /**
     * Animates the range when it changes, for a range that a style component
     * measures and sets on every piece. Each piece animates the range itself,
     * which restyles only that piece in each frame. The pieces get the same
     * range at the same time, so they glide as one bar through the bends.
     * Without it, the range comes from CSS and changes at once, because a glide
     * from the empty range of another link would show the bend for a moment.
     */
    $glide: {
      true: [
        "ui-nav-glide-timing ui-nav-link-guide-bar--glide-true",
        // Stays a class to come after the classes of a caller, so that the
        // reduced motion rule still applies.
        "motion-reduce:transition-none",
      ],
      false: "",
    },
  },
  defaultVariants: {
    $glide: false,
  },
});

/**
 * A hidden marker on the guide at a link. It is the marker of a list, so the
 * list flags of the navigation and of each `navList` pick a number or a dot,
 * `$markerSize` on the navigation sets the size of the numbers, and
 * `$bulletSize` sets the size of the dots. Unlike in a list row, it sits on the
 * guide before the link, and the guide and the bar stop one gap before it. A
 * dot needs a guide. With `$markerHighlight` on the navigation, the marker
 * fills with the bar color where a bar on the guide passes, or a ring in the
 * gap lights up.
 */
export const navLinkMarker = cv({
  extend: [listItemMarker],
  class: [
    "ui-nav-link-marker ui-nav-glide-timing",
    // The marker sits outside the link, on the surface around the rows.
    "[.ak-layer>&]:ak-outset",
    // Outside the link, the marker takes no room in its row, so the rules that
    // find the first and last item of the row skip it by this class.
    "ui-slot-frame-floating",
  ],
  variants: {
    /**
     * Animates the highlight of `$markerHighlight` with the range, for a range
     * that a style component measures and sets on every piece, like `$glide` on
     * the bar of the link. The highlight animates the range with the timing of
     * the bar, so a fill grows as the bar arrives and shrinks as the bar
     * leaves, and a ring lights up while the bar passes. A marker without a
     * highlight doesn't animate. Without it, the highlight changes at once.
     */
    $glide: {
      true: [
        // Stays a class, so that another class here that sets the transition
        // still comes after it and replaces it.
        "[.ui-nav--marker-highlight-ring_&]:ui-list-guide:after:transition-[--nav-bar-start,--nav-bar-end]",
        // Stays a class to come after another class here that sets the
        // transition, which it replaces.
        "[.ui-nav--marker-highlight-ring_&]:ui-list-guide:after:duration-[inherit]",
        "[.ui-nav--marker-highlight-ring_&]:ui-list-guide:after:ease-[inherit]",
        "motion-reduce:[.ui-nav--marker-highlight-ring_&]:ui-list-guide:after:transition-none",
        // Stays a class, so that another class here that sets the transition
        // still comes after it and replaces it.
        "[.ui-nav--marker-highlight-fill_&]:ui-list-guide:after:transition-[--nav-bar-start,--nav-bar-end]",
        "[.ui-nav--marker-highlight-fill_&]:ui-list-guide:after:duration-[inherit]",
        "[.ui-nav--marker-highlight-fill_&]:ui-list-guide:after:ease-[inherit]",
        "motion-reduce:[.ui-nav--marker-highlight-fill_&]:ui-list-guide:after:transition-none",
      ],
      false: "",
    },
  },
  defaultVariants: {
    // A number keeps full ink, like the counter of a list. A link dims its text
    // while it is not current.
    $ink: 100,
    $glide: false,
  },
});
