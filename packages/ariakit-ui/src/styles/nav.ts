import { cv, cx } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import type { BarOffset } from "./control.ts";
import {
  barBase,
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

// The thickness of a bar on the guide. Normalize the 0–100 contrast scale so
// high contrast adds only 20%, like other bars. Borders snap to device pixels,
// so a fractional width would draw the bar beside the guide instead of over it.
// The navigation resolves it for the rings of the markers, and each bar
// resolves it again with its own `$width`.
const navBarSizeClass = cx(
  "[--nav-bar-size:round(calc(var(--bar-width,2px)*(1+0.2*var(--contrast,0)/100)),1px)]",
);

// The gutter of a list with numbers, which holds half a number and the gap
// around it after the guide offset.
const navNumbersGutterClass = cx(
  "[--nav-guide-offset:--spacing(2)]",
  "[--nav-gutter:calc(var(--nav-guide-offset)+var(--nav-number-reach))]",
);

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
 * each current link. A style component can also cover a range of links with one
 * bar, as the table of contents does: it sets `--nav-bar-start` and
 * `--nav-bar-end` on each bar and marker, in pixels from the top of this
 * element.
 */
export const nav = cv({
  extend: [list, frame, segmentGroup],
  class: [
    // Keep rows at the start when the navigation region stretches.
    "nav content-start min-w-0",
    "[--nav-group-gap:--spacing(4)]",
    "[--nav-row-gap:--spacing(3)]",
    // Registered lengths resolve the row padding in the navigation font,
    // keeping smaller group labels aligned with rows.
    "[--nav-py:var(--list-item-padding)]",
    "[--nav-px:calc(var(--nav-py)+(1lh-1cap)*0.5)]",
    "relative isolate",
    // Bars in top-level rows reach the navigation padding edge.
    "[--nav-bar-gap:var(--ak-frame-padding)]",
    "[--nav-guide-width:1px]",
    // The indent of a nested list, which is also the width of a bend of the
    // guide. A list in a link row keeps the automatic indent of a list.
    "[--nav-indent:var(--list-indent,--spacing(3))]",
    navBarSizeClass,
    // The guide and the bar stop this far from a marker, so the surface around
    // the navigation shows between them, whatever it paints. A ring around a
    // marker draws in this gap with the width of the bar, so a wider bar widens
    // the gap to keep the ring off the number.
    "[--nav-marker-gap:max(--spacing(1),var(--nav-bar-size))]",
    // How far a number reaches from the guide: half a counter chip of a list,
    // and the gap. These stay unregistered, so they resolve in the font of
    // each element that reads them.
    "[--nav-number-size:calc(var(--list-marker-box,1.75em)-0.4em)]",
    "[--nav-number-reach:calc(var(--nav-number-size)/2+var(--nav-marker-gap))]",
    // How far the gap around a marker passes the first line of its link, above
    // and below it. A dot of the default size stays inside the line. A number
    // is taller than half a line, and a navigation has numbers when it is
    // ordered or when one of its lists is. The guide pieces read this length.
    // It is registered, so it resolves here once, in the font of the
    // navigation, and each glide frame doesn't evaluate it again on each piece.
    "[--nav-marker-overreach:max(0px,var(--list-bullet-size)/2+var(--nav-marker-gap)-0.5lh)]",
    "[.nav-numbers,:has(.nav-list-numbers)]:[--nav-marker-overreach:max(0px,max(var(--nav-number-reach),var(--list-bullet-size)/2+var(--nav-marker-gap))-0.5lh)]",
    // Colors resolve against this element, so pieces inside a current link
    // keep the colors of the surface around the rows.
    "[--nav-guide-color:var(--ak-edge)]",
    "[--nav-surface-color:var(--ak-layer)]",
    "forced-colors:[--nav-guide-color:GrayText]",
    "forced-colors:[--nav-surface-color:Canvas]",
    // A bar on the guide takes the text color at full strength.
    "[--nav-bar-color:oklch(from_var(--ak-text)_l_c_h/1)]",
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
        "[&:has(.nav-list-numbers)]:[--nav-gutter:calc(var(--nav-guide-offset)+var(--nav-number-reach))]",
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
      // A shrinkable track lets long rows truncate or wrap instead of widening
      // the navigation region.
      vertical: [
        "vertical grid grid-cols-[minmax(0,1fr)] [--list-layout:vertical]",
        // Disclosure content clips only its height animation, so end bars of
        // nested rows can reach the navigation padding.
        "[&_.disclosure-content]:overflow-x-visible",
      ],
      horizontal: [
        "[--list-layout:horizontal]",
        // A row with no overflow stays still under a sideways swipe.
        "horizontal flex items-start overflow-x-auto overscroll-x-none [&>.control,&>.nav-list>li>.control]:shrink-0 [&>.control,&>.nav-list>li>.control]:whitespace-nowrap",
        // A bar outside the padding must not let the row scroll vertically.
        "overflow-y-hidden",
        // The wider row gap lines up labels in a column, which a row lacks, so
        // rows use the button gap.
        "[&>.control,&>.nav-list>li>.control]:gap-[calc(var(--px)-var(--sidebearing))]",
        carouselFrameClass,
        // Bars in view transitions measure whether they show from the padding,
        // not from the scroll padding, which also covers the fades and buttons.
        "[--nav-bar-clip-inset:var(--ak-frame-padding)]",
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
    /** Sets the space between groups. Numbers scale the spacing token. */
    $groupGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-group-gap": getSpacingValue(value) },
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
        style: { "--nav-slot-size": getSpacingValue(value) },
      };
    },
    /**
     * Names the bar of the current link for view transitions, so a transition
     * moves the bar from the old link to the new one. Each navigation on a page
     * needs its own name, and a bar that moves across page loads needs the same
     * name on both pages. Set `none` to keep the bar out of view transitions.
     * `Nav` defaults it to a unique name from `useId`, which can differ between
     * pages. Only one link can be current while the bar is named. Browsers skip
     * a view transition that finds two bars with the same name. In browsers
     * with scroll-driven animations, an old bar that a horizontal navigation
     * clips stays out of the transition, so the bar of the new link fades in.
     */
    $barTransitionName(value?: string) {
      if (value == null) return;
      return {
        style: { "--bar-transition-name": value },
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
     * pixels. The `$width` of a bar replaces it for that bar. Defaults to 2px.
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
      fill: "nav-marker-fill",
      ring: "nav-marker-ring",
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
      addClass(["nav-numbers", navNumbersGutterClass]);
      return;
    }
    addClass([
      "[--nav-guide-offset:--spacing(2)] [--nav-gutter:calc(var(--nav-guide-offset)+(--spacing(1)))]",
      // One guide runs along all groups, so an outermost list with numbers
      // widens the gutter of every list.
      "[&:has(>.nav-list-numbers,>.nav-group>.nav-list-numbers)]:[--nav-gutter:calc(var(--nav-guide-offset)+var(--nav-number-reach))]",
    ]);
  },
});

/**
 * The grid that holds the rows of a part of a navigation, such as a group or a
 * nested list, with the gap of the navigation between them. A shrinkable track
 * lets long rows truncate or wrap instead of widening the grid.
 */
export const navRowsClass = cx(
  "grid grid-cols-[minmax(0,1fr)] content-start gap-(--list-gap)",
);

/**
 * A list whose rows participate directly in the navigation layout. In a
 * `navItem`, it is a nested list, which indents its rows. The indent and the
 * bends of the guide stop at the third level, so deeper rows line up with it.
 */
export const navList = cv({
  class: [
    // Disclosures and items with a nested list need their own layout box for
    // indentation and vertical spacing.
    "nav-list [&>li:not(.nav-disclosure,.nav-item)]:contents",
    // A number marker counts its row itself, like the marker of a list, so
    // this rule stops the implied increment of the list item.
    "[&>li]:[counter-increment:list-item_0]",
    // Depth flags for the guide pieces. A row bends in from its parent only in
    // the second and third levels, and bends out by at most the levels it can
    // return to.
    "[--nav-depth:0] [--nav-guide-in-cap:0] [--nav-guide-out-cap:2]",
    "[--nav-guide-lead:1]",
    "[.nav-item>&]:grid [.nav-item>&]:grid-cols-[minmax(0,1fr)]",
    "[.nav-item>&]:content-start [.nav-item>&]:gap-(--list-gap)",
    "[.nav-item>&]:ps-(--nav-indent) [.nav-item>&]:[--nav-depth:1]",
    "[.nav-item>&]:[--nav-guide-in-cap:1] [.nav-item>&]:[--nav-guide-out-cap:1]",
    "[.nav-item>&]:[--nav-guide-lead:0]",
    "[.nav-item_.nav-item>&]:[--nav-depth:2]",
    "[.nav-item_.nav-item>&]:[--nav-guide-out-cap:0]",
    "[.nav-item_.nav-item_.nav-item>&]:ps-0",
    "[.nav-item_.nav-item_.nav-item>&]:[--nav-guide-in-cap:0]",
    // The guide fades after the last row of the outermost list. Rows inherit
    // the flag only through the last item of each list.
    "[--nav-guide-tail:1] [.nav-item>&]:[--nav-guide-tail:inherit]",
    "[&>li:not(:last-child)]:[--nav-guide-tail:0]",
  ],
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
      counter: [
        "nav-list-numbers",
        listMarkerClasses.counter,
        "not-ui-list-guide:[--nav-guide-offset:--spacing(2)]",
        "not-ui-list-guide:[.nav-item>&]:ps-[calc(var(--nav-indent)+var(--nav-guide-offset)+var(--nav-number-reach))]",
      ],
      bullet: listMarkerClasses.bullet,
      // A navigation with a marker shows it only at the rows of its outermost
      // list.
      none: [
        "[.nav-item>&]:[--list-marker:initial]",
        "[.nav-item>&]:[--list-counter:initial]",
        "[.nav-item>&]:[--list-glyph:initial]",
      ],
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
    addClass(navNumbersGutterClass);
  },
});

/** A list item that holds a link and the nested list of its rows. */
export const navItem = cv({
  class: ["nav-item", navRowsClass],
});

/**
 * A navigation group with extra space before it, after other groups or rows, at
 * the top level of the navigation or in the body of a disclosure.
 */
export const navGroup = cv({
  class: [
    "nav-group shrink-0",
    navRowsClass,
    // The label lines up with the links of a list with numbers, as in an
    // ordered navigation.
    "has-[>.nav-list-numbers]:[--nav-guide-offset:--spacing(2)]",
    "has-[>.nav-list-numbers]:[--nav-gutter:calc(var(--nav-guide-offset)+var(--nav-number-reach))]",
    "[.nav.vertical>*+&]:mt-[calc(var(--nav-group-gap)-var(--list-gap))]",
    "[.nav.horizontal>*+&]:ms-[calc(var(--nav-group-gap)-var(--list-gap))]",
    "[.nav-disclosure-content-body>*+&]:mt-[calc(var(--nav-group-gap)-var(--list-gap))]",
  ],
  variants: {
    /**
     * Draws a line in the middle of the space before the group. A group that
     * starts the navigation has no line. The line spans the navigation's
     * padding, so a `Nav` with `$cover` draws it to its container's edges. In
     * the body of a disclosure, the line spans the body padding and reaches the
     * body edges.
     */
    $divider: [
      // The marker class outranks the spacing rules above. The line takes the
      // edge color of the navigation.
      "nav-group-divider border-(--ak-edge)",
      "[.nav.vertical>*+&.nav-group-divider]:border-t",
      "[.nav.vertical>*+&.nav-group-divider]:mt-[calc(var(--nav-group-gap)/2-var(--list-gap))]",
      "[.nav.vertical>*+&.nav-group-divider]:pt-[calc(var(--nav-group-gap)/2)]",
      // The group reads the navigation's inherited frame padding. Its margins
      // reach past that padding, and its own padding keeps the rows in place.
      "[.nav.vertical>*+&.nav-group-divider]:-mx-(--ak-frame-padding)",
      "[.nav.vertical>*+&.nav-group-divider]:px-(--ak-frame-padding)",
      "[.nav.horizontal>*+&.nav-group-divider]:border-s",
      "[.nav.horizontal>*+&.nav-group-divider]:ms-[calc(var(--nav-group-gap)/2-var(--list-gap))]",
      "[.nav.horizontal>*+&.nav-group-divider]:ps-[calc(var(--nav-group-gap)/2)]",
      "[.nav.horizontal>*+&.nav-group-divider]:-my-(--ak-frame-padding)",
      "[.nav.horizontal>*+&.nav-group-divider]:py-(--ak-frame-padding)",
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:border-t",
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:mt-[calc(var(--nav-group-gap)/2-var(--list-gap))]",
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:pt-[calc(var(--nav-group-gap)/2)]",
      // The body indents its start more than its end, so each side reaches past
      // its own padding.
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:-ms-(--disclosure-body-ps)",
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:ps-(--disclosure-body-ps)",
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:-me-(--ak-frame-padding)",
      "[.nav-disclosure-content-body>*+&.nav-group-divider]:pe-(--ak-frame-padding)",
    ],
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
    $dividerInset: [
      // The second marker class outranks the reach of the `$divider` rules.
      "nav-group-divider-inset",
      // Rows at the top level fill the navigation's content box.
      "[.nav.vertical>*+&.nav-group-divider.nav-group-divider-inset]:mx-0",
      "[.nav.vertical>*+&.nav-group-divider.nav-group-divider-inset]:px-0",
      "[.nav.horizontal>*+&.nav-group-divider.nav-group-divider-inset]:my-0",
      "[.nav.horizontal>*+&.nav-group-divider.nav-group-divider-inset]:py-0",
      // Rows in a disclosure body reach back over their own padding to align
      // their text with the body, and end with the body's content box.
      "[.nav-disclosure-content-body>*+&.nav-group-divider.nav-group-divider-inset]:-ms-(--nav-px)",
      "[.nav-disclosure-content-body>*+&.nav-group-divider.nav-group-divider-inset]:ps-(--nav-px)",
      "[.nav-disclosure-content-body>*+&.nav-group-divider.nav-group-divider-inset]:me-0",
      "[.nav-disclosure-content-body>*+&.nav-group-divider.nav-group-divider-inset]:pe-0",
    ],
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
    "nav-group-label font-medium text-start",
    // Line up with the text of the rows after the guide gutter. The gutter is
    // a registered length, so it resolves in the font of the navigation, not
    // the smaller font of the label.
    "ms-(--nav-gutter,0px)",
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
      return { style: { "--size": getSpacingValue(value) } };
    },
    /**
     * Sets horizontal slot margins. `auto` keeps the row gap before trailing
     * slots and the row padding after them; leading slots use the control
     * margin.
     */
    $mx: {
      auto: [
        "[*+&]:[--mx:calc((var(--py)-var(--px)+max(0px,var(--my)))*var(--slot-pull,1)*var(--control-inline,1))]",
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
    // The guide and the marker of the link read this class.
    "nav-link justify-start text-wrap",
    // Include optical padding so icon rows align with disclosures. Disable the
    // inherited gap variant below.
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
    $p: `var(--list-item-padding, ${getPaddingValue(2)})`,
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
      "[.nav.horizontal>&,.nav.horizontal>.nav-list>li>&]:font-normal",
    ]);
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
 * There, the label keeps the width of that heavier text and centers its text
 * instead of filling the row.
 */
export const navLinkLabel = cv({
  extend: [buttonLabel],
  class: [
    "group-has-[>.control-description]/control-content:ak-ink-100",
    "group-has-[>.control-description]/control-content:font-[calc(500+var(--contrast))]",
    // buttonLabel reserves the width of the heavier text from data-text, so
    // the row keeps its size when the link becomes current. A horizontal row
    // caps the label at the reserved width and centers the text in it, so both
    // sides of the text share the extra space. Taking the free space of a
    // wider row, or the width of a longer description, would move the text
    // away from the start.
    "in-[.nav.horizontal>.control,.nav.horizontal>.nav-list>li>.control]:data-text:max-w-fit",
    "in-[.nav.horizontal>.control,.nav.horizontal>.nav-list>li>.control]:data-text:text-center",
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
    // The item padding of the navigation, or the padding of a control outside a
    // navigation.
    $p: `var(--list-item-padding, ${getPaddingValue(2)})`,
  },
});

/** A navigation button content box that clips overflowing content. */
export const navButtonContent = cv({
  class: "block overflow-hidden",
});

/**
 * A thin bar inside a navigation link that marks it while current. Render it as
 * the link's last child. Vertical navigations draw it at the row's inline start
 * by default, and horizontal ones below the row. In a navigation with a guide,
 * `navLinkGuideBar` draws the bar on the guide instead.
 */
export const navLinkBar = cv({
  extend: [barBase],
  class: [
    // Measure from the row to the edge of the region that holds it.
    "[--bar-gap:var(--nav-bar-gap,0px)]",
    // The navigation's name lets view transitions move the bar between links.
    // The name must be unique, so it works only while one link is current.
    // Reduced motion keeps the bar out of view transitions.
    "motion-safe:[view-transition-name:var(--nav-bar-name,var(--bar-transition-name,none))] [view-transition-class:bar]",
    // A horizontal row scrolls, so a bar outside it can't take part.
    "[.nav.horizontal_&]:ui-nav-bar-clip",
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
  variants: {
    /**
     * Fills the parent frame's content box, collapses shared borders, and
     * matches its corners. The parent's `$orientation` controls rounding. Use
     * `$frameStart` and `$frameEnd` when DOM order does not identify the outer
     * corners.
     */
    $cover: [
      // Covering frames take the container radius, which a shell sidebar paints
      // square at its edges. The group and its sections paint square corners
      // too, and keep the frame radius for the corners of their rows.
      "rounded-none! *:rounded-none! [&>*>.disclosure-content>*]:rounded-none!",
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
  class: [
    "nav-disclosure",
    "[@container_style(--nav-slot-size)]:[--disclosure-icon-size:var(--nav-slot-size)]",
  ],
  variants: {
    /**
     * Separates the button and content with a border and content padding.
     * `false` clears inherited split state.
     */
    $split: {
      true: [
        // Inset rows on the body surface so their text lines up with the button
        // text at both ends.
        "[--nav-body-inset:max(0px,calc(var(--disclosure-padding)-var(--nav-py,--spacing(2))))]",
        // The body spans the section, so its rows stay concentric with the
        // section corners at the inset distance.
        "[--nav-body-row-radius:calc(var(--disclosure-radius)-var(--nav-body-inset))]",
      ],
      // Reset the values for nested sections; a split one sets its own.
      false: "[--nav-body-inset:0px] [--nav-body-row-radius:initial]",
    },
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
    "nav-disclosure-content-body",
    navRowsClass,
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
    // Group labels align with the row text too, after the gutter of a group
    // with numbers.
    "[&_.nav-group-label]:ms-[calc(var(--nav-gutter,0px)-var(--px))]",
    // Inset focus rings to prevent disclosure clipping, even when a row sets
    // its own `$focusOffset`.
    "[&_li>.control]:-outline-offset-2",
    // The guide and the markers of the navigation join its top-level links,
    // not the rows of a disclosure.
    "[--nav-gutter:0px] [--list-guide:0]",
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
  class: [
    "z-1 not-ui-list-guide:hidden",
    // Levels to bend in from the parent or out to an earlier level. The first
    // row of the outermost list starts the guide. The guide doesn't join the
    // rows of a disclosure, so the row after one starts the guide again.
    "[--nav-guide-first:0]",
    "[li:first-child>*>&]:[--nav-guide-first:var(--nav-guide-lead,0)]",
    "[li.nav-disclosure+li>*>&]:[--nav-guide-first:1]",
    "[--nav-guide-in-raw:0]",
    "[.nav-item>.nav-list>li:first-child>*>&]:[--nav-guide-in-raw:1]",
    "[--nav-guide-out-raw:0]",
    "[li:has(>.nav-list)+li>*>&]:[--nav-guide-out-raw:1]",
    "[li:has(>.nav-list>li:last-child>.nav-list)+li>*>&]:[--nav-guide-out-raw:2]",
    // The guide draws the bend and the line with the `--guide-*` values. A row
    // can bend out by two levels, which the span counts.
    "[--guide-in:calc(min(var(--nav-guide-in-raw),var(--nav-guide-in-cap,0))*var(--nav-guide-bends,1))]",
    "[--nav-guide-out:calc(min(var(--nav-guide-out-raw),var(--nav-guide-out-cap,0))*var(--nav-guide-bends,1))]",
    "[--guide-outward:min(1,var(--nav-guide-out))]",
    "[--guide-span:calc((var(--guide-in)+var(--nav-guide-out))*var(--nav-indent))]",
    // A bend runs from the end of the previous line, through the gap between
    // the rows, to the start of this one. All rows take the row padding that
    // the navigation resolves, so the pieces join when a link sets its own
    // padding. The gap around a marker must stay inside the piece of its own
    // link, so the joint moves toward the row edge by how far that gap passes
    // the first line. All pieces of a navigation move it by the same length.
    "[--nav-guide-joint:max(0px,var(--nav-py)-var(--nav-marker-overreach))]",
    "[--guide-bend-height:calc(var(--list-gap,0px)+var(--nav-guide-joint)*2)]",
    // The rail keeps the guide of the outermost list at every level.
    "[--nav-guide-x:calc(-1*var(--nav-guide-offset,0px)-(1-var(--nav-guide-bends,1))*var(--nav-depth,0)*var(--nav-indent))]",
    "top-[calc(var(--nav-guide-joint)-(1-var(--nav-guide-first))*var(--guide-bend-height))]",
    "bottom-(--nav-guide-joint)",
    "inset-s-[calc(var(--nav-guide-x)-var(--guide-width)/2-var(--guide-in)*var(--nav-indent))]",
    "w-[calc(var(--guide-span)+var(--guide-width))]",
    // A piece stops one gap before the marker of its link and starts again
    // one gap after it, so nothing paints around a marker to hide the piece.
    // A link without a marker keeps the whole piece. Only a piece with a
    // marker declares the hole, because a glide of the bar restyles every
    // piece in each frame.
    "ui-list-counter:[--nav-marker-cut:var(--nav-number-reach)]",
    "ui-list-bullet:[--nav-marker-cut:calc(var(--list-bullet-size)/2+var(--nav-marker-gap))]",
    // The center of the marker in the piece. It is on the line along the row,
    // which is at the end column after a bend in and at the start column
    // otherwise, and on the first line of the link. Mask positions are
    // physical, so right to left text swaps the columns.
    "ui-list-counter:[--nav-hole-x:calc((var(--guide-in)*var(--guide-dir)+(1-var(--guide-dir))/2)*var(--guide-span)+var(--guide-width)/2)]",
    "ui-list-bullet:[--nav-hole-x:calc((var(--guide-in)*var(--guide-dir)+(1-var(--guide-dir))/2)*var(--guide-span)+var(--guide-width)/2)]",
    "ui-list-counter:[--nav-hole-y:calc(var(--py,0px)+0.5lh-var(--nav-guide-joint)+(1-var(--nav-guide-first))*var(--guide-bend-height))]",
    "ui-list-bullet:[--nav-hole-y:calc(var(--py,0px)+0.5lh-var(--nav-guide-joint)+(1-var(--nav-guide-first))*var(--guide-bend-height))]",
    // A mask cuts the hole, because a bend can end inside it. The mask is 2em
    // larger than the piece on each side, so it keeps a line that draws
    // outside the box, such as a slanted bend.
    "ui-list-counter:[--nav-hole:radial-gradient(circle_at_calc(var(--nav-hole-x)+2em)_calc(var(--nav-hole-y)+2em),#0000_var(--nav-marker-cut),#000_0)]",
    "ui-list-bullet:[--nav-hole:radial-gradient(circle_at_calc(var(--nav-hole-x)+2em)_calc(var(--nav-hole-y)+2em),#0000_var(--nav-marker-cut),#000_0)]",
    "ui-list-counter:mask-(--nav-hole)",
    "ui-list-bullet:mask-(--nav-hole)",
    "mask-[-2em_-2em] mask-size-[calc(100%+4em)_calc(100%+4em)]",
    "mask-no-repeat mask-no-clip",
  ],
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
  class: [
    "nav-link-guide",
    "[--guide-width:var(--nav-guide-width,1px)]",
    // Fade out after the last row. The fade is a second mask layer over the
    // hole around the marker, in the box of the piece. The piece shows only
    // where both layers do. A piece without a marker has no hole, so its
    // second layer shows everything.
    "[--nav-guide-end:0]",
    "[li:last-child:not(:has(>.nav-list))>*>&]:[--nav-guide-end:1]",
    "[li:last-child:not(:has(>.nav-list))>*>&]:mask-[linear-gradient(to_bottom,#000_calc(100%-var(--nav-guide-tail,0)*var(--nav-guide-end)*(--spacing(2))),transparent),var(--nav-hole,linear-gradient(#000,#000))]",
    "[li:last-child:not(:has(>.nav-list))>*>&]:mask-position-[0_0,-2em_-2em]",
    "[li:last-child:not(:has(>.nav-list))>*>&]:mask-size-[100%_100%,calc(100%+4em)_calc(100%+4em)]",
    "[li:last-child:not(:has(>.nav-list))>*>&]:[mask-clip:border-box,no-clip]",
    "[li:last-child:not(:has(>.nav-list))>*>&]:mask-intersect",
  ],
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

// The timing that the glide of a bar and the fill of a marker share.
const navGlideTimingClass = cx(
  "duration-200 ease-[cubic-bezier(0.25,0.7,0.3,1)]",
);

/**
 * The bar of a link in a navigation with a guide: a hidden piece that draws its
 * part of the bar over the guide, with the bends of the guide. Every piece
 * shows only its part between `--nav-bar-start` and `--nav-bar-end`, measured
 * from `--nav-bar-top`, its own top relative to the same origin, so the pieces
 * of adjacent links join into one bar.
 *
 * By default, CSS sets these values in a current link, so the bar covers the
 * line along that link, or stops at its marker. A style component can measure
 * the pieces and set one range on every piece instead, as the table of contents
 * does, and `$glide` animates that range. `$radius` sets the radius of the
 * curves, which must match the guide piece of the link.
 */
export const navLinkGuideBar = cv({
  extend: [navLinkPiece],
  class: [
    // The class of every bar, which page styles select to keep bars out of a
    // view transition.
    "nav-link-guide-bar control-bar",
    navBarSizeClass,
    "[--guide-width:var(--nav-bar-size)] [--guide-color:var(--nav-bar-color)]",
    // Where the line along the row starts in the piece, after the bend from
    // the previous row.
    "[--nav-bar-row:calc((1-var(--nav-guide-first))*var(--guide-bend-height))]",
    // A bar stops at the marker of its link. The gap around a dot is shorter
    // than its row, so a bar that ran to the row edge would show past the gap.
    // The marker centers on the first line after the padding of its link,
    // which can differ from the joint of the guide.
    "[--nav-bar-marker-shift:calc(var(--py,0px)-var(--nav-guide-joint))]",
    "ui-list-counter:[--nav-bar-marker-top:calc(var(--nav-bar-marker-shift)+0.5lh-var(--nav-number-size)/2)]",
    "ui-list-counter:[--nav-bar-marker-bottom:calc(var(--nav-bar-marker-shift)+0.5lh+var(--nav-number-size)/2)]",
    "ui-list-bullet:[--nav-bar-marker-top:calc(var(--nav-bar-marker-shift)+0.5lh-var(--list-bullet-size)/2)]",
    "ui-list-bullet:[--nav-bar-marker-bottom:calc(var(--nav-bar-marker-shift)+0.5lh+var(--list-bullet-size)/2)]",
    // The range of a current link without a script. The style attribute of a
    // measured range wins over it.
    "group-ui-selected/control:[--nav-bar-start:calc(var(--nav-bar-row)+var(--nav-bar-marker-top,0px))]",
    "group-ui-selected/control:[--nav-bar-end:calc(var(--nav-bar-row)+var(--nav-bar-marker-bottom,100000px))]",
    // Negative side insets keep the slanted lines of diagonal bends whole. A
    // piece that the range doesn't cut keeps its edges outside the clip, which
    // otherwise leaves seams between pieces at fractional pixel positions.
    "[clip-path:inset(max(-1px,var(--nav-bar-start)-var(--nav-bar-top,0px))_-0.5em_max(-1px,var(--nav-bar-top,0px)+100%-var(--nav-bar-end))_-0.5em)]",
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
     * The bar of the current link then takes the view transition name of the
     * navigation, like a bar outside the guide.
     */
    $glide: {
      true: [
        navGlideTimingClass,
        "transition-[--nav-bar-start,--nav-bar-end] motion-reduce:transition-none",
      ],
      false: [
        "[view-transition-class:bar]",
        "motion-safe:group-ui-selected/control:[view-transition-name:var(--bar-transition-name,none)]",
      ],
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
    "nav-link-marker",
    navGlideTimingClass,
    // Only a list with numbers or dots shows the marker. A dot has no room
    // without a guide.
    "not-ui-list-counter:not-ui-list-bullet:hidden",
    "not-ui-list-guide:ui-list-bullet:hidden",
    // The marker sits outside the link, on the surface around the rows.
    "[.ak-layer>&]:ak-outset",
    // Center it on the guide and on the first line of the row. Like the guide
    // pieces, a marker in a nested list stays on the rail. The link selector
    // outranks the position of a marker in a list row.
    "[.nav-link>&]:[--list-marker-center-x:calc(-1*var(--nav-guide-offset,0px)-(1-var(--nav-guide-bends,1))*var(--nav-depth,0)*var(--nav-indent))]",
    "[.nav-link>&]:[--list-marker-center-y:calc(var(--py,0px)+0.5lh)]",
    // A dot takes the color of the guide, also in forced colors. The link
    // selector outranks the edge color of a list marker.
    "[.nav-link>&]:ui-list-bullet:[--ak-edge:var(--nav-guide-color)]",
    // The size of the marker as a length, which the clip of the fill needs.
    "[--nav-marker-size:var(--list-marker-size)]",
    "ui-list-bullet:[--nav-marker-size:var(--list-bullet-size)]",
    // Without a measured range, the bar on the guide of a current link covers
    // its marker. The bar comes before the marker in the link.
    "[.nav-link-guide-bar~&]:group-ui-selected/control:[--nav-bar-start:-100000px]",
    "[.nav-link-guide-bar~&]:group-ui-selected/control:[--nav-bar-end:100000px]",
    // Only the fill transitions, so the colors follow the theme at once and a
    // glide of the range doesn't restyle the marker in each frame. The fill
    // reads the timing from here.
    "transition-none",
    // The clip of a fill, which resolves here because the range doesn't
    // inherit. It stops at the edges of the marker, so the fill takes the whole
    // transition however far the range moves, and only the markers that the
    // bar reaches animate, which needs lengths instead of percentages. The
    // fill starts from the side of the bar. An empty clip passes the edge, so
    // a fractional size leaves no line. The style component sets the duration
    // to zero on a marker that a measured range leaves, which empties it at
    // once, and on the first range.
    "[--nav-fill-clip:inset(min(var(--nav-marker-size)+1px,max(-1px,var(--nav-bar-start)-var(--nav-bar-top,0px)))_-1px_min(var(--nav-marker-size)+1px,max(-1px,var(--nav-bar-top,0px)+var(--nav-marker-size)-var(--nav-bar-end)))_-1px)]",
    // The ring is clipped to the range widened by the gap, so a marker is
    // either lit or not while the bar is still. An empty range, with no link
    // to cover, doesn't widen.
    "[--nav-ring-reach:min(var(--nav-marker-gap),max(0px,(var(--nav-bar-end)-var(--nav-bar-start))*1000))]",
    // The range doesn't inherit, so the ring takes it from the marker.
    "[.nav-marker-ring_&]:ui-list-guide:after:[--nav-bar-start:inherit]",
    "[.nav-marker-ring_&]:ui-list-guide:after:[--nav-bar-end:inherit]",
    "[.nav-marker-ring_&]:ui-list-guide:after:absolute",
    "[.nav-marker-ring_&]:ui-list-guide:after:-inset-(--nav-marker-gap)",
    "[.nav-marker-ring_&]:ui-list-guide:after:rounded-full",
    "[.nav-marker-ring_&]:ui-list-guide:after:border-solid",
    "[.nav-marker-ring_&]:ui-list-guide:after:border-(length:--nav-bar-size)",
    "[.nav-marker-ring_&]:ui-list-guide:after:border-(--nav-bar-color)",
    "[.nav-marker-ring_&]:ui-list-guide:after:[clip-path:inset(max(-2px,var(--nav-bar-start)-var(--nav-bar-top,0px)+var(--nav-marker-gap)-var(--nav-ring-reach))_-2px_max(-2px,var(--nav-bar-top,0px)+100%-var(--nav-bar-end)-var(--nav-marker-gap)-var(--nav-ring-reach))_-2px)]",
    // The fill shows only where the bar covers the marker. On a number, it
    // repeats the number in the surface color, so the number flips along with
    // the surface.
    "[.nav-marker-fill_&]:ui-list-guide:after:absolute",
    "[.nav-marker-fill_&]:ui-list-guide:after:inset-0",
    "[.nav-marker-fill_&]:ui-list-guide:after:grid",
    "[.nav-marker-fill_&]:ui-list-guide:after:place-items-center",
    "[.nav-marker-fill_&]:ui-list-guide:after:rounded-full",
    "[.nav-marker-fill_&]:ui-list-guide:after:bg-(--nav-bar-color)",
    "[.nav-marker-fill_&]:ui-list-guide:after:text-(--nav-surface-color)",
    "[.nav-marker-fill_&]:ui-list-guide:ui-list-counter:after:content-[counter(list-item)]",
    "[.nav-marker-fill_&]:ui-list-guide:after:font-semibold",
    "[.nav-marker-fill_&]:ui-list-guide:after:leading-(--nav-marker-size)",
    "[.nav-marker-fill_&]:ui-list-guide:after:[font-size-adjust:0.45]",
    "[.nav-marker-fill_&]:ui-list-guide:after:[clip-path:var(--nav-fill-clip)]",
    "[.nav-marker-fill_&]:ui-list-guide:after:transition-[clip-path]",
    "[.nav-marker-fill_&]:ui-list-guide:after:duration-(--nav-fill-duration,inherit)",
    "[.nav-marker-fill_&]:ui-list-guide:after:ease-[inherit]",
    "motion-reduce:[.nav-marker-fill_&]:ui-list-guide:after:transition-none",
  ],
  variants: {
    /**
     * Animates the ring of `$markerHighlight` with the range, for a range that
     * a style component measures and sets on every piece, like `$glide` on the
     * bar of the link. Only the ring glides, so other markers don't restyle in
     * each frame of a glide.
     */
    $glide: {
      true: [
        "[.nav-marker-ring_&]:ui-list-guide:transition-[--nav-bar-start,--nav-bar-end]",
        "motion-reduce:[.nav-marker-ring_&]:ui-list-guide:transition-none",
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
