import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { frame, frameBase } from "./frame.ts";
import { glider, gliderCover } from "./glider.ts";
import { text } from "./text.ts";

export const nav = cv({
  class: [
    // Groups stack on the root at their own gap. A nav with one list has
    // nothing to space.
    "grid gap-(--nav-group-gap)",
    // Gap defaults the variants override through the style attribute.
    "[--nav-gap:--spacing(1)]",
    "[--nav-group-gap:--spacing(4)]",
    // The gap between a row's icon slot and its label, on a disclosure row
    // and on a plain row alike.
    "[--nav-row-gap:--spacing(3)]",
    // A row's padding, and where its content starts past its edge: the
    // control's default padding and its extra side padding on top (see --py
    // and --px in control.ts). Both are measured in the nav's own line box
    // and font and registered as lengths (see ariakit.css), so a group label
    // in smaller text pads like a row and insets its text to the same pixel.
    "[--nav-py:--spacing(2)]",
    "[--nav-px:calc(var(--nav-py)+(1lh-1cap)*0.5)]",
    // The box a glider in a list outside a disclosure positions against, and
    // a stacking context that keeps the glider's place in the paint order
    // inside the nav. Inside a disclosure the content is both of these.
    "relative isolate",
  ],
  variants: {
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
     * on the root (or an ancestor such as the sidebar): the consumers read it
     * as an inherited property or through container style queries, which read
     * the nearest ancestor container. Numbers scale the spacing token.
     */
    $iconSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--nav-icon-size": getSpacingValue(value) },
      };
    },
  },
});

export const navList = cv({
  // The marker is what a glider's hover rules read the list through.
  class: "nav-list grid gap-(--nav-gap)",
  style: {
    // A glider in the list follows its rows through these names, and the scope
    // keeps them to this list, so the glider of a nested list never lands on a
    // row outside it (see navGlider).
    anchorScope: "--glider-hover, --glider-focus, --glider-selected",
  },
});

export const navGroup = cv({
  // The label sits one row gap over its list, on the rhythm of the rows.
  class: "grid gap-(--nav-gap)",
});

// The label of a group of rows. It takes the row padding above and below and
// starts its text where a row's content starts. Both lengths come from the nav
// (see --nav-py and --nav-px there): the label's own text is smaller, and the
// em-based spacing step would come out smaller in it.
export const navGroupLabel = cv({
  extend: [frame, text],
  class: [
    "[--py:var(--ak-frame-padding,0px)] [--px:var(--nav-px)] px-(--px) py-(--py)",
    "ak-ink-60 font-medium text-[0.875em] text-start",
    // The label folds away with the sidebar, on the sidebar's own clock.
    "overflow-clip [interpolate-size:allow-keywords]",
    "transition-[height,padding,opacity] duration-(--sidebar-duration)",
    "ui-sidebar-collapsed:h-0 ui-sidebar-collapsed:py-0",
    "ui-sidebar-collapsed:opacity-0",
  ],
  defaultVariants: {
    $p: "var(--nav-py)",
    $rounded: "md",
  },
});

// The icon slot of a nav row, sized by the nav's icon size. It is a control
// slot, so its outer box is one line square whatever the icon size: that is
// what keeps a wrapping label aligned to it, and what lets a collapsed row
// centre it with one padding. A standalone nav row, such as a sidebar brand
// link, can use it on its own.
export const navIcon = cv({
  extend: [buttonSlot],
  class: "[--size:var(--nav-icon-size,1em)]",
  defaultVariants: {
    // The size comes from the class above, not from a named step.
    $size: "unset",
  },
});

export const navLink = cv({
  extend: [button],
  class: [
    "justify-start text-wrap",
    "ak-dark:ak-ink-70",
    // Links read as plain rows until they're current.
    "not-ui-nav-current:font-normal",
    "ui-hover:ak-ink-100",
    // The current link holds a raised surface outlined from the inside.
    "ui-nav-current:ak-layer ui-nav-current:ak-layer-5",
    "ui-nav-current:ak-ink-100",
    "ui-nav-current:ak-edge-0",
    "ui-nav-current:ring ui-nav-current:ring-inset",
    // A current link is already lifted, so hovering must not lift it again.
    // The stacked form sorts after the button's own single-variant hover.
    "ui-nav-current:ui-hover:ak-state-0",
    // The row gap plus the control's extra side padding, which an icon slot
    // takes off, so a link with an icon lines up with the disclosure rows
    // around it. $gap is off below, so this is the only gap utility here.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]",
  ],
  defaultVariants: {
    // Idle links sit flush with the surface around them; hover and current
    // still paint their own states.
    $lightnessOffset: false,
    $gap: "none",
  },
});

// The additions layered onto a disclosure button, or onto a plain link such as
// a sidebar brand row, to make it a nav row that collapses with the sidebar.
// Not disclosure-specific, which is why it is not named for one.
export const navButton = cv({
  class: [
    "justify-start overflow-clip whitespace-normal text-start",
    // The press rides on this list at its own duration, so the row components
    // pass $transition off; a second list on the row would only compete with
    // this one.
    "transition-[gap,width,height,padding,var(--active-transition)] transition-discrete delay-0",
    "duration-[var(--sidebar-duration),var(--sidebar-duration),var(--sidebar-duration),var(--sidebar-duration),var(--active-duration)]",
    "[interpolate-size:allow-keywords]",
    // Every row keeps the one gap, plus the control's extra side padding
    // that an icon slot takes off, with the nav's default for a row outside
    // a nav, such as a sidebar brand row. Important, because a disclosure
    // button spends its own gap channel on the same property.
    "gap-[calc(var(--nav-row-gap,--spacing(3))+var(--px)-var(--py))]!",
    // Collapsing squares the button around the icon and hides the rest.
    "[--nav-button-size:calc(var(--sidebar-min-width)-(--spacing(2)))]",
    "ui-sidebar-collapsed:size-(--nav-button-size)",
    "ui-sidebar-collapsed:gap-0!",
    // The icon slot's outer box is one line tall and, across, one line less
    // the control's extra side padding twice, which its margins take off.
    // So the square centres it with the block padding below, plus that
    // extra on each side. Padding is in the transition above, and nothing
    // about the icon itself changes, so both directions stay smooth.
    // Important, so the icon keeps equal padding on both sides: a disclosure
    // button spends its start padding on a ps-* longhand, and a longhand
    // sorts after the shorthand.
    "[--nav-button-p:calc((var(--nav-button-size)-1lh)*0.5)]",
    "ui-sidebar-collapsed:py-(--nav-button-p)!",
    "ui-sidebar-collapsed:px-[calc(var(--nav-button-p)+var(--px)-var(--py))]!",
    "ui-sidebar-collapsed:**:data-disclosure-indicator:opacity-0",
  ],
});

// The label collapses along with the sidebar, staging its height and opacity so
// the text fades before the width animates. It pairs with navButton, on a
// disclosure row or a plain link alike.
export const navButtonContent = cv({
  class: [
    "block overflow-hidden transition-[translate,height,opacity]",
    "transition-discrete",
    "[interpolate-size:allow-keywords]",
    "duration-(--sidebar-duration)",
    "delay-[0ms,var(--sidebar-duration),0ms]",
    "ui-sidebar-collapsed:h-lh ui-sidebar-collapsed:opacity-0",
    "ui-sidebar-collapsed:delay-0",
    "ui-sidebar-collapsed:duration-[var(--sidebar-duration),0ms,var(--sidebar-duration)]",
  ],
});

// A glider that follows the rows of a nav list, as the list's first item, so it
// leaves with the list when a disclosure closes. The rows sit in list items, so
// the glider's own rules, which look for the control right beside it, are
// replaced by ones that look through the items after it. The item is
// presentational; the list's anchor scope keeps the glider to the list's own
// rows.
export const navGlider = cv({
  extend: [glider],
  class: [
    // The glider's box is the disclosure content, and the content body in
    // between paints a surface that a glider below zero would sit under. At
    // zero the glider paints over every surface in the content and, coming
    // first, under the rows, which are positioned too and paint in tree
    // order. So do two gliders: a later one paints over an earlier one.
    "z-0",
  ],
  variants: {
    /**
     * Sets how the glider is drawn. `flat` and `bevel` cover the row they
     * follow, while `bar` is a thin rule beside it, on the side `$side` picks.
     */
    $kind(value?: "flat" | "bevel" | "bar") {
      if (value === "flat") return gliderCover;
      if (value === "bevel") return ["ui-bevel", gliderCover];
      if (value !== "bar") return;
      return [
        // The bar reads as an edge on top of the rows, not a surface behind
        // them, so it reverses the stacking the base class sets.
        "z-10",
        // Raw --contrast spans 0-100, so it must be normalized before
        // scaling the bar thickness, or high-contrast mode inflates the bar
        // from 2px to 42px.
        "[--glider-bar:calc(--spacing(0.5)+(--spacing(0.1))*var(--contrast)/100)]",
        "bottom-[anchor(bottom)] h-[anchor-size()] w-(--glider-bar)",
      ];
    },
    /**
     * The side a bar sits on. At the `start` it is centred on the guide line of
     * the disclosure content around the list, when there is one, and otherwise
     * it sits on the row's start edge. At the `end` it sits on the row's end
     * edge.
     */
    $side: {
      // The guide is a named anchor the disclosure content scopes to itself
      // (see $guide in disclosure.ts). Without one in scope the fallback puts
      // the bar's centre half a bar past the row's start edge.
      start:
        "inset-s-[calc(anchor(--disclosure-guide_center,calc(anchor(start)+var(--glider-bar)/2))-var(--glider-bar)/2)]",
      end: "inset-e-[anchor(end)]",
    },
    /**
     * Sets which row state the glider follows. A row publishes the matching
     * anchor name only while it is in that state, so the glider lands on
     * whichever row is hovered, focused, or current right now.
     */
    $state(value?: "none" | "hover" | "focus" | "selected") {
      if (value === "hover") {
        return [
          "[position-anchor:--glider-hover] ease-linear",
          "[&~li>.control]:ui-hover:[--glider-hover:--glider-hover]",
          // The pointer is crossing the gap between two rows, so the glider
          // waits on the last one for the next instead of leaving at once.
          "[.nav-list:hover:not(:has(>li>.control:hover))>&]:delay-250",
          // With none of the list's own rows under the pointer the anchor is
          // gone, and a glider that stayed would fall to a point at the
          // list's start. It leaves instead, after the delay above. Only the
          // list's own rows count: a nested list's rows anchor its own
          // glider.
          "[.nav-list:not(:has(>li>.control:hover))>&]:hidden",
          // The glider sits behind the row it covers, so the row has to stop
          // painting its own surface or it hides the glider.
          "supports-anchor:[&~li>.control]:ui-hover:bg-transparent!",
          "supports-anchor:[&~li>.control]:ui-hover:border-transparent",
          "supports-anchor:[&~li>.control]:ui-hover:befter:hidden",
        ];
      }
      if (value === "focus") {
        return [
          "[position-anchor:--glider-focus] focus",
          "[&~li>.control]:ui-focus-visible:[--glider-focus:--glider-focus]",
          // The ring is drawn only while one of the list's rows has keyboard
          // focus; the row's own ring goes with it.
          "[&:has(~li>.control:is(:focus-visible,[data-focus-visible]))]:outline-2",
          "supports-anchor:[&~li>.control]:ui-focus-visible:outline-none",
          "ak-outline ak-outline-brand outline-offset-1",
        ];
      }
      if (value === "selected") {
        return [
          "[position-anchor:--glider-selected] selected",
          "[&~li>.control]:ui-nav-current:[--glider-selected:--glider-selected]",
          // With no current row there is no anchor to land on, and the glider
          // would stay as a blank square at the list's start.
          "not-[&:has(~li>.control:where([aria-current='page'],[aria-current='true']))]:hidden",
          // The current row hands its raised surface and its inset ring over
          // to the glider, which draws both (see the defaults below).
          "supports-anchor:[&~li>.control]:ui-nav-current:bg-transparent",
          "supports-anchor:[&~li>.control]:ui-nav-current:ring-0",
          "supports-anchor:[&~li>.control]:ui-nav-current:befter:hidden",
        ];
      }
      return;
    },
    /**
     * Animates the glider as it travels between rows.
     */
    $animated(value?: boolean) {
      if (!value) return;
      return [
        // display is on the list so a leaving hover glider can wait out its
        // delay first; the discrete behaviour is what lets display take part.
        // The insets are the longhands: WebKit passes over the inset-block
        // and inset-inline shorthands in a transition list.
        "transition-[bottom,inset-inline-start,inset-inline-end,border-color,height,width,outline,display]",
        "duration-100 transition-discrete",
      ];
    },
  },
  defaultVariants: {
    $side(defaultValue, variants) {
      if (variants.$kind !== "bar") return;
      return defaultValue ?? "start";
    },
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
    // A selected cover is the current row's surface: one step off the surface
    // around it, as the row's own is (see navLink), with the row's inset ring.
    $lightnessOffset(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return 1;
    },
    $borderType(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return "inset";
    },
    $border(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "bar") return defaultValue;
      return defaultValue ?? true;
    },
  },
});

export const navDisclosure = cv({
  class: [
    // Nav icons size the disclosure icon slot when an ancestor sets them.
    "[@container_style(--nav-icon-size)]:[--disclosure-icon-size:var(--nav-icon-size)]",
  ],
  style: {
    // The body indents by the row gap, the same one the button spends. The
    // style attribute is what beats the disclosure root's own gap.
    "--disclosure-gap": "var(--nav-row-gap, calc(var(--spacing) * 3))",
  },
});

export const navDisclosureContent = cv({
  class: ["ui-sidebar-collapsed:h-0 ui-sidebar-collapsed:w-0"],
});

export const navDisclosureContentBody = cv({
  // frameBase, not frame: the body takes the padding and radius and paints
  // nothing, so it must not open a layer of its own.
  extend: [frameBase],
  class: [
    "[--nav-body-padding:calc(var(--nav-gap)*0.5)]",
    "[--nav-body-radius:calc(var(--disclosure-radius)+var(--nav-body-padding))]",
    // The body starts on the row's label. A row's text sits its own control
    // inset past its pill, so each row pulls its pill back by that inset and
    // its text lands on the label, however the lists and groups nest.
    "[&_li>.control]:-ms-(--px)",
  ],
  defaultVariants: {
    $forceRounded: true,
    $rounded: "var(--nav-body-radius)",
    $p: "var(--nav-body-padding)",
  },
});
