import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import { frame, frameBase } from "./frame.ts";
import { glider } from "./glider.ts";
import { selected } from "./selected.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

export const nav = cv({
  extend: [frame],
  class: [
    // Rows use the root gap; adjacent groups add their own spacing. Pack them
    // at the start so a stretched nav does not spread its rows.
    "nav content-start gap-(--nav-gap) min-w-0",
    // Gap defaults the variants override through the style attribute.
    "[--nav-gap:--spacing(1)]",
    "[--nav-group-gap:--spacing(4)]",
    // The gap between a row's icon slot and its label, on a disclosure row
    // and on a plain row alike.
    "[--nav-row-gap:--spacing(3)]",
    // A row's padding, and where its content starts past its edge: the
    // control's default padding and its optical side padding on top (see
    // --py and --px in text-frame.ts). Both are measured in the nav's own line
    // box and font and registered as lengths (see ui.css), so a group
    // label in smaller text pads like a row and insets its text to the same
    // pixel.
    "[--nav-py:--spacing(2)]",
    "[--nav-px:calc(var(--nav-py)+(1lh-1cap)*0.5)]",
    // The box a glider positions against, and a stacking context that keeps
    // the glider's place in the paint order inside the nav.
    "relative isolate [--glider-padding:var(--ak-frame-padding)]",
  ],
  style: {
    anchorName: "--glider-frame",
    // A glider follows the rows through the first three names and finds the
    // guide line beside the row through the others (see navGlider). The scope
    // keeps them to this nav, so a glider never lands in another one.
    anchorScope:
      "--glider-frame, --glider-hover, --glider-focus, --glider-selected, --disclosure-guide-hover, --disclosure-guide-focus, --disclosure-guide-selected",
  },
  variants: {
    /**
     * Arranges top-level links in a column or one scrolling row. Groups and
     * disclosures keep their own vertical layout. Defaults to `vertical`.
     */
    $layout: {
      vertical: "vertical grid",
      horizontal:
        "horizontal flex items-start overflow-x-auto overscroll-x-contain [clip-path:inset(-100vmax_0)] [&>.control,&>.nav-list>li>.control]:shrink-0 [&>.control,&>.nav-list>li>.control]:whitespace-nowrap",
    },
    /**
     * Sets the space between rows. Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-gap": getSpacingValue(value) },
      };
    },
    /**
     * Sets the space between groups. Numbers scale the spacing token.
     */
    $groupGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-group-gap": getSpacingValue(value) },
      };
    },
    /**
     * Sets the icon slot size for nav icons and nav disclosures. It must live
     * on the root or an ancestor: the consumers read it as an inherited
     * property or through container style queries, which read the nearest
     * ancestor container. Numbers scale the spacing token.
     */
    $iconSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-icon-size": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $layout: "vertical",
    $layer: "transparent",
    $rounded: "md",
    $p: "none",
  },
});

export const navList = cv({
  // Disclosures keep a layout box for their indentation and vertical flow.
  class: "nav-list contents [&>li:not(.nav-disclosure)]:contents",
});

export const navGroup = cv({
  // The label sits one row gap over its list, on the rhythm of the rows.
  class:
    "nav-group grid content-start gap-(--nav-gap) shrink-0 [.nav.vertical>&+&]:mt-[calc(var(--nav-group-gap)-var(--nav-gap))] [.nav.horizontal>&+&]:ms-[calc(var(--nav-group-gap)-var(--nav-gap))]",
});

// The label of a group of rows. It takes the row padding above and below and
// starts its text where a row's content starts. Both lengths come from the nav
// (see --nav-py and --nav-px there): the label's own text is smaller, and the
// em-based spacing step would come out smaller in it.
export const navGroupLabel = cv({
  extend: [textFrame, text],
  class: ["ak-ink-60 font-medium text-[0.875em] text-start"],
  defaultVariants: {
    // The label pads like a row, with the lengths the nav measured in its own
    // font rather than the label's smaller one.
    $p: "var(--nav-py)",
    $px: "var(--nav-px)",
    $rounded: "md",
  },
});

// The size of an icon the nav sizes. navIcon and navLinkSlot share it, so that
// icon is the same in both. The auto size brings the auto margin (see $mx in
// control.ts), so an icon wider than the line keeps its label on the label
// column of a disclosure row, whose icon slot gets the same margin.
const navIconSizeVariants = {
  /**
   * Extends the slot sizes with `auto`, which follows the nav's `$iconSize` and
   * otherwise the text size.
   */
  $size: {
    auto: "[--size:var(--nav-icon-size,1em)]",
  },
};

// The icon slot of a nav row, sized by the nav's icon size. It is a control
// slot, so its outer box is one line square whatever the icon size: that is
// what keeps a wrapping label aligned to it. A standalone nav row, such as a
// brand link, can use it on its own.
export const navIcon = cv({
  extend: [buttonSlot],
  variants: {
    ...navIconSizeVariants,
  },
  defaultVariants: {
    $size: "auto",
  },
});

export const navLink = cv({
  extend: [button, selected],
  class: [
    "justify-start text-wrap",
    // Idle links on a dark layer read softer than their surface, and the
    // icon slot follows, because the ink inherits. The button's hover ink and
    // the selected ink below bring a row back to full strength.
    "ak-dark:ak-ink-70",
    // Links read as plain rows until they're current.
    "not-ui-selected:font-normal",
    // The row gap plus the control's extra side padding, which an icon slot
    // takes off, so a link with an icon lines up with the disclosure rows
    // around it. $gap is off below, so this is the only gap utility here.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    // Idle links sit flush with the surface around them; hover and current
    // still paint their own states.
    $lightnessOffset: false,
    $selectedPush: true,
    // Current links keep full text contrast on their pushed surface.
    $selectedInk: 100,
    $gap: "none",
  },
});

// A slot in a link's row: the icon that leads the label, or a badge, an avatar
// or a shortcut anywhere in the row. It is a control slot, so the label after
// its icon starts where the label of a disclosure row starts, whatever the
// nav's icon size is.
export const navLinkSlot = cv({
  extend: [buttonSlot],
  variants: {
    ...navIconSizeVariants,
  },
  defaultVariants: {
    $size(defaultValue, variants) {
      // Only an icon takes the nav's icon size. A badge, an avatar or a
      // shortcut keeps the size every other control slot gives it.
      if (variants.$kind !== "icon") return defaultValue;
      // Replace only the control slot's own default, so an extender's size
      // still applies.
      if (defaultValue !== "md") return defaultValue;
      return "auto";
    },
  },
});

// The label and the description stacked under it. A link turns the control's
// own gaps off to space its row by the nav's row gap (see navLink), so the
// content brings the two it reads.
export const navLinkContent = cv({
  extend: [buttonContent],
  class: [
    // The control's default gap, between a label and a description that share
    // one line.
    "[--gap:calc(var(--px)-var(--sidebearing))]",
    // The gap a disclosure row puts under its label (see $gapY in
    // disclosure.ts), so a link and a disclosure button with a description
    // stack alike.
    "[--gap-y:min(var(--py)/2,--spacing(2))]",
  ],
});

export const navLinkLabel = cv({
  extend: [buttonLabel],
  defaultVariants: {
    // A link's text wraps; a button's own label truncates to hold one line.
    $truncate: false,
  },
});

export const navLinkDescription = cv({
  extend: [buttonDescription],
  defaultVariants: {
    $truncate: false,
  },
});

// Shared row alignment for disclosure buttons and standalone navigation links.
export const navButton = cv({
  class: [
    // A row fills its list item. A button element would otherwise shrink to
    // its content, and a trailing slot would stop short of the row's end.
    "w-full justify-start overflow-clip whitespace-normal text-start",
    // Every row keeps the one gap, plus the control's extra side padding
    // that an icon slot takes off, with the nav's default for a row outside
    // a nav, such as a brand row. Important, because a disclosure
    // button spends its own gap channel on the same property.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]!",
  ],
});

export const navButtonContent = cv({
  class: "block overflow-hidden",
});

// A cover takes the box of the row it follows. It is placed from the top: a
// disclosure opening above the row moves the row, and a bottom inset, measured
// from the nav's moving end, would turn that into a travel of its own.
const navGliderCover = cx(
  "inset-s-[anchor(start)] top-[anchor(top)]",
  "w-[anchor-size()] h-[anchor-size()]",
);

// A glider that follows the rows of a nav, wherever they sit: in the nav's own
// list, in a group or in a disclosure. It is the nav's first child, so it
// paints under the rows, which are positioned and come after it, and it can
// travel from one list to another. The rows sit in list items, so the glider's
// own rules, which look for the control right beside it, are replaced by ones
// that look through the nav.
export const navGlider = cv({
  extend: [glider],
  class: [
    // At zero the glider paints over the surface behind the nav and under the
    // rows. A disclosure content paints no surface of its own in a nav (see
    // NavDisclosureContentBody), so a cover shows through it. Two gliders
    // paint in tree order: a later one over an earlier one.
    "z-0",
    // Firefox offsets an absolutely positioned anchor twice when its RTL
    // container scrolls. Fixed positioning follows the anchor's visible box.
    // The nav clips only its inline axis, so a bar can sit beyond its padding.
    "[.horizontal>&]:fixed!",
    // A row a disclosure is still revealing is clipped by the content around
    // it. The glider goes with the row while
    // none of it shows.
    "[position-visibility:anchors-visible]",
    // While a disclosure moves the rows, the nav says
    // so (see Nav), and the glider follows its row at once rather than easing
    // after it.
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
        // The bar reads as an edge on top of the rows, not a surface behind
        // them, so it reverses the stacking the base class sets.
        "z-10",
        // Raw --contrast spans 0-100, so it must be normalized before
        // scaling the bar thickness, or high-contrast mode inflates the bar
        // from 2px to 42px.
        "[--glider-bar:calc(--spacing(0.5)+(--spacing(0.1))*var(--contrast)/100)]",
        "[.vertical>&]:top-[anchor(top)] [.vertical>&]:h-[anchor-size()] [.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:inset-e-[calc(anchor(start)+var(--glider-bar-offset))]",
        "[.vertical>&]:[&.glider-bar-end]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-end]:inset-s-[calc(anchor(end)+var(--glider-bar-offset))]",
        // An automatic start bar keeps the nearest disclosure guide when one
        // exists. Otherwise the gap comes from this nav's frame padding.
        "[.vertical>&]:[&.glider-bar-auto:not(.glider-bar-end)]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-auto:not(.glider-bar-end)]:inset-s-[calc(anchor(var(--glider-guide)_center,calc(anchor(start)-var(--glider-bar-offset)-var(--glider-bar)/2))-var(--glider-bar)/2)]",
        "[.vertical>&]:[&.glider-bar-frame]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-frame]:inset-s-0",
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
        // Other engines can use this positioned nav's own frame edges. This
        // keeps document scrolling out of a second fixed-position anchor.
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame]:absolute!",
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame]:bottom-0",
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame.glider-bar-start]:bottom-auto",
        "[@supports_not_(-moz-appearance:none)]:[.horizontal>&]:[&.glider-bar-frame.glider-bar-start]:top-0",
      ];
    },
    /**
     * Sets which row state the glider follows. A row publishes the matching
     * anchor name only while it is in that state, so the glider lands on
     * whichever row is hovered, focused, or current right now. A row is the
     * control right inside a list item anywhere in the nav after the glider: a
     * link, or a disclosure button, which a hover or focus glider follows too.
     * Only a link is current.
     */
    $state(value?: "none" | "hover" | "focus" | "selected") {
      // Each state names the guide used by automatic $barOffset (glider.ts). A
      // state without one names a guide nothing publishes, which keeps the bar
      // on the fallback: the dummy the rows carry is a real anchor.
      if (value === "none") return "[--glider-guide:--glider-no-guide]";
      if (value === "hover") {
        return [
          "[position-anchor:--glider-hover] ease-linear",
          "[--glider-guide:--disclosure-guide-hover]",
          "[&~.control,&~*_li>.control]:ui-hover:[--glider-hover:--glider-hover]",
          // The pointer is crossing the gap between two rows, so the glider
          // waits on the last one for the next instead of leaving at once.
          "[.nav:hover:not(:has(:is(li>.control,.nav>.control):hover))>&]:delay-250",
          // With no row under the pointer the anchor is gone, and a glider
          // that stayed would fall to a point at the nav's start. It leaves
          // instead, after the delay above.
          "[.nav:not(:has(:is(li>.control,.nav>.control):hover))>&]:hidden",
          // The glider sits behind the row it covers, so the row has to stop
          // painting its own surface or it hides the glider. A disclosure
          // button paints its hover as a gradient, which the second rule
          // takes off.
          "supports-anchor:[&~.control,&~*_li>.control]:ui-hover:bg-transparent!",
          "supports-anchor:[&~.control,&~*_li>.control]:ui-hover:bg-none!",
          "supports-anchor:[&~.control,&~*_li>.control]:ui-hover:border-transparent",
          "supports-anchor:[&~.control,&~*_li>.control]:ui-hover:befter:hidden",
        ];
      }
      if (value === "focus") {
        return [
          "[position-anchor:--glider-focus] focus",
          "[--glider-guide:--disclosure-guide-focus]",
          "[&~.control,&~*_li>.control]:ui-focus-visible:[--glider-focus:--glider-focus]",
          // The ring is drawn only while one of the rows has keyboard focus;
          // the row's own ring goes with it.
          "[&:has(~.control:is(:focus-visible,[data-focus-visible]),~*_li>.control:is(:focus-visible,[data-focus-visible]))]:outline-2",
          "supports-anchor:[&~.control,&~*_li>.control]:ui-focus-visible:outline-none",
          "ak-outline ak-outline-brand outline-offset-1",
        ];
      }
      if (value === "selected") {
        return [
          "[position-anchor:--glider-selected] selected",
          "[--glider-guide:--disclosure-guide-selected]",
          "[&~.control,&~*_li>.control]:ui-selected:[--glider-selected:--glider-selected]",
          // With no current row there is no anchor to land on, and the glider
          // would stay as a blank square at the nav's start. A current row in
          // a closed disclosure counts as none, from the moment the content
          // starts to close: the glider is outside the content, so it would
          // stay in view while the content folds up.
          "not-ui-nav-glider-selected:hidden",
        ];
      }
      return;
    },
    /**
     * Animates the glider as it travels between rows.
     */
    $animated(value?: boolean) {
      if (!value) return;
      return "duration-100 transition-discrete";
    },
  },
  defaultVariants: {
    // A cover takes the row's own radius; a bar has none (see glider.ts), and
    // keeps none inside a disclosure body, where a nested frame would round its
    // ends to stay concentric.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      return "md";
    },
    $forceRounded(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    // A selected cover takes the same pushed surface as the current row.
    $lightnessOffset(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return false;
    },
    $lightnessPush(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $border(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return defaultValue ?? false;
    },
  },
  refine({ variants, addClass }) {
    if (variants.$animated) {
      // The insets are the longhands: WebKit passes over the inset-block and
      // inset-inline shorthands in a transition list. Only a hover glider keeps
      // display on the list, so it can wait out its delay before it leaves; a
      // current row's glider leaves at once with a closing disclosure.
      addClass(
        variants.$state === "hover"
          ? "transition-[top,left,inset-inline-start,inset-inline-end,border-color,height,width,outline,display]"
          : "transition-[top,left,inset-inline-start,inset-inline-end,border-color,height,width,outline]",
      );
    }
    if (variants.$state !== "selected") return;
    if (variants.$kind === "bar") return;
    // A cover takes over the row's surface. Beside a bar the row keeps its
    // surface, including any caller-provided edge.
    addClass([
      "supports-anchor:[&~.control,&~*_li>.control]:ui-selected:bg-transparent",
      "supports-anchor:[&~.control,&~*_li>.control]:ui-selected:ring-0",
      "supports-anchor:[&~.control,&~*_li>.control]:ui-selected:befter:hidden",
    ]);
  },
});

export const navDisclosure = cv({
  class: [
    "nav-disclosure",
    // Nav icons size the disclosure icon slot when an ancestor sets them.
    "[@container_style(--nav-icon-size)]:[--disclosure-icon-size:var(--nav-icon-size)]",
  ],
  style: {
    // The body indents by the row gap, the same one the button spends. The
    // style attribute is what beats the disclosure root's own gap.
    "--disclosure-gap": "var(--nav-row-gap, calc(var(--spacing) * 3))",
    // The body sits one nav gap under the button, the gap between rows, and the
    // guide starts there with it. The style attribute is what beats the root's
    // zero.
    "--disclosure-body-offset": "var(--nav-gap, calc(var(--spacing) * 1))",
  },
});

export const navDisclosureContentBody = cv({
  // frameBase, not frame: the body takes the radius, and any padding a caller
  // gives it, and paints nothing, so it must not open a layer of its own.
  extend: [frameBase],
  class: [
    "grid content-start gap-(--nav-gap)",
    // The rows are nested frames, so their radius is this one minus the body's
    // padding, which puts them on the disclosure's radius, the one its button
    // has, while a caller's padding stays under the frame system's 1rem cutoff
    // (see $p in frame.ts).
    "[--nav-body-radius:calc(var(--disclosure-radius)+var(--ak-frame-padding))]",
    // Pull a row back by its control inset so its text starts on the body. A
    // nested disclosure moves as a whole, so its guide stays under its leading
    // icon or indicator.
    "[&_li>.control:not(.disclosure-button)]:-ms-(--px)",
    "[&_li:has(>.disclosure-button)]:-ms-(--disclosure-px)",
    // A row can sit on an edge where the disclosure content clips: its end and
    // the last row's bottom while the body has no padding, and its start where
    // nothing indents the body (no guide, no leading icon), which a caller's
    // padding never changes. So rows here draw their focus ring inside their
    // box, like the disclosure button above them. This outranks a row's own
    // $focusOffset on purpose: an outset ring would be cut.
    "[&_li>.control]:-outline-offset-2",
  ],
  // No $p: the body pads nothing by itself, so its rows end where the button
  // ends and a bar or a cover on a row lands where it does on a top-level row.
  // The gap under the button comes from the disclosure (see navDisclosure), and
  // a caller's $p pads the rows inside it on every side but the start, which
  // keeps the label indent, with the content padding on, as a nav disclosure
  // keeps it by default.
  defaultVariants: {
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
  },
});
